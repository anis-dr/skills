# Alignment and symmetry

Use when a screen must look aligned and balanced: after building or restyling a layout, before claiming a polish pass is done, or when someone says two things "don't line up". Offsets of 2 to 6 px are invisible in a full-page screenshot and obvious to a designer, so measure them.

## What it checks

- **Near-miss edges.** Left-aligned text should start on a few shared left edges, and right-aligned text (numbers, dates) should end on a few shared right edges. Two edges 1 to 8 px apart are one edge that drifted: a title at 100 px over rows at 106 px.
- **Padding symmetry.** Small framed controls (buttons, chips, badges, inputs) have equal left and right padding and equal top and bottom padding around their content.
- **Icon centring.** An icon sits on the vertical centre of the text beside it.

It measures glyphs, not boxes: a text node's own rect shows where the first letter starts, which padding on its parent hides.

## Run it

Load the screen at its target width, then evaluate this in the page through your driver. Pass a selector to scope it to one region (`'main'`, `'.panel'`); a page-wide run mixes unrelated columns.

```js
((root = document.body, tol = 8) => {
  root = typeof root === 'string' ? document.querySelector(root) : root;
  const inView = r => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
  const label = el => (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30);
  const L = [], R = [];
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    const n = walk.currentNode, t = n.textContent, s = t.search(/\S/);
    if (s < 0) continue;
    const range = document.createRange();
    range.setStart(n, s); range.setEnd(n, t.trimEnd().length);
    const rects = [...range.getClientRects()].filter(inView);
    if (!rects.length) continue;
    const item = { text: t.trim().slice(0, 30) };
    const svgText = n.parentElement.closest('text');
    if (svgText) {
      const anchor = getComputedStyle(svgText).textAnchor;
      if (anchor === 'end') R.push({ ...item, x: rects.at(-1).right });
      else if (anchor === 'start') L.push({ ...item, x: rects[0].left });
      continue;
    }
    // Only text that starts its line sets an edge; "lnk.hub/" + "slug" or "0 clicks · url" do not.
    let block = n.parentElement;
    while (block !== root && getComputedStyle(block).display.startsWith('inline')) block = block.parentElement;
    const before = document.createRange();
    before.setStart(block, 0); before.setEnd(n, s);
    if (before.toString().trim()) continue;
    const align = getComputedStyle(n.parentElement).textAlign;
    if (align === 'right' || align === 'end') R.push({ ...item, x: rects.at(-1).right });
    else if (align !== 'center') L.push({ ...item, x: rects[0].left });
  }
  const nearMisses = (edges, side) => {
    const groups = [];
    for (const e of edges.sort((a, b) => a.x - b.x)) {
      const g = groups.at(-1);
      if (g && e.x - g.x < 0.75) g.items.push(e.text); else groups.push({ x: e.x, items: [e.text] });
    }
    const out = [];
    for (let i = 1; i < groups.length; i++) {
      const d = groups[i].x - groups[i - 1].x;
      if (d >= 0.75 && d <= tol) out.push({ side, gap: +d.toFixed(1),
        a: { x: +groups[i - 1].x.toFixed(1), items: groups[i - 1].items.slice(0, 3) },
        b: { x: +groups[i].x.toFixed(1), items: groups[i].items.slice(0, 3) } });
    }
    return out;
  };
  const framed = el => { const c = getComputedStyle(el);
    return c.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(c.borderLeftWidth) > 0 || c.boxShadow !== 'none'; };
  const contentBox = el => {
    const rs = [];
    for (const k of el.querySelectorAll('*')) if (!k.children.length) rs.push(...k.getClientRects());
    const range = document.createRange(); range.selectNodeContents(el);
    rs.push(...[...range.getClientRects()]);
    const v = rs.filter(inView);
    return v.length && { l: Math.min(...v.map(r => r.left)), r: Math.max(...v.map(r => r.right)),
      t: Math.min(...v.map(r => r.top)), b: Math.max(...v.map(r => r.bottom)) };
  };
  const asymmetric = [];
  for (const el of root.querySelectorAll('button, a, input, select, [class*="chip"], [class*="badge"], [class*="tag"]')) {
    const box = el.getBoundingClientRect();
    if (!inView(box) || box.height > 64 || !framed(el) || el.matches('input, select')) continue;
    const c = contentBox(el); if (!c) continue;
    const dx = Math.abs((c.l - box.left) - (box.right - c.r)), dy = Math.abs((c.t - box.top) - (box.bottom - c.b));
    if (dx > 1 || dy > 1) asymmetric.push({ el: label(el), dx: +dx.toFixed(1), dy: +dy.toFixed(1) });
  }
  const offCentre = [];
  for (const icon of root.querySelectorAll('svg, img')) {
    const ir = icon.getBoundingClientRect();
    if (!inView(ir) || ir.width > 32) continue;
    const parent = icon.parentElement;
    const range = document.createRange(); range.selectNodeContents(parent);
    const lines = [...range.getClientRects()].filter(r => inView(r) && r.height > 4 && !(r.left >= ir.left && r.right <= ir.right));
    const line = lines.find(r => r.bottom > ir.top && r.top < ir.bottom);
    if (!line) continue;
    const d = (ir.top + ir.height / 2) - (line.top + line.height / 2);
    if (Math.abs(d) > 1) offCentre.push({ near: label(parent), dy: +d.toFixed(1) });
  }
  const near = [...nearMisses(L, 'left'), ...nearMisses(R, 'right')];
  return { pass: !near.length && !asymmetric.length && !offCentre.length, near, asymmetric, offCentre };
})()
```

## Pass criterion

- `near` is empty: no two edges on the same side are 0.75 to 8 px apart.
- `asymmetric` is empty: framed controls differ by at most 1 px left versus right and top versus bottom.
- `offCentre` is empty: icons sit within 1 px of their text's vertical centre.

Run it at every target width; a fix at 1440 px often breaks at 390 px.

## Reading the result

- A `near` pair names the texts on each edge. Decide which edge is the system's (usually the one with more items) and move the stragglers to it by changing padding, never with a one-off offset.
- Two genuinely separate columns can land within 8 px by accident. Confirm on a 2x crop before moving anything, and widen the gap if they read as one edge.
- `asymmetric` often comes from an icon plus text where the icon's box carries extra whitespace, or a trailing gap reserved for a hidden element.
- `offCentre` with a constant `dy` across many icons means the line height or the icon size is off, not each icon.
