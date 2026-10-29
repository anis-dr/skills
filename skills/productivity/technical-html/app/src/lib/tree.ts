// @pierre/trees options for a `::: files` block, shared by the build (plugins/fences.ts preloads the tree) and
// FilesIsland.svelte (hydrates it): both sides must build the same tree, or hydration does not match.
import { FileTree } from "@pierre/trees";

export function treeOptions(id: string, paths: string[]) {
  const options = { id, paths, initialExpansion: "open" as const, flattenEmptyDirectories: true, initialSelectedPaths: paths.slice(0, 1) };
  // Render every row on the server, so the whole tree shows with JavaScript off and needs no inner scroll.
  const probe = new FileTree(options);
  const rows = probe.getVisibleCount();
  probe.cleanUp();
  return { ...options, initialVisibleRowCount: rows };
}
