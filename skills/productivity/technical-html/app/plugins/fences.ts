// Remark plugin for fenced code, build time only. Renders each fence to HTML:
//   ```d2    -> <figure class="diagram" id> with "Figure N" (numbered by plugins/figures.ts) and the italic paragraph
//               after it as <figcaption>; a missing caption, or one that is a sentence rather than a name, fails
//   ```diff  -> Pierre diff; a git diff with 2+ files becomes the hydrated <DiffIsland>; `split` in the meta splits it
//   a Shiki language or `pseudo` -> Pierre file view;  anything else -> <pre data-lang>
// It also marks the document interactive (metadata.interactive, read by src/routes/+page.ts) when it holds an island,
// or when a .svx document has a <script> or a component, and imports DiffIsland into the document's one <script>.
import { preloadFile, preloadFileDiff } from "@pierre/diffs/ssr";
import { getFiletypeFromFileName } from "@pierre/diffs";
import { toString } from "mdast-util-to-string";
import { fileURLToPath } from "node:url";
import { visit } from "unist-util-visit";
import { diffOptions, parseFiles, registerThemes } from "../src/lib/pierre.ts";
import type { File, Node } from "./blocks.ts";
import { box, decode } from "./blocks.ts";
import { d2 } from "./d2.ts";
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

type Job = { node: Node; parent: Node; caption?: Node; render: Promise<Node> };

export const fences = () => async (tree: Node, file: File) => {
  await registerThemes();
  const name = file.filename;
  const jobs: Job[] = [];
  let islands = false;

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
    islands = true;
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
      const svg = d2(node.value ?? "", name, at);
      const label = html(`<span class="fig-num">Figure ${n}</span> `);
      const figure = box("figure", "figure", ["diagram"], [html(ssrOnly(svg)), box("figcaption", "figcaption", [], [label, ...(em.children ?? [])])]);
      figure.data!.hProperties = { ...figure.data!.hProperties, id };
      jobs.push({ node, parent, caption: next, render: Promise.resolve(figure) });
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
    siblings.splice(siblings.indexOf(job.node), job.caption === undefined ? 1 : 2, replacement);
  }

  const svx = name.endsWith(".svx");
  let svelte = false;
  visit(tree as never, "html", (node: Node) => {
    if (/^<script\b|<[A-Z]/.test(node.value ?? "")) svelte = true;
  });
  (file.data.fm ??= {}).interactive = islands || (svx && svelte);
  if (!islands) return;
  // An absolute path: the document may live anywhere, outside this app's `#lib` import map.
  const line = `import DiffIsland from ${JSON.stringify(fileURLToPath(new URL("../src/lib/DiffIsland.svelte", import.meta.url)))};`;
  const script = tree.children?.find((n) => n.type === "html" && /^<script(?![^>]*\bcontext=)[^>]*>/.test(n.value ?? ""));
  if (script === undefined) tree.children?.unshift(html(`<script>${line}</script>`));
  else script.value = (script.value ?? "").replace(/^<script[^>]*>/, (open) => `${open}\n${line}`);
};
