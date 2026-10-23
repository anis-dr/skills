// Remark plugin for citations: reads the document's BibTeX file (`<doc>.bib` beside it, or frontmatter
// `bibliography`), turns each `[@key]` or `[@a; @b]` into numbered links in first-citation order, and adds the
// Sources section before the `::: footer` (or at the end). It runs after plugins/blocks.ts, which wraps the footer, and
// before plugins/page.ts, which gives the Sources h2 its id and puts it in the table of contents.
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { type Entry, parse } from "@retorquere/bibtex-parser";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { box, type File, type Node } from "./blocks.ts";
import { esc, fail } from "./fail.ts";

// `[@a]` and `[@a; @b]`, which mdsvex reads as shortcut link references.
const CITATION = /^@[^\s;@\]]+(?:\s*;\s*@[^\s;@\]]+)*$/;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Rich-text fields come back as HTML with the parser's own tags (`<i>`, `<b>`) and a bare `&`.
const rich = (s: string) => s.replace(/[&{}]/g, (c) => `&#${c.charCodeAt(0)};`);
const lineAt = (text: string, offset: number) => (offset < 0 ? 1 : text.slice(0, offset).split("\n").length);

// `2026-10-16` -> `16 Oct 2026`; `2026-10` -> `Oct 2026`; anything else as written.
function day(s: string): string {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(s.trim());
  const month = MONTHS[Number(m?.[2]) - 1];
  if (m === null || month === undefined) return s;
  return m[3] === undefined ? `${month} ${m[1]}` : `${Number(m[3])} ${month} ${m[1]}`;
}

function bibliography(file: File): { path: string; text: string } | undefined {
  const doc = file.filename;
  const set = file.data.fm?.bibliography;
  if (set !== undefined && set !== null) {
    const lines = readFileSync(doc, "utf8").split("\n");
    const line = lines.findIndex((l) => /^bibliography\s*:/.test(l)) + 1 || 1;
    if (typeof set !== "string") fail(doc, line, 'frontmatter "bibliography" must be a string');
    const path = resolve(dirname(doc), set);
    if (!existsSync(path)) fail(doc, line, `cannot read bibliography "${set}"`);
    return { path, text: readFileSync(path, "utf8") };
  }
  const path = doc.replace(/\.(md|svx)$/i, ".bib");
  return existsSync(path) ? { path, text: readFileSync(path, "utf8") } : undefined;
}

// One entry: title (linked when there is a url), author or organisation, year, path, commit, read date, note.
function format(entry: Entry): string {
  const f = entry.fields;
  const title = f.title === undefined ? undefined : f.url === undefined ? rich(f.title) : `<a href="${esc(f.url)}">${rich(f.title)}</a>`;
  const names = (f.author ?? []).map((c) => c.name ?? [c.firstName, c.prefix, c.lastName, c.suffix].filter(Boolean).join(" "));
  const who = names.length > 0 ? names : (f.organization ?? f.publisher ?? (f.howpublished === undefined ? [] : [f.howpublished]));
  const when = f.date ?? f.year;
  const head = [
    ...(title === undefined ? [] : [`<strong>${title}</strong>`]),
    ...(who.length === 0 ? [] : [rich(who.join(", "))]),
    ...(when === undefined ? [] : [esc(day(when))]),
    ...(f.path === undefined ? [] : [`<code>${esc(f.path)}</code>`]),
  ].join(", ");
  const at = f.version === undefined ? "" : ` at <code>${esc(f.version)}</code>`;
  return [
    ...(head + at === "" ? [] : [`${head}${at}.`]),
    ...(f.urldate === undefined ? [] : [`Read ${esc(day(f.urldate))}.`]),
    ...(f.note === undefined ? [] : [rich(f.note)]),
  ].join(" ");
}

