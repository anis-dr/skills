// Remark plugin for `.md` documents only, run last. Svelte reads `{` and `}` in markup as expressions, so literal
// braces in prose become HTML entities. Code spans and fences are escaped by mdsvex and plugins/fences.ts; `.svx`
// documents keep their braces for Svelte.
import { visit } from "unist-util-visit";
import type { File, Node } from "./blocks.ts";
import { esc } from "./fail.ts";

export const escapeMarkdown = () => (tree: Node, file: File) => {
  if (!file.filename.endsWith(".md")) return;
  visit(tree as never, (node: Node & { url?: string; title?: string | null; alt?: string | null }, index: number | undefined, parent: Node | undefined) => {
    if (node.type === "text" && index !== undefined && parent !== undefined && /[{}]/.test(node.value ?? "")) {
      parent.children?.splice(index, 1, { type: "html", value: esc(node.value ?? "") });
    }
    // Attributes. mdsvex decodes percent escapes in URLs, so a brace in a URL becomes an entity on the element itself.
    if (node.url !== undefined && /[{}]/.test(node.url)) {
      const attr = node.type === "image" ? "src" : "href";
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, [attr]: node.url.replace(/[{}]/g, (c) => `&#${c.charCodeAt(0)};`) } };
    }
    for (const key of ["title", "alt"] as const) {
      const v = node[key];
      if (typeof v === "string") node[key] = v.replace(/[{}]/g, (c) => `&#${c.charCodeAt(0)};`);
    }
  });
};
