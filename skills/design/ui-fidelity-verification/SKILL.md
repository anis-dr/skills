---
name: ui-fidelity-verification
description: "Verify a UI build or CSS/animation fix by measuring the reference and the implementation programmatically across widths, instead of eyeballing screenshots. Use when matching a design reference, or debugging layout, overflow, dropdown, animation or Tailwind-variant bugs."
---

# UI fidelity verification

Eyeballing screenshots produces confident wrong conclusions. Measure both sides, assert numbers.

## The loop

1. **Measure the reference first.** Open the reference (a design prototype, a staging build, or the previous version of your own app) in a headless browser and read *computed styles and rects*, not just pixels:
   ```js
   getComputedStyle(el)  // fonts, colors, padding, grid-template-columns, overflow
   el.getBoundingClientRect()
   ```
   Do this at every target width in one pass (`390, 768, 1024, 1440, 1920`). Constant values across widths mean no responsive variation, which is a big simplification.

2. **Enumerate before assuming.** A component may have several nodes with the same role (e.g. a mobile and a desktop logo). Query *all* candidates and record `visible`, `display`, `position`, `rect` for each. Picking the wrong one sends you down a long wrong path.

3. **Reproduce the bug with a measurement, not a screenshot.** Read the property that would explain it:
   ```js
   {overflowX, overflowY, height, panelRect, zIndex, containerType}
   ```

4. **Assert the fix numerically**, then confirm visually. Compare a table of reference values vs yours.

5. **Hit-test interactivity.** Visible is not clickable:
   ```js
   document.elementFromPoint(x, y).textContent
   ```

## Scoping rules for assertions

- Scope every query to the component (`fieldset label`, not `label`). Unscoped queries match unrelated nodes and fake failures.
- Test focus-driven CSS with **real key presses**, not `element.focus()`. `:focus-within` may not match without genuine document focus.
- Move the mouse with real pointer events at computed coordinates; a stale pointer position makes a working hover look broken.
- Check `document.documentElement.scrollWidth > window.innerWidth` to catch horizontal overflow regressions.

## CSS pitfalls that repeatedly cause these bugs

| Symptom | Cause | Fix |
| --- | --- | --- |
| Element animates only a short distance | `translateY(%)` resolves against the element's own height | `container-type: size` on an `inset-0` overlay + animate in `cqh`/`cqw` |
| Dropdown clipped to a thin sliver | `overflow-x: auto` forces `overflow-y: auto` | `overflow-x: clip; overflow-y: visible` (only `clip` allows a `visible` counterpart axis) |
| Submenu inherits a fade | `mask-image` applies to descendants | use a sibling gradient overlay |
| Hover works, keyboard does not | Tailwind named-group variant never compiled | grep `document.styleSheets` for the rule; write explicit `:hover, :focus-within` CSS |
| Element jumps when a class toggles | Tailwind `-translate-y-1/2` sets `translate`, not `transform` | use `rotate:`/`translate:` properties, never re-declare `transform` |
| `rotate` change does not animate | `transition-transform` does not cover `rotate` | `transition-[rotate]` (never `transition: all`) |
| Every copied spacing value is ~1.6x off | Theme sets 62.5% root font-size, so `1rem` = 10px | halve-and-a-bit: `5rem` = 50px |
| Full-page screenshot repeats the top | page-level `scroll-behavior: smooth` breaks scroll-and-stitch capture | remove it |

## Reference-fidelity judgement

When the reference itself is broken (overlapping nav, clipped menu, overflow), say so explicitly and choose deliberately: reproduce the flaw, or fix it and flag the deviation. Do not silently "fix" something and call it a match, and do not copy a bug without naming it.

## Reporting

Give a value table (reference vs implementation) and a short list of what each verification actually exercised. Distinguish measured facts from inferences.
