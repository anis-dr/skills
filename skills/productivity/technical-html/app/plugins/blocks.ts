// Remark plugin for the house dialect inside the body: wraps the `::: steps`, `card` and `footer` divs that
// plugins/divs.ts marked, turns `::: steps` lists into step cards, GitHub alerts into callouts and `status:` code spans
// into pills, and puts every table in a scrolling frame.
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { markers } from "./divs.ts";
import { esc, fail } from "./fail.ts";

export type Node = {
  type: string;
  value?: string;
  depth?: number;
  ordered?: boolean;
  spread?: boolean;
  lang?: string | null;
  meta?: string | null;
  children?: Node[];
  position?: { start: { line: number } };
  data?: { hName?: string; hProperties?: Record<string, unknown> };
};
export type File = { filename: string; data: { fm?: Record<string, unknown> } };

// An element the Markdown-to-HTML step renders from `data.hName`; its unknown type keeps tight lists from unwrapping it.
export const box = (type: string, hName: string, className: string[], children: Node[]): Node => ({
  type,
  data: { hName, hProperties: className.length === 0 ? {} : { className } },
  children,
});

export const PILLS: Record<string, string> = {
  built: "Built",
  gap: "Gap",
  partly: "Partly",
  none: "Not started",
  done: "Done",
  here: "We are here",
};
// mdsvex stores code spans and fences with `{`, `}`, `<` and `>` already as entities (and `&` as is).
// ponytail: so a literal `&lt;` typed in code also reads as `<`; keep the source text if that ever matters.
export const decode = (s: string) =>
  s.replace(/&#123;/g, "{").replace(/&#125;/g, "}").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

// `status:<kind>` or `status:<kind> Custom label` -> <span class="pill kind">label</span>; undefined if not a pill.
export function pill(code: string, file: string, line: number | undefined): string | undefined {
  const m = /^status:(\S*)(.*)$/s.exec(decode(code));
  if (m === null) return undefined;
  const kind = m[1] ?? "";
  const label = PILLS[kind];
  if (label === undefined) fail(file, line, `unknown status kind "${kind}" (known: ${Object.keys(PILLS).join(", ")})`);
  return `<span class="pill ${kind}">${esc((m[2] ?? "").trim() || label)}</span>`;
}

const DIV_TAGS: Record<string, [hName: string, className: string]> = {
  steps: ["div", "steps"],
  card: ["div", "card"],
  footer: ["footer", "doc-footer"],
};

const codes = (nodes: Node[], skipLists = false): string[] =>
  nodes.flatMap((n) =>
    n.type === "inlineCode" ? [decode(n.value ?? "")] : skipLists && n.type === "list" ? [] : codes(n.children ?? []),
  );

// One step card: done/here from its own pills, and a bold first line as the step title.
function step(item: Node): void {
  const own = codes(item.children ?? [], true);
  const state = own.some((c) => /^status:here\b/.test(c)) ? "here" : own.some((c) => /^status:done\b/.test(c)) ? "done" : "";
  if (state !== "") item.data = { hProperties: { className: [state] } };
  const first = item.children?.[0];
  if (first?.type !== "paragraph" || first.children?.[0]?.type !== "strong") return;
  const title: Node[] = [];
  const body: Node[] = [];
  let into = title;
  for (const n of first.children) {
    const nl = into === title && n.type === "text" ? (n.value ?? "").indexOf("\n") : -1;
    if (nl < 0) {
      into.push(n);
      continue;
    }
    title.push({ ...n, value: (n.value ?? "").slice(0, nl) });
    body.push({ ...n, value: (n.value ?? "").slice(nl + 1) });
    into = body;
  }
  item.children?.splice(0, 1, box("stepTitle", "p", ["step-title"], title), ...(body.length > 0 ? [box("stepBody", "p", [], body)] : []));
}

function steps(div: Node, file: string, line: number | undefined): void {
  const lists = (div.children ?? []).filter((n) => n.type === "list" && n.ordered === true);
  if (lists.length === 0) fail(file, line, '"::: steps" needs a numbered list');
  const here = codes(div.children ?? []).filter((c) => /^status:here\b/.test(c)).length;
  if (here > 1) fail(file, line, `"::: steps" has ${here} "here" pills; at most one step can be current`);
  for (const list of lists) {
    // Loose, so the title and body paragraphs keep their <p>.
    list.spread = true;
    for (const item of list.children ?? []) step(item);
  }
}

export const blocks = () => (tree: Node, file: File) => {
  const name = file.filename;
  const body: Node[] = [];
  let open: Node | undefined;
  const marks = markers.get(name);
  for (const node of tree.children ?? []) {
    const kind = node.type === "thematicBreak" ? marks?.get(node.position?.start.line ?? 0) : undefined;
    if (kind === undefined) {
      (open?.children ?? body).push(node);
    } else if (kind === "") {
      open = undefined;
    } else {
      const [hName, className] = DIV_TAGS[kind] ?? ["div", kind];
      open = box(`div-${kind}`, hName, [className], []);
      if (kind === "steps") open.position = node.position;
      body.push(open);
    }
  }
  tree.children = body;
  for (const div of body) if (div.type === "div-steps") steps(div, name, div.position?.start.line);

  visit(tree as never, (node: Node, index: number | undefined, parent: Node | undefined) => {
    if (parent === undefined || index === undefined) return;
    if (node.type === "blockquote") {
      // mdsvex's parser reads `[!NOTE]` as a shortcut link reference, followed by the rest of the line.
      const para = node.children?.[0];
      const [marker, rest] = para?.type === "paragraph" ? (para.children ?? []) : [];
      const m = marker?.type === "linkReference" ? /^!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)$/i.exec(toString(marker as never)) : null;
      if (m === null || m === undefined || para === undefined || (rest !== undefined && !/^[ \t]*(?:\n|$)/.test(rest.value ?? "x"))) return;
      const kind = (m[1] ?? "").toLowerCase();
      para.children?.shift();
      if (rest !== undefined) rest.value = (rest.value ?? "").replace(/^[ \t]*\n?/, "");
      if (rest?.value === "") para.children?.shift();
      if (para.children?.length === 0) node.children?.shift();
      node.data = { hName: "aside", hProperties: { className: ["callout", `callout-${kind}`] } };
      node.children?.unshift(box("calloutLabel", "p", ["callout-label"], [{ type: "text", value: `${kind[0]?.toUpperCase()}${kind.slice(1)}` }]));
    } else if (node.type === "inlineCode") {
      const html = pill(node.value ?? "", name, node.position?.start.line);
      if (html !== undefined) parent.children?.splice(index, 1, { type: "html", value: html });
    } else if (node.type === "table") {
      parent.children?.splice(index, 1, box("tableWrap", "div", ["table-wrap"], [node]));
      return index + 1; // past the frame; the table's own cells are still visited
    }
    return undefined;
  });
};
