<script lang="ts">
  // Key and Read for one d2 figure. Rendered by plugins/fences.ts as the figure's last child, after <figcaption>:
  //   Key  - the d2-legend the author declared: one swatch (d2's own drawing) and a short label per item. Pointing at or
  //          focusing a row keeps the diagram parts drawn that way at full opacity and dims the rest.
  //   Read - a walkthrough, one short sentence per step; each step keeps its nodes and edges lit and dims the rest.
  // Both are native popovers (top layer, so the figure's overflow never clips them; light dismiss; opening one closes
  // the other). They sit under their button through CSS anchor positioning, or a measured fallback without it. They
  // stay DOM children of the figure, so the house dark remap (`figure.diagram svg [fill=…]`) also recolours swatches.
  // Highlighting only sets data-dim on d2's own groups; style.css turns that into opacity.
  import { onMount, tick } from "svelte";

  type LegendItem = { label: string; kind: "node" | "edge"; svg: string; targets: string[] };
  type Step = { text: string; targets: string[] };

  let { legend, steps }: { legend: LegendItem[]; steps: Step[] } = $props();

  // Unique per figure: popover ids and anchor names must not collide when a page has several figures.
  const propsId = $props.id();
  const uid = `fig-tools-${propsId.replace(/[^\w-]/g, "")}`;
  const nodes = $derived(legend.flatMap((item, i) => (item.kind === "node" ? [{ item, i }] : [])));
  const edges = $derived(legend.flatMap((item, i) => (item.kind === "edge" ? [{ item, i }] : [])));

  let root: HTMLElement;
  let keyBtn = $state<HTMLButtonElement>();
  let readBtn = $state<HTMLButtonElement>();
  let keyPop = $state<HTMLElement>();
  let readPop = $state<HTMLElement>();
  let keyList = $state<HTMLElement>();
  let backBtn = $state<HTMLButtonElement>();
  let nextBtn = $state<HTMLButtonElement>();

  let keyOpen = $state(false);
  let readOpen = $state(false);
  let hot = $state<number | null>(null);
  let step = $state(0);
  let readLabel = $state("Read the figure");
  let keyByKeyboard = false;

  // The step sentence: layers share one grid cell, so a new step cross-fades over the old one (style.css). At most two:
  // a quick second press drops the layer that was already leaving.
  let layerId = 1;
  let layers = $state([{ id: 0, step: 0, entering: false, leaving: false }]);
  let fadeTimer: ReturnType<typeof setTimeout> | undefined;

  const last = $derived(steps.length - 1);
  const done = $derived(step >= last);
  const lit = $derived(
    keyOpen && hot !== null ? (legend[hot]?.targets ?? null) : readOpen ? (steps[step]?.targets ?? null) : null,
  );

  // d2 writes each node and edge as <g class="<base64 id>[ <class>]">; index the diagram's groups by that first token.
  let diagram: SVGSVGElement | null = null;
  let parts: Map<string, SVGGElement> | null = null;
  function index(): Map<string, SVGGElement> {
    if (parts) return parts;
    const figure = root.closest("figure");
    diagram = figure?.querySelector<SVGSVGElement>(":scope > svg") ?? null;
    parts = new Map();
    for (const g of diagram?.querySelectorAll<SVGGElement>("g[class]") ?? []) {
      const token = g.classList[0];
      if (token && !parts.has(token)) parts.set(token, g);
    }
    return parts;
  }

  // Lit: each target and its ancestors up to the diagram. Dimmed: every sibling group of a lit element. Nothing else
  // changes, so closing restores the diagram exactly.
  function highlight(targets: string[] | null) {
    const map = index();
    if (!diagram) return;
    for (const el of diagram.querySelectorAll("[data-dim]")) el.removeAttribute("data-dim");
    if (!targets?.length) return;
    const on = new Set<Element>();
    for (const t of targets) {
      for (let el: Element | null = map.get(t) ?? null; el && el !== diagram; el = el.parentElement) on.add(el);
    }
    for (const el of on) {
      for (const sib of el.parentElement?.children ?? []) {
        if (sib instanceof SVGGElement && !on.has(sib)) sib.setAttribute("data-dim", "");
      }
    }
  }
  $effect(() => highlight(lit));

  // CSS anchor positioning places each popover under its button. Without it, the same spot is measured here and kept
  // in step with scrolling and resizing while a popover is open.
  const anchored = typeof CSS !== "undefined" && CSS.supports("anchor-name: --a");
  function place() {
    if (anchored) return;
    const width = document.documentElement.clientWidth;
    // Below 520px style.css spans the popover across the viewport; only its top follows the button.
    const narrow = matchMedia("(max-width: 520px)").matches;
    for (const [btn, pop] of [[keyBtn, keyPop], [readBtn, readPop]] as const) {
      if (!btn || !pop?.matches(":popover-open")) continue;
      const r = btn.getBoundingClientRect();
      pop.style.top = `${r.bottom}px`;
      pop.style.right = narrow ? "" : `${width - r.right}px`;
    }
  }
  $effect(() => {
    if (anchored || !(keyOpen || readOpen)) return;
    place();
    addEventListener("scroll", place, { capture: true, passive: true });
    addEventListener("resize", place, { passive: true });
    return () => {
      removeEventListener("scroll", place, { capture: true });
      removeEventListener("resize", place);
    };
  });

  onMount(() => {
    const num = root.closest("figure")?.querySelector("figcaption .fig-num")?.textContent?.trim();
    if (num) readLabel = `Read ${num}`;
    return () => {
      clearTimeout(fadeTimer);
      highlight(null);
    };
  });

  const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Opened by pointer, focus rests on the list so nothing lights up until a row is pointed at; opened by keyboard,
  // focus goes to the first row (which lights its parts).
  function keyToggled(e: Event) {
    keyOpen = (e as ToggleEvent).newState === "open";
    if (!keyOpen) {
      hot = null;
      return;
    }
    place();
    const first = keyList?.querySelector<HTMLElement>("li");
    (keyByKeyboard && first ? first : keyList)?.focus({ preventScroll: true });
  }

  // Every open starts on step 1 with focus on Next. The popover opens below the frame; if it runs past the fold, the
  // page scrolls just enough to show it.
  function readToggled(e: Event) {
    readOpen = (e as ToggleEvent).newState === "open";
    if (!readOpen) {
      // Reset while hidden, so the next open shows step 1 without a cross-fade.
      clearTimeout(fadeTimer);
      step = 0;
      layers = [{ id: layerId++, step: 0, entering: false, leaving: false }];
      return;
    }
    place();
    nextBtn?.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      if (!readPop) return;
      // offsetHeight, not the rect's height: the entry transition is still scaling the popover down.
      const over = readPop.getBoundingClientRect().top + readPop.offsetHeight + 16 - innerHeight;
      if (over > 0) scrollBy({ top: over, behavior: calm() ? "instant" : "smooth" });
    });
  }

  async function go(n: number) {
    const to = Math.min(last, Math.max(0, n));
    if (to === step) return;
    const fromBack = document.activeElement === backBtn;
    step = to;
    layers = [
      ...layers.filter((l) => !l.leaving).map((l) => ({ ...l, entering: false, leaving: true })),
      { id: layerId++, step: to, entering: true, leaving: false },
    ];
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => (layers = layers.filter((l) => !l.leaving)), 220);
    // Back disables itself on step 1; keep keyboard focus inside the popover.
    if (to === 0 && fromBack) {
      await tick();
      nextBtn?.focus();
    }
  }

  function close(pop: HTMLElement | undefined, btn: HTMLButtonElement | undefined) {
    pop?.hidePopover();
    btn?.focus({ preventScroll: true });
  }

  function readKeys(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const keys: Record<string, () => void> = {
      ArrowRight: () => go(step + 1),
      ArrowDown: () => go(step + 1),
      ArrowLeft: () => go(step - 1),
      ArrowUp: () => go(step - 1),
      Home: () => go(0),
      End: () => go(last),
      Escape: () => close(readPop, readBtn),
    };
    const run = keys[e.key];
    if (!run) return;
    e.preventDefault();
    run();
  }

  // Rows: Tab or the arrow keys move between them; Esc closes and returns to the Key button.
  function keyKeys(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close(keyPop, keyBtn);
      return;
    }
    const rows = [...(keyList?.querySelectorAll<HTMLElement>("li") ?? [])];
    const at = rows.indexOf(document.activeElement as HTMLElement);
    const to = { ArrowDown: at + 1, ArrowUp: at < 0 ? rows.length - 1 : at - 1, Home: 0, End: rows.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    rows[Math.min(rows.length - 1, Math.max(0, to))]?.focus();
  }
