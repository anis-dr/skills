// Remark plugin for fenced code, build time only. Renders each fence to HTML:
//   ```d2    -> <figure class="diagram" id> with "Figure N" (numbered by plugins/figures.ts) and the italic paragraph
//               after it as <figcaption>; a missing caption, or one that is a sentence rather than a name, fails.
//               A figure with a key (d2-legend, see plugins/d2.ts) or a read fence gets a hydrated <DiagramTools>
//               after its figcaption.
//   ```read #fig:<name> -> nothing; its lines `ids: One short sentence.` become the figure's read steps, each id a
//               d2 id or edge (`model -> check`) of that figure. It may sit anywhere in the document.
//   ```diff  -> Pierre diff; a git diff with 2+ files becomes the hydrated <DiffIsland>; `split` in the meta splits it
//   a Shiki language or `pseudo` -> Pierre file view;  anything else -> <pre data-lang>
// It also marks the document interactive (metadata.interactive, read by src/routes/+page.ts) when it holds an island,
// or when a .svx document has a <script> or a component, and imports the islands it uses into the document's one
// <script>.
import { preloadFile, preloadFileDiff } from "@pierre/diffs/ssr";
import { getFiletypeFromFileName } from "@pierre/diffs";
import { toString } from "mdast-util-to-string";
import { fileURLToPath } from "node:url";
import { visit } from "unist-util-visit";
import { diffOptions, parseFiles, registerThemes } from "../src/lib/pierre.ts";
import type { File, Node } from "./blocks.ts";
import { box, decode } from "./blocks.ts";
import { d2, edgeKey } from "./d2.ts";
import type { FigureNode } from "./figures.ts";
import { esc, fail } from "./fail.ts";
import { asPatch, fenceWords, hasHeaders, isLang } from "./fence.ts";

// Languages the islands re-highlight in the browser; vite.config.js turns them into the client's `shiki/langs`.
export const islandLangs = new Set<string>();

// Rendered HTML only exists on the server: `import.meta.env.SSR` is a build-time constant, so the client bundle gets
// a placeholder (Svelte hydration keeps the server DOM; it only needs a non-empty value) and drops the string.
const ssrOnly = (s: string) => `{@html import.meta.env.SSR ? ${JSON.stringify(s)} : "·"}`;
const html = (value: string): Node => ({ type: "html", value });
// A static render drops Pierre's 16 kB icon sprite when nothing in it uses an icon; an island keeps it for re-renders.
const shadow = (h: string, island = false) =>
  `<diffs-container><template shadowrootmode="open">${island || h.includes("<use") ? h : h.replace(/<svg data-icon-sprite[\s\S]*?<\/svg>\s*/, "")}</template></diffs-container>`;

// A diagram caption names the figure, like a title; longer text is an explanation and belongs in the prose.
const CAPTION_WORDS = 10;
// A read step is one short sentence.
const STEP_WORDS = 20;

// `render` resolves to undefined for a fence that renders nothing (```read).
type Job = { node: Node; parent: Node; caption?: Node; render: Promise<Node | undefined> };
type Read = { at: number; steps: { line: number; ids: string[]; text: string }[] };

// The ```read fences, by figure id (`fig-<name>`), checked against the document's figure labels.
function readFences(tree: Node, name: string): Map<string, Read> {
  const figures = new Set<string>();
  const reads = new Map<string, Read>();
  visit(tree as never, "code", (node: FigureNode) => {
    const at = node.position?.start.line ?? 1;
    if (node.lang === "d2") figures.add(node.figure!.id);
    if (node.lang !== "read") return;
    const label = /^#fig:([A-Za-z0-9_-]+)$/.exec((node.meta ?? "").trim())?.[1];
    if (label === undefined) fail(name, at, "read fence has no figure label; write ```read #fig:<name> for the figure it walks through");
    const seen = reads.get(`fig-${label}`);
    if (seen !== undefined) fail(name, at, `figure "#fig:${label}" already has a read fence at line ${seen.at}`);
    const steps = decode(node.value ?? "").split("\n").flatMap((l, i) => {
      const line = at + 1 + i;
      if (l.trim() === "") return [];
      const colon = l.indexOf(": ");
      if (colon < 0) fail(name, line, 'read step is not "ids: One short sentence."');
      const ids = l.slice(0, colon).split(",").map((id) => id.trim());
      if (ids.some((id) => id === "")) fail(name, line, "read step has an empty id; separate d2 ids with commas");
      const text = l.slice(colon + 2).trim();
      if (text.split(/\s+/).length > STEP_WORDS || /[.!?]\s+\S/.test(text)) {
        fail(name, line, `read step is more than one short sentence; keep it to one sentence of at most ${STEP_WORDS} words`);
      }
      return [{ line, ids, text }];
    });
    if (steps.length === 0) fail(name, at, "read fence has no steps");
    reads.set(`fig-${label}`, { at, steps });
  });
  for (const [id, read] of reads) if (!figures.has(id)) fail(name, read.at, `read fence names unknown figure "#${id.replace("-", ":")}"`);
  return reads;
}

