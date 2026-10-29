<script lang="ts">
  // A `::: files` block (plugins/fences.ts): a file tree beside one file's code, in one frame. The server HTML holds the
  // tree (@pierre/trees) and every file (build-time Pierre, with its path as the header), both in declarative shadow
  // roots, so with JavaScript off the tree and all the files show, stacked in the scrolling code pane. On mount the
  // vanilla FileTree adopts that tree (hydrate) and the code pane shows one file: the first, then whichever file the
  // reader selects in the tree. The code is not re-rendered, so the page ships no highlighter for it. Layout, the
  // frame's maximum height and colours: `.files` in style.css.
  import { FileTree } from "@pierre/trees";
  import { onMount } from "svelte";
  import { treeOptions } from "./tree.ts";

  // `style` sets the tree's --trees-theme-* colours from the Pierre theme; `tree` and `htmls` exist only on the server.
  let { id, paths, style, tree, htmls }: { id: string; paths: string[]; style: string; tree: string; htmls: string[] } = $props();
  const options = treeOptions(id, paths);
  let live = $state(false);
  let nav: HTMLElement;
  let code: HTMLElement;

  onMount(() => {
    const files = [...code.children] as HTMLElement[];
    // A newly chosen file opens at its first line, like a tab in an editor.
    const show = (path: string) => {
      files.forEach((file, i) => { file.hidden = paths[i] !== path; });
      code.scrollTo(0, 0);
    };
    const view = new FileTree({
      ...options,
      // A folder can be selected too; the code pane keeps the last file.
      onSelectionChange: (selected) => {
        const path = selected.findLast((p) => paths.includes(p));
        if (path !== undefined) show(path);
      },
    });
    view.hydrate({ fileTreeContainer: nav.querySelector<HTMLElement>("file-tree-container")! });
    show(paths[0]!);
    live = true;
    return () => view.cleanUp();
  });
</script>

<div class="files" class:live style="{style};--rows:{options.initialVisibleRowCount}">
  <nav class="files-tree" aria-label="Files" bind:this={nav}>{@html tree || "·"}</nav>
  <div class="files-code" bind:this={code}>{@html htmls.length ? htmls.join("") : "·"}</div>
</div>
