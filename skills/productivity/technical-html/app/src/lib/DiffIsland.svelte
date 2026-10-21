<script lang="ts">
  // Interactive diff. The server HTML (declarative shadow roots, from build-time Pierre) is the first paint; on mount
  // Pierre's vanilla FileDiff class adopts those same containers (hydrate), so nothing is replaced and nothing flashes.
  import { FileDiff } from "@pierre/diffs";
  import type { FileDiffMetadata } from "@pierre/diffs";
  import { onMount } from "svelte";
  import { diffOptions, parseFiles, registerThemes, type DiffStyle } from "./pierre.ts";

  let { patch, lang, htmls }: { patch: string; lang?: string; htmls: string[] } = $props();
  let style: DiffStyle = $state("unified");
  let ready = $state(false);
  let instant = $state(false);
  let host: HTMLElement;
  let views: FileDiff[] = [];

  onMount(() => {
    let live = true;
    (async () => {
      await registerThemes(); // browser-side copy of the build's Pierre theme workaround
      if (!live) return;
      const containers = host.querySelectorAll<HTMLElement>("diffs-container");
      views = parseFiles(patch, lang).map((fileDiff: FileDiffMetadata, i: number) => {
        const view = new FileDiff(diffOptions("unified"));
        view.hydrate({ fileDiff, fileContainer: containers[i]! });
        return view;
      });
      ready = true;
    })();
    return () => { live = false; views.forEach((v) => v.cleanUp()); };
  });

  $effect(() => {
    const s = style; // tracked
    if (!ready) return;
    for (const v of views) { v.setOptions(diffOptions(s)); v.rerender(); }
  });
</script>

<div class="diff-island" class:instant>
<div class="seg" role="group" aria-label="Diff layout" data-on={style === "split" ? 1 : 0} class:ready>
  <span class="seg-thumb" aria-hidden="true"></span>
  {#each ["unified", "split"] as const as s}
    <!-- detail === 0: keyboard activation, so the thumb jumps instead of sliding -->
    <button type="button" aria-pressed={style === s} disabled={!ready}
      onclick={(e) => { instant = e.detail === 0; style = s; }}>{s}</button>
  {/each}
</div>
<div class="diff" bind:this={host}>{@html htmls.length ? htmls.join("") : "·"}</div>
</div>

<style>
  /* Segmented control. Outer radius 10 = inner 7 + 3px padding (nested radii share a centre). */
  .seg { --pad: 3px; position: relative; display: inline-grid; grid-template-columns: 1fr 1fr; margin: 20px 0 -8px; padding: var(--pad);
    border-radius: 10px; background: var(--tint); font: 600 12px var(--sans); opacity: .55; transition: opacity 150ms ease-out; }
  .seg.ready { opacity: 1; }
  .seg-thumb { position: absolute; inset: var(--pad) auto var(--pad) var(--pad); width: calc((100% - 2 * var(--pad)) / 2); border-radius: 7px;
    background: var(--paper); box-shadow: 0 0 0 1px var(--line), 0 1px 2px rgb(0 0 0 / .08);
    transform: translateX(calc(var(--on, 0) * 100%)); transition: transform 180ms cubic-bezier(0.23, 1, 0.32, 1); }
  .seg[data-on="1"] { --on: 1; }
  .instant .seg-thumb { transition: none; }
  .seg button { position: relative; min-width: 72px; padding: 5px 12px; border: 0; border-radius: 7px; background: none; color: var(--muted);
    font: inherit; cursor: pointer; transition: color 150ms ease-out, transform 120ms ease-out; }
  .seg button[aria-pressed="true"] { color: var(--ink); }
  .seg button:active:not(:disabled) { transform: scale(0.97); }
  .seg button:disabled { cursor: default; }
  .seg button:focus-visible { outline: 2px solid var(--blue); outline-offset: 1px; }
  @media (hover: hover) and (pointer: fine) { .seg button:not([aria-pressed="true"]):not(:disabled):hover { color: var(--ink); } }
  @media (prefers-reduced-motion: reduce) { .seg-thumb { transition: none; } }
</style>
