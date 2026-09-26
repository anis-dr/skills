# Fidelity: measure the reference, then your build

Use when an implementation must match a reference, or when a layout bug needs a cause. Measure both sides with the same code and compare numbers.

## The loop

1. **Measure the reference first.** Open the reference (a design prototype, a staging build, or the previous version of your own app) in a headless or embedded browser and read computed styles and rects, not pixels. For every section, run one evaluate that returns rects and computed styles at every target width in one pass (`390, 768, 1024, 1440, 1920`, plus the reference's own breakpoints):

   ```js
   const R = el => { const r = el.getBoundingClientRect();
     return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]; };
   const pick = (el, keys) => { const c = getComputedStyle(el);
     return Object.fromEntries(keys.map(k => [k, c[k]])); };
   ```

   Capture section padding, grid `gridTemplateColumns` and `gap`, element aspect ratio (`width/height`), font-size, weight and letter-spacing, colours, `overflow`, and the x-offset of the second grid item. Values that stay constant across widths mean no responsive variation, which is a big simplification.

   Lazy-rendered sections need `scrollIntoView` plus a settle delay before they exist.

2. **Enumerate before assuming.** A component may have several nodes with the same role (a mobile and a desktop logo, say). Query all candidates and record `visible`, `display`, `position` and `rect` for each. Picking the wrong one sends you down a long wrong path.

3. **Reproduce a bug with a measurement, not a screenshot.** Read the property that would explain it:

   ```js
   {overflowX, overflowY, height, panelRect, zIndex, containerType}
   ```

4. **Verify your build the same way.** Re-run the identical measurement against localhost and diff the tables. "Looks close" is not evidence; matching `712px 712px` / `gap: 16px` / `ratio: 1.0` is. Assert the numbers first, then confirm visually.

5. **Hit-test interactivity** on the build: `document.elementFromPoint(x, y).textContent` must name the element you expect. For menus and animations, continue with [interaction states](interaction-states.md).

The loop is done when every measured value in the reference table has a matching value in your table, or a named deviation.

## When the reference is broken

A reference can overlap its own nav, clip a menu or overflow the page. Say so explicitly and choose deliberately: reproduce the flaw, or fix it and flag the deviation. A silent fix called a match and a copied bug left unnamed are both reporting errors.