</script>

{#snippet row(item: LegendItem, i: number)}
  <!-- Rows take focus so the keyboard can light each item's parts, as pointing does. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <li
    tabindex="0"
    data-hot={hot === i || undefined}
    onmouseenter={() => (hot = i)}
    onfocus={() => (hot = i)}
    onblur={() => (hot = null)}
  >
    <span class="fig-swatch" data-kind={item.kind} aria-hidden="true">{@html item.svg}</span>
    {item.label}
  </li>
{/snippet}

<div class="fig-tools" bind:this={root}>
  {#if legend.length}
    <button
      type="button"
      class="fig-tool"
      bind:this={keyBtn}
      popovertarget="{uid}-key"
      aria-controls="{uid}-key"
      aria-expanded={keyOpen}
      style="anchor-name: --{uid}-key"
      onclick={(e) => (keyByKeyboard = e.detail === 0)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"
        ><path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" /><rect
          x="3" y="14" width="7" height="7" rx="1" /><circle cx="17.5" cy="17.5" r="3.5" /></svg
      >
      Key
    </button>
  {/if}
  {#if steps.length}
    <button
      type="button"
      class="fig-tool"
      bind:this={readBtn}
      popovertarget="{uid}-read"
      aria-controls="{uid}-read"
      aria-expanded={readOpen}
      style="anchor-name: --{uid}-read"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"
        ><path d="M12 5v16" /><path
          d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"
        /></svg
      >
      Read
    </button>
  {/if}

  {#if legend.length}
    <div
      popover="auto"
      id="{uid}-key"
      class="fig-pop fig-key"
      role="dialog"
      tabindex="-1"
      aria-labelledby="{uid}-key-title"
      style="position-anchor: --{uid}-key"
      bind:this={keyPop}
      ontoggle={keyToggled}
      onkeydown={keyKeys}
    >
      <p class="fig-pop-title" id="{uid}-key-title">Key</p>
      <div class="fig-key-list" role="group" aria-labelledby="{uid}-key-title" tabindex="-1" bind:this={keyList} onmouseleave={() => (hot = null)}>
        {#if nodes.length}
          <ul>
            {#each nodes as { item, i } (i)}{@render row(item, i)}{/each}
          </ul>
        {/if}
        {#if edges.length}
          <ul>
            {#each edges as { item, i } (i)}{@render row(item, i)}{/each}
          </ul>
        {/if}
      </div>
    </div>
  {/if}

  {#if steps.length}
    <div
      popover="auto"
      id="{uid}-read"
      class="fig-pop fig-read"
      role="dialog"
      tabindex="-1"
      aria-label={readLabel}
      style="position-anchor: --{uid}-read"
      bind:this={readPop}
      ontoggle={readToggled}
      onkeydown={readKeys}
    >
      <div class="fig-read-head">
        <span class="fig-read-count">{step + 1} of {steps.length}</span>
        <div class="fig-read-dots" role="group" aria-label="Steps">
          {#each steps as _, i (i)}
            <button
              type="button"
              tabindex="-1"
              aria-label="Step {i + 1}"
              aria-current={i === step ? "step" : undefined}
              onclick={() => go(i)}
            ></button>
          {/each}
        </div>
      </div>
      <div class="fig-read-text" aria-live="polite">
        {#each layers as l (l.id)}
          <p data-entering={l.entering || undefined} data-leaving={l.leaving || undefined} aria-hidden={l.leaving || undefined}>
            {steps[l.step]?.text}
          </p>
        {/each}
      </div>
      <div class="fig-read-nav">
        <button type="button" class="fig-tool fig-tool-ghost" bind:this={backBtn} disabled={step === 0} onclick={() => go(step - 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
          Back
        </button>
        <button
          type="button"
          class="fig-tool fig-tool-next"
          bind:this={nextBtn}
          onclick={() => (done ? close(readPop, readBtn) : go(step + 1))}
        >
          {done ? "Done" : "Next"}
          {#if done}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          {:else}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>
