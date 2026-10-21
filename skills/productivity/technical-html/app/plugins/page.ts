// Remark plugin for the page frame: checks the frontmatter, moves the first `#` heading into the header with the
// eyebrow, lede, meta and stat cards, gives every heading an id and adds the table of contents.
// `frontmatter` is mdsvex's YAML parser, so YAML errors carry the house messages too.
import { readFileSync } from "node:fs";
import { marked } from "marked";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { box, type File, type Node, pill } from "./blocks.ts";
import { esc, fail } from "./fail.ts";

const doc = () => process.env.TECHNICAL_HTML_DOC ?? "";

export function frontmatter(text: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(text);
  } catch (error) {
    fail(doc(), 2, `frontmatter is not valid YAML: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (parsed === null || parsed === undefined) return {};
  if (typeof parsed !== "object" || Array.isArray(parsed)) fail(doc(), 2, "frontmatter must be a YAML mapping");
  return parsed as Record<string, unknown>;
}

const TYPES = ["status", "design", "how-to", "reference"];
const TONES = ["good", "gap", "wait", "none"];

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");

export const page = () => (tree: Node, file: File) => {
  const name = file.filename;
  const fm = (file.data.fm ??= {});
  // File line of a frontmatter key, or of the n-th list item under it.
  const lines = readFileSync(name, "utf8").split("\n");
  const lineOf = (key: string, item?: number) => {
    const at = lines.findIndex((l) => new RegExp(`^${key}\\s*:`).test(l));
    if (at < 0 || item === undefined) return at + 1 || 1;
    const items = lines.flatMap((l, i) => (i > at && /^\s+-/.test(l) ? [i] : []));
    return (items[item] ?? at) + 1;
  };
  const text = (key: string): string | undefined => {
    const v = fm[key];
    if (v === undefined || v === null) return undefined;
    if (typeof v !== "string") fail(name, lineOf(key), `frontmatter "${key}" must be a string`);
    return v;
  };
  // One line of inline Markdown, pills included.
  const inline = (s: string, line: number) =>
    (marked.parseInline(s) as string)
      .replace(/[{}]/g, (c) => `&#${c.charCodeAt(0)};`)
      .replace(/<code>(status:[^<]*)<\/code>/g, (all, code: string) => pill(code, name, line) ?? all);

  const type = text("type");
  if (type !== undefined && !TYPES.includes(type)) fail(name, lineOf("type"), `frontmatter type "${type}" is unknown (${TYPES.join(", ")})`);
  const eyebrow = text("eyebrow");
  const lede = text("lede");
  const meta = text("meta");
  const stats = fm.stats ?? [];
  if (!Array.isArray(stats) || (stats.length !== 0 && (stats.length < 2 || stats.length > 4))) {
    fail(name, lineOf("stats"), "frontmatter stats must be a list of 2 to 4 cards (or omitted)");
  }
  const cards = (stats as unknown[]).map((raw, i) => {
    const card = (raw ?? {}) as Record<string, unknown>;
    const tone = card.tone ?? "none";
    if (typeof tone !== "string" || !TONES.includes(tone)) fail(name, lineOf("stats", i), `frontmatter stats[${i}].tone must be good, gap, wait or none`);
    if ((typeof card.value !== "string" && typeof card.value !== "number") || typeof card.label !== "string") {
      fail(name, lineOf("stats", i), `frontmatter stats[${i}] needs a value and a label`);
    }
    return `<div class="stat ${tone}"><b>${esc(String(card.value))}</b><span>${inline(String(card.label), lineOf("stats", i))}</span></div>`;
  });
  const tocSetting = fm.toc ?? "auto";
  if (tocSetting !== "auto" && typeof tocSetting !== "boolean") fail(name, lineOf("toc"), "frontmatter toc must be auto, true or false");

  let h1: { node: Node; parent: Node } | undefined;
  const h2s: { id: string; text: string }[] = [];
  const ids = new Map<string, number>();
  visit(tree as never, "heading", (node: Node, _index: number | undefined, parent: Node | undefined) => {
    if (h1 === undefined && node.depth === 1 && parent !== undefined) {
      h1 = { node, parent };
      return;
    }
    const base = slug(toString(node as never));
    const n = ids.get(base) ?? 0;
    ids.set(base, n + 1);
    const id = n === 0 ? base : `${base}-${n}`;
    node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
    if (node.depth === 2) h2s.push({ id, text: toString(node as never) });
  });
  if (h1 === undefined) return fail(name, 1, "no H1: the document needs a `# Title` heading");
  h1.parent.children?.splice(h1.parent.children.indexOf(h1.node), 1);
  fm.title = toString(h1.node as never);

  const html = (value: string): Node => ({ type: "html", value });
  const header = box("docHeader", "header", ["doc-header"], [
    ...(eyebrow === undefined ? [] : [html(`<p class="eyebrow">${esc(eyebrow)}</p>`)]),
    h1.node,
    ...(lede === undefined ? [] : [html(`<p class="lede">${inline(lede, lineOf("lede"))}</p>`)]),
    ...(meta === undefined ? [] : [html(`<p class="meta">${inline(meta, lineOf("meta"))}</p>`)]),
    ...(cards.length === 0 ? [] : [html(`<div class="stats">${cards.join("")}</div>`)]),
  ]);
  const showToc = h2s.length > 0 && (tocSetting === "auto" ? h2s.length >= 4 : tocSetting === true);
  const toc = `<nav class="toc" aria-label="Contents">\n<ol>\n${h2s.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("\n")}\n</ol>\n</nav>`;
  tree.children?.unshift(header, ...(showToc ? [html(toc)] : []));
};
