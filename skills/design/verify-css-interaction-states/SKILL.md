---
name: verify-css-interaction-states
description: "Verify hover, focus, overflow and animation behaviour by measuring computed styles and hit-testing in a live browser, instead of trusting screenshots. Use when a dropdown, overlay, drawer or CSS animation looks broken, or before claiming an interactive UI change works."
---

# Verify CSS interaction states by measuring, not screenshotting

Screenshots produce both false negatives and false positives for interactive CSS. Every claim about hover, focus, overflow or animation should rest on a measurement.

## Why screenshots lie

| Trap | Symptom | Real cause |
|---|---|---|
| Stale mouse position | Hover screenshot shows no panel, but the trigger looks active | The driver's `hover()` ran, then something moved the pointer. Use an explicit `page.mouse.move(x, y)` to the trigger's measured centre. |
| Programmatic `.focus()` | `document.activeElement` is right, but `:focus-within` doesn't match | The page lacks real document focus. Click a neutral element first, then send actual `Tab` key presses. |
| Full-page stitched capture | Same viewport repeated down the image | The tool scrolls between shots and `scroll-behavior: smooth` (or a sticky header) breaks stitching. Capture viewport shots at explicit scroll offsets instead. |
| Lazy media | Flat grey blocks | Images had not decoded. Settle 1.5 to 2.5s after scrolling before capturing. |

## The measurement loop

1. **Locate** the trigger and read its centre from `getBoundingClientRect()`.
2. **Actuate** for real: `page.mouse.move()` for hover; click-then-`Tab` for focus.
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

## Confirm the CSS actually shipped

A class in the markup does not mean a rule exists. Build tools drop variants silently.

```js
[...document.styleSheets]
  .flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
  .filter(r => (r.cssText || '').includes('my-class'))
  .map(r => r.cssText.slice(0, 200));
```

Zero results on a state you rely on (especially `:focus-within`) means that path is dead for keyboard users.

## Clipping and travel checks

- **Clipped overlay:** read `overflowX`/`overflowY` on every ancestor. `auto`/`hidden` on one axis forces the other; only `clip` allows a `visible` counterpart.
- **Panel cut off horizontally:** compare `panel.right` against the clipping ancestor's `right`.
- **Animation not travelling:** sample positions over time and express them as a percentage of the intended container, e.g.
  `Math.round(((el.top - container.top) / container.height) * 100)`.
  Bucket them into bands to prove even coverage rather than clumping at one edge.

## Responsive and reduced motion

Sweep the real breakpoints and assert per width; do not eyeball one size.

```js
for (const w of [390, 768, 990, 1024, 1280, 1440, 1920]) {
  await page.setViewport({ width: w, height: 900 });
  // assert: no overlap, no document overflow, expected element geometry
  document.documentElement.scrollWidth > window.innerWidth; // must be false
}
```

Check reduced motion by emulation, not by reading the source:

```js
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
// decorative motion should compute to display:none or animation:none
```

## Reporting

Quote the measured numbers: computed values, rects, hit-test targets, per-width results. "Looks right" is not evidence; a rect and a hit test are.
