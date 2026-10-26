// Remark plugin for figure numbers, build time only. Every ```d2 fence carries a label in its meta (```d2 #fig:sync);
// figures are numbered in document order before anything else reads them, so a reference may come before its figure.
// `[@fig:sync]` in prose becomes a link reading "Figure 1". It runs before plugins/cite.ts, which would otherwise read
// `[@fig:sync]` as a citation, and tags each d2 node with its id and number for plugins/fences.ts to render.
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import type { File, Node } from "./blocks.ts";
import { esc, fail } from "./fail.ts";

export type Figure = { id: string; n: number };
export type FigureNode = Node & { figure?: Figure };

const LABEL = /^#fig:([A-Za-z0-9_-]+)$/;
const REF = /^@fig:([A-Za-z0-9_-]+)$/;
// "Figure 2", "Fig. 2", "figures 2": a number the writer typed, which goes stale when a figure is added above it.
const TYPED = /\bfig(?:ure)?s?\.?\s+\d/i;

export const figures = () => (tree: Node, file: File) => {
  const doc = file.filename;
  const labels = new Map<string, Figure & { line: number; used: boolean }>();

  visit(tree as never, "code", (node: FigureNode) => {
    if (node.lang !== "d2") return;
    const line = node.position?.start.line ?? 1;
    const meta = (node.meta ?? "").trim();
    const m = LABEL.exec(meta);
    if (m === null) {
      fail(doc, line, meta === "" ? "diagram has no label; add one after the language, e.g. ```d2 #fig:sync, and refer to it with [@fig:sync]" : `diagram label "${meta}" is not #fig:<name> (letters, digits, - and _)`);
    }
    const label = m[1]!;
    const seen = labels.get(label);
    if (seen !== undefined) fail(doc, line, `figure label "#fig:${label}" is already used at line ${seen.line}`);
    const figure = { id: `fig-${label}`, n: labels.size + 1 };
    labels.set(label, { ...figure, line, used: false });
    node.figure = figure;
  });

  visit(tree as never, (node: Node & { referenceType?: string }, index: number | undefined, parent: Node | undefined) => {
    const line = node.position?.start.line;
    if (node.type === "text" && TYPED.test(node.value ?? "")) {
      fail(doc, line, `"${TYPED.exec(node.value ?? "")![0]}…" is a figure number typed by hand; refer to the figure with [@fig:<name>]`);
    }
    if (node.type !== "linkReference" || node.referenceType !== "shortcut" || index === undefined || parent === undefined) return;
    const text = toString(node as never);
    if (!text.includes("@fig:")) return;
    const m = REF.exec(text.trim());
    if (m === null) fail(doc, line, `"[${text}]" mixes figures with other references; refer to one figure per brackets, e.g. [@fig:sync]`);
    const figure = labels.get(m[1]!);
    if (figure === undefined) fail(doc, line, `unknown figure "@fig:${m[1]}"`);
    figure.used = true;
    parent.children?.splice(index, 1, { type: "html", value: `<a class="xref" href="#${esc(figure.id)}">Figure ${figure.n}</a>` });
    return index + 1;
  });

  for (const [label, figure] of labels) {
    if (!figure.used) fail(doc, figure.line, `figure "#fig:${label}" is never referenced; refer to it in the prose with [@fig:${label}]`);
  }
};
