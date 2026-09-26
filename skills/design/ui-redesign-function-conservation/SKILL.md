---
name: ui-redesign-function-conservation
description: "Redesign an existing UI surface without silently dropping functionality: inventory every reachable control from the running app first, then re-audit programmatically after. Use when restructuring a dialog, page or panel that users already depend on."
---

# Conserving function through a UI redesign

A redesign silently deletes features. Not through carelessness, but through
**misreading what a control is**. Screenshots and code-reading both fail in
specific, predictable ways. Inventory from the *running app* first.

## Why screenshots and code reading are not enough

Real losses caught this way, each invisible in a screenshot:

- **A text input that looks like a label.** A mailbox "list" was actually four
  editable `<input>`s in a dirty-tracked form with separate `Save` and
  `Save and test`. The redesign wireframe drew static rows with an Add menu,
  which would have destroyed inline editing and the dirty-state save.
- **A handler that does more than its name.** A "Refresh" button called
  `reconcileConnection()` first (consuming a completed OAuth authorization and
  reporting whether one was found), *then* refetched. Consolidating it into a
  generic refresh would have removed the only way to reconcile a completed
  sign-in, while looking equivalent.
- **Sample data hiding scale.** The screenshot showed 1 item; production had 4,
  and the list grows. Layouts that "fit" at 1 do not at 12.

## Procedure

### 1. Inventory from the live app, before touching anything

Drive the real surface in a browser and enumerate every interactive node. Call
the Skill tool with "control-ui" to set up a local browser harness if the repo
has none. Take an accessibility snapshot (it includes aria-labels), then extract
every `button | combobox | switch | textbox | link` line. Do the same via DOM
when the tree is ambiguous:

```js
[...dialog.querySelectorAll('button')].map(b => b.textContent.trim())
dialog.querySelectorAll('input, [role=switch], [role=combobox]').length
dialog.querySelectorAll('button[aria-label*=Remove]').length   // icon-only controls
```

Icon-only controls (trash, close) have **no text**. Count them by `aria-label`
or `data-testid` or they vanish from your checklist.

### 2. Write the checklist down, with the asymmetries

Record it in a file, not just context. For each function: where it lives, what
it does, and anything non-obvious. Explicitly list **asymmetries that must
survive rather than be normalized away**. The redesign's whole pull is toward
making two things uniform, and that is exactly how a feature dies.

For anything you plan to merge or move, **read its handler first** and record
what it actually calls.

### 3. Redesign by moving blocks, not rewriting them

Where possible, relocate existing JSX into the new shell rather than
re-authoring it. Functions are preserved *by construction*, and the diff stays
reviewable. Rewrite only what the new structure genuinely requires.

### 4. Re-audit programmatically against the checklist

Not by eye:

```js
const want = ['Reconnect','Add mailbox','Save mailboxes','Save and test', /*...*/];
const have = [...dialog.querySelectorAll('button')].map(b => b.textContent.trim());
JSON.stringify({ missing: want.filter(w => !have.includes(w)) })
```

Target `missing: []`. Count the unlabelled controls too.

### 5. Prove merged behaviour, don't assert it

If you folded function A into control B, demonstrate B does A. Count network
requests across the click rather than reading the code: list the page's network
requests before the click and again after. The extra request is the proof.

## Browser-driver gotchas

These hold for most drivers:

- A ref-based or coordinate click may not land (offscreen or coordinate
  issues). A DOM click through the driver's evaluate is reliable:
  `button.click()`.
- Element refs from an accessibility snapshot are invalidated by navigation,
  reload and tab switch. Re-snapshot after each, and never reuse a ref across a
  reload.
- Window scroll commands target the window, not the hovered element. To scroll
  a specific container, set `scrollTop` via evaluate.
- Text is often uppercased by CSS. Match DOM text **case-insensitively** or the
  element you can plainly see will not be found.
- HMR reloads close open dialogs mid-audit. Re-open after every edit.

With Orca's built-in browser (if "orca-cli" isn't installed, ask the user to
run npx skills add stablyai/orca --skill orca-cli, then continue):

- `orca snapshot --json` gives the accessibility tree; `orca network --limit 100 --json`
  before and after a click gives the request count for step 5.
- `orca click --element @eN` may not land; `button.click()` through `orca eval`
  is reliable. `orca scroll` targets the window, not the hovered element.
- `orca screenshot --json` returns **base64 in `result.data`**, not a path.
  Decode it to a file before reading it as an image.

## Verifying scroll structure

To prove exactly one scroller and that chrome is outside it:

```js
[...dialog.querySelectorAll('*')].filter(e => {
  const o = getComputedStyle(e).overflowY;
  return (o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 2;
}).length   // want 1
```

Also check the dialog root itself reports `overflow-y: hidden` and
`scrollHeight === clientHeight`. A shared dialog primitive is often the scroller
itself; fix it at the consumer (`flex flex-col overflow-hidden` + body
`flex-1 min-h-0 overflow-y-auto`) rather than the primitive, or you clip every
other dialog that has no designated scroll child. When the consumer's classes go
through `twMerge`, confirm the override actually wins: `overflow` and
`overflow-y` are different conflict groups in some versions.

## Reporting

State conserved functions as a count against the checklist ("0 of 10 missing"),
and name anything that moved, merged, or stayed put against the plan. A
deviation you name is a decision; one you omit is a regression.
