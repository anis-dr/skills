---
name: measure-ui
description: "Prove UI fidelity and interaction behaviour by measuring computed styles, rects and hit tests in a live browser instead of trusting screenshots. Use when matching a build against its design reference, when debugging layout, overflow, dropdown, animation or Tailwind-variant bugs, or before claiming a hover, focus, overlay, drawer or animation change works."
---

# Measure UI

Screenshots produce confident wrong conclusions, both false passes and false failures. Every claim about layout, fidelity, hover, focus, overflow or animation rests on a measurement: computed styles, rects and hit tests read in a live browser, asserted as numbers.

## Pick the branch

- [Fidelity](references/fidelity.md): you have a design reference (a mockup, a design file, or your own earlier build) and an implementation, and need to prove they match or find why they differ.
- [Interaction states](references/interaction-states.md): a dropdown, overlay, drawer or CSS animation looks broken, or you are about to claim an interactive change works.

Matching a design usually needs both: fidelity for the static layout, then interaction states for every menu and animation.

## Rules for every measurement

- **Actuate for real.** Move the mouse with real pointer events (`page.mouse.move(x, y)`) to the trigger's measured centre. A driver's `hover()` followed by anything that moves the pointer leaves a stale position, and a working hover looks broken.
- **Focus with real keys.** Programmatic `element.focus()` sets `document.activeElement`, but `:focus-within` may not match without real document focus. Click a neutral element first, then send actual `Tab` presses.
- **Click by pixel.** Prefer trusted pixel clicks (`page.mouse.click(x, y)`) over clicking a visually hidden input by its accessibility ref. The ref click can flip the native control without driving the framework's state.
- **Scope every query** to the component (`fieldset label`, not `label`). An unscoped `querySelectorAll('label')` matched controls elsewhere on the page and reported a selection bug that did not exist.
- **Hit-test.** Visible is not clickable: `document.elementFromPoint(x, y)` must land inside the element you claim works.
- **Catch horizontal overflow.** `document.documentElement.scrollWidth > window.innerWidth` must be false at every width.

## Confirm the CSS actually shipped

A class in the markup does not mean a rule exists. Build tools drop variants silently: Tailwind's `group-focus-within/nav:visible` once produced no rule, leaving a hover-only menu keyboard users could never open.

```js
[...document.styleSheets]
  .flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
  .filter(r => (r.cssText || '').includes('my-class'))
  .map(r => r.cssText.slice(0, 200));
```

Zero results on a state you rely on (especially `:focus-within`) means that path is dead. When an interaction must work, write the CSS explicitly (`:hover, :focus-within`) instead of composing it from variants.

## Screenshot traps

Take screenshots only to confirm what the numbers already proved.

| Trap | Symptom | Real cause and fix |
|---|---|---|
| Full-page stitched capture | The same top tile repeated down the image | The tool scrolls between shots, and page-level `scroll-behavior: smooth` (or a sticky header) fires each capture before the scroll settles. Capture viewport shots at explicit scroll offsets, or remove the smooth scroll from your own build. |
| Lazy media | Flat grey blocks | Images had not decoded. Settle 1.5 to 2.5s after scrolling before capturing. |
| Stale mouse position | Hover shot shows no panel while the trigger looks active | See "Actuate for real" above. |
| Programmatic `.focus()` | `activeElement` is right but the focus styles are missing | See "Focus with real keys" above. |

## CSS pitfalls that repeatedly cause these bugs

| Symptom | Cause | Fix |
| --- | --- | --- |
| Element animates only a short distance | `translateY(%)` resolves against the element's own height | `container-type: size` on an `inset-0` overlay, then animate in `cqh`/`cqw` |
| Dropdown clipped to a thin sliver | `overflow-x: auto` forces `overflow-y: auto` | `overflow-x: clip; overflow-y: visible` (only `clip` allows a `visible` counterpart axis) |
| Submenu inherits a fade | `mask-image` applies to descendants | use a sibling gradient overlay |
| Hover works, keyboard does not | Tailwind named-group variant never compiled | check the stylesheet as above; write explicit `:hover, :focus-within` CSS |
| Element jumps when a class toggles | Tailwind v4 `-translate-y-1/2` sets `translate`, not `transform` | use the `rotate`/`translate` properties, never re-declare `transform` |
| `rotate` change does not animate | `transition-transform` does not cover `rotate` | `transition-[rotate]` (never `transition: all`) |
| Every copied spacing value is ~1.6x off | The theme sets a 62.5% root font-size, so `1rem` = 10px | convert each rem to px: `5rem` = 50px |

## Reporting

Quote the measured numbers: a value table (reference against implementation where there is one), computed values, rects, hit-test targets and per-width results. List what each verification actually exercised, and separate measured facts from inferences. "Looks right" is not evidence; a rect and a hit test are.