export const fences = () => async (tree: Node, file: File) => {
  await registerThemes();
  const name = file.filename;
  const jobs: Job[] = [];
  // The island components the document uses, imported into its <script>.
  const islands = new Set<"DiffIsland" | "DiagramTools">();
  const reads = readFences(tree, name);

  async function diff(node: Node, at: number): Promise<Node> {
    const value = node.value ?? "";
    const m = fenceWords(node.meta ?? undefined);
    const headers = hasHeaders(value);
    if (!headers && m.lang === undefined) {
      fail(name, at, "```diff without file headers needs a language or a file path, e.g. ```diff ts or ```diff apps/sapio/agent.ts");
    }
    const patch = asPatch(value, m.path);
    let files: ReturnType<typeof parseFiles> = [];
    try {
      files = parseFiles(patch, m.lang);
    } catch (error) {
      fail(name, at, `diff does not parse: ${error instanceof Error ? error.message : String(error)}`);
    }
    const island = (patch.match(/^diff --git /gm) ?? []).length > 1;
    const htmls = await Promise.all(
      files.map(async (fileDiff) => shadow((await preloadFileDiff({ fileDiff, options: diffOptions(m.split ? "split" : "unified", !headers && m.path === undefined) })).prerenderedHTML, island)),
    );
    if (!island) return html(`<div class="diff">${ssrOnly(htmls.join(""))}</div>`);
    islands.add("DiffIsland");
    for (const f of files) islandLangs.add(m.lang ?? f.lang ?? getFiletypeFromFileName(f.name));
    return html(`<DiffIsland patch={${JSON.stringify(patch)}} lang={${JSON.stringify(m.lang)}} htmls={import.meta.env.SSR ? ${JSON.stringify(htmls)} : []} />`);
  }

  visit(tree as never, "code", (node: Node, index: number | undefined, parent: Node | undefined) => {
    if (parent === undefined || index === undefined) return;
    node.value = decode(node.value ?? "");
    const at = node.position?.start.line ?? 1;
    const lang = node.lang ?? "";
    if (lang === "d2") {
      // Caption: the next paragraph, which must be entirely italic.
      const next = parent.children?.[index + 1];
      const em = next?.type === "paragraph" && next.children?.length === 1 ? next.children[0] : undefined;
      if (em?.type !== "emphasis") fail(name, at, "diagram has no caption; put an italic paragraph (*...*) right after the closing fence");
      // The caption is the figure's name; how to read the diagram goes in the prose beside it.
      const caption = toString(em as never).trim();
      if (caption.split(/\s+/).length > CAPTION_WORDS || /[.!?](\s|$)/.test(caption)) {
        fail(name, at, `diagram caption is a sentence; name the figure in at most ${CAPTION_WORDS} words with no full stop, and put any reading guide in the prose`);
      }
      const { id, n } = (node as FigureNode).figure!;
      const { svg, legend, ids } = d2(node.value ?? "", name, at, id);
      // Each read id is a d2 id or an edge as written in d2 (`a -> b` matches every a -> b edge).
      const steps = (reads.get(id)?.steps ?? []).map((step) => ({
        text: step.text,
        targets: [...new Set(step.ids.flatMap((d2id) => {
          const edge = /^(.*?)\s*(<->|->|<-|--)\s*(.*)$/.exec(d2id);
          const tokens = ids.get(edge === null ? d2id : edgeKey(edge[1]!, edge[2]!, edge[3]!));
          return tokens ?? fail(name, step.line, `"${d2id}" is not in figure "#${id.replace("-", ":")}"`);
        }))],
      }));
      const label = html(`<span class="fig-num">Figure ${n}</span> `);
      const children = [html(ssrOnly(svg)), box("figcaption", "figcaption", [], [label, ...(em.children ?? [])])];
      if (legend.length > 0 || steps.length > 0) {
        islands.add("DiagramTools");
        children.push(html(`<DiagramTools legend={${JSON.stringify(legend)}} steps={${JSON.stringify(steps)}} />`));
      }
      const figure = box("figure", "figure", ["diagram"], children);
      figure.data!.hProperties = { ...figure.data!.hProperties, id };
      jobs.push({ node, parent, caption: next, render: Promise.resolve(figure) });
    } else if (lang === "read") {
      jobs.push({ node, parent, render: Promise.resolve(undefined) });
    } else if (lang === "diff") {
      jobs.push({ node, parent, render: diff(node, at) });
    } else if (isLang(lang)) {
      const render = preloadFile({ file: { name: `code.${lang}`, contents: node.value ?? "", lang }, options: { overflow: "wrap", disableFileHeader: true } });
      jobs.push({ node, parent, render: render.then((r) => html(ssrOnly(shadow(r.prerenderedHTML)))) });
    } else {
      jobs.push({ node, parent, render: Promise.resolve(html(`<pre data-lang="${esc(lang)}"><code>${esc(node.value ?? "")}</code></pre>`)) });
    }
  });
  for (const job of jobs) {
    const replacement = await job.render;
    const siblings = job.parent.children ?? [];
    const at = siblings.indexOf(job.node);
    const count = job.caption === undefined ? 1 : 2;
    if (replacement === undefined) siblings.splice(at, count);
    else siblings.splice(at, count, replacement);
  }

  const svx = name.endsWith(".svx");
  let svelte = false;
  visit(tree as never, "html", (node: Node) => {
    if (/^<script\b|<[A-Z]/.test(node.value ?? "")) svelte = true;
  });
  (file.data.fm ??= {}).interactive = islands.size > 0 || (svx && svelte);
  if (islands.size === 0) return;
  // An absolute path: the document may live anywhere, outside this app's `#lib` import map.
  const imports = [...islands]
    .map((c) => `import ${c} from ${JSON.stringify(fileURLToPath(new URL(`../src/lib/${c}.svelte`, import.meta.url)))};`)
    .join("\n");
  const script = tree.children?.find((n) => n.type === "html" && /^<script(?![^>]*\bcontext=)[^>]*>/.test(n.value ?? ""));
  if (script === undefined) tree.children?.unshift(html(`<script>${imports}</script>`));
  else script.value = (script.value ?? "").replace(/^<script[^>]*>/, (open) => `${open}\n${imports}`);
};