export const cite = () => (tree: Node, file: File) => {
  const doc = file.filename;
  const bib = bibliography(file);
  const entries = new Map<string, Entry>();
  if (bib !== undefined) {
    // Titles keep their case; a path or commit is read as typed, so `~` and `_` stay themselves.
    const library = parse(bib.text, { english: false, fieldMode: { path: "verbatim", version: "verbatim" } });
    const error = library.errors[0];
    if (error !== undefined) {
      fail(bib.path, lineAt(bib.text, error.input === undefined ? -1 : bib.text.indexOf(error.input)), `bibliography does not parse: ${error.error}`);
    }
    for (const entry of library.entries) entries.set(entry.key, entry);
  }

  // Key -> its number and the section each citation site sits in, in first-citation order. The section is the text of
  // the nearest preceding `##` heading; before the first one it is the `#` title, or "Introduction".
  const cited = new Map<string, { entry: Entry; n: number; sites: string[] }>();
  let place = typeof file.data.fm?.title === "string" ? file.data.fm.title : "Introduction";
  const test = (n: Node & { depth?: number }) => n.type === "linkReference" || (n.type === "heading" && (n.depth ?? 0) <= 2);
  visit(tree as never, test as never, (node: Node & { referenceType?: string; depth?: number }, index: number | undefined, parent: Node | undefined) => {
    if (node.type === "heading") {
      place = toString(node as never);
      return;
    }
    const label = toString(node as never);
    if (node.referenceType !== "shortcut" || !CITATION.test(label) || index === undefined || parent === undefined) return;
    const line = node.position?.start.line;
    if (bib === undefined) fail(doc, line, `citations need a bibliography: add ${basename(doc).replace(/\.(md|svx)$/i, ".bib")}`);
    const links = label
      .split(";")
      .map((k) => k.trim().slice(1))
      .map((key) => {
        const entry = entries.get(key);
        if (entry === undefined) fail(doc, line, `unknown citation "@${key}"`);
        const c = cited.get(key) ?? { entry, n: cited.size + 1, sites: [] };
        c.sites.push(place);
        cited.set(key, c);
        return { key, n: c.n, site: c.sites.length };
      })
      .sort((a, b) => a.n - b.n);
    const link = (l: (typeof links)[number], text: string) =>
      `<a class="cite" href="#ref-${esc(l.key)}" id="cite-${esc(l.key)}-${l.site}">${text}</a>`;
    // Each source is its own marker with its own brackets: [@a; @b] renders [1][2].
    const value = links.map((l) => link(l, `[${l.n}]`)).join("");
    parent.children?.splice(index, 1, { type: "html", value });
    return index + 1;
  });

  if (bib !== undefined) {
    for (const entry of entries.values()) {
      if (!cited.has(entry.key)) fail(bib.path, lineAt(bib.text, bib.text.indexOf(entry.input)), `source "${entry.key}" is never cited`);
    }
  }
  if (cited.size === 0) return;

  // Each entry ends with `Cited in: A, B²`. Each heading appears once and links to its first site; a further site under
  // the same heading adds a raised numeral (its place within that heading) linking to it.
  const items = [...cited].map(([key, c]) => {
    const total = c.sites.length;
    const href = (site: number) => `#cite-${esc(key)}-${site}`;
    const groups = new Map<string, number[]>();
    c.sites.forEach((name, i) => groups.set(name, [...(groups.get(name) ?? []), i + 1]));
    const label = (site: number, name: string) => `Back to citation ${site} of ${total}, in ${esc(name)}`;
    const names = [...groups].map(([name, sites]) => {
      const more = sites.slice(1).map((site, i) => `<a class="backref backref-n" href="${href(site)}" aria-label="${label(site, name)}">${i + 2}</a>`);
      return `<a class="backref" href="${href(sites[0]!)}" aria-label="${label(sites[0]!, name)}">${esc(name)}</a>${more.join("")}`;
    });
    return `<li id="ref-${esc(key)}">${format(c.entry)}<span class="cited-in">Cited in: ${names.join(", ")}</span></li>`;
  });
  const heading: Node = { type: "heading", depth: 2, children: [{ type: "text", value: "Sources" }] };
  const section = box("docSources", "section", ["doc-sources"], [heading, { type: "html", value: `<ol>\n${items.join("\n")}\n</ol>` }]);
  // page.ts names the heading later (`sources`, or `sources-1` after an earlier "Sources" heading), so the label is
  // read when the HTML is made.
  section.data = {
    ...section.data,
    hProperties: {
      ...section.data?.hProperties,
      get ariaLabelledBy() {
        return heading.data?.hProperties?.id;
      },
    },
  };
  const children = (tree.children ??= []);
  const footer = children.findIndex((n) => n.type === "div-footer");
  children.splice(footer < 0 ? children.length : footer, 0, section);
};
