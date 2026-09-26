# Interaction states: hover, focus, overflow and animation

Use when a dropdown, overlay, drawer or CSS animation looks broken, or before claiming an interactive change works. Screenshots give both false negatives and false positives for interactive CSS, so each claim rests on a measurement.

## The measurement loop

1. **Locate** the trigger and read its centre from `getBoundingClientRect()`.
2. **Actuate** for real: `page.mouse.move()` for hover, click-then-`Tab` for focus.
3. **Measure** the target's computed state, not its class list.
4. **Hit-test** to prove it is interactive, not merely painted.

```js
// After actuating, in one evaluate:
const li = [...document.querySelectorAll('li.nav-item')]
  .find(l => l.querySelector('a').textContent.trim().startsWith('Clothing'));
const panel = li.querySelector('.panel');
const cs = getComputedStyle(panel);
const r  = panel.getBoundingClientRect();
const hit = document.elementFromPoint(r.x + r.width / 2, r.y + 30);
return {
  matched:    li.matches(':hover') || li.matches(':focus-within'),
  visibility: cs.visibility,
  opacity:    cs.opacity,
  rect:       [r.x, r.y, r.width, r.height].map(Math.round),
  hit:        hit && hit.textContent.trim(),   // must be INSIDE the panel
};
```

`hit` landing on a child of the panel is the proof that matters. Visible-but-unclickable passes every visual check.

Run the loop for both the hover path and the keyboard path. If the keyboard path fails, check that its rule shipped (see "Confirm the CSS actually shipped" in SKILL.md).

## Clipping and travel checks

- **Clipped overlay:** read `overflowX`/`overflowY` on every ancestor. `auto` or `hidden` on one axis forces the other; only `clip` allows a `visible` counterpart.
- **Panel cut off horizontally:** compare `panel.right` against the clipping ancestor's `right`.
- **Animation not travelling:** sample positions over time and express them as a percentage of the intended container, for example `Math.round(((el.top - container.top) / container.height) * 100)`. Bucket the samples into bands to prove even coverage rather than clumping at one edge.

## Responsive sweep

Sweep the real breakpoints and assert per width; one size proves nothing about the others.

```js
for (const w of [390, 768, 990, 1024, 1280, 1440, 1920]) {
  await page.setViewport({ width: w, height: 900 });
  // assert: no overlap, no document overflow, expected element geometry
  document.documentElement.scrollWidth > window.innerWidth; // must be false
}
```

## Reduced motion

Check reduced motion by emulation, not by reading the source:

```js
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
// decorative motion should compute to display:none or animation:none
```
