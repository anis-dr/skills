---
name: pen-dev
description: "Design, change and migrate tokens in pen.dev .pen files with the pen CLI designer agent and the pen.dev MCP execute API. Use when the user wants screens or a design system designed or iterated by the pen designer (a first build from a brief, a multi-screen round, refinement grounded in Mobbin evidence); when changing specific screens or components in a shared .pen file without collateral edits, or an owner reviews every design change; or when renaming, aliasing, deleting or restructuring .pen tokens (variables), adding dark mode, removing hardcoded colours, moving onto an external design system's tokens, or when nodes render black after a token change."
---

# pen.dev

A `.pen` file is plain JSON: `children` holds the frame tree and `variables` holds the tokens. Three writers touch it:

- The `pen` CLI runs its own designer agent. `pen --in X.pen --out X.pen --prompt ...` rewrites the whole file. `pen status` must show an active session.
- The pen.dev desktop app, driven through the pen.dev (Pencil) MCP `execute` tool (`Get`, `Update`, `Export`, `SetVariables`, ...).
- Scripts that read and write the raw JSON.

Keep design files in `designs/` (for example `designs/app.pen`), never in a temp folder.

## Branches

- [Designer iteration](references/designer-iteration.md): the owner wants screens or a design system designed by the pen designer, whether a first build from a brief, a multi-screen round, or a refinement grounded in Mobbin evidence.
- [Gated runs](references/gated-runs.md): a change must touch only named frames or components in a shared file, or an owner reviews every change. It holds the snapshot and frame-diff procedure the other branches reuse.
- [Token migration](references/token-migration.md): renaming, aliasing, deleting or restructuring variables, adding dark mode, removing literal colours, or nodes rendering black after a token change.

A designer round that an owner reviews runs inside the gate. A token migration uses the gate's snapshot and diff as its structural check.

## Two writers, one file

The app and the CLI both write the file, and neither reloads the other's write. `open` on the same path does not reload a file the CLI rewrote, so the app view goes stale.

- MCP `execute` edits go to the app's in-memory document, not to disk. You can make 150 edits, read the file, and find none of them. There is no `Save()` inside `execute`. The user saves with Cmd+S, or you flush through `pen interactive --app <name>`, which attaches to the running app and exposes `save()`:
  ```sh
  printf 'save()\nexit()\n' | pen interactive --app desktop --in designs/app.pen
  ```
  Until one of those happens the app owns the change; say so before claiming it is committed.
- Prefer CLI runs for anything that must be committed.
- After each CLI run, copy the file to a fresh gitignored `designs/app-r<N>.pen` and `open` that copy for MCP inspection. If the app has no document open, `execute` fails with "A file needs to be open".

## Components take Update and Insert only

Instances override a component's descendants by child id. A `Delete` or `Move` inside a reusable component orphans those overrides, silently blanks every instance, and can destroy the file. Retire a child with `enabled: false`. Every designer prompt that touches components carries this line:

> HARD RULE: inside reusable components only Update and Insert, never Delete or Move; set enabled false instead.

If it happens anyway, `git checkout -- designs/app.pen` and rerun with the rule.

A child disabled at the component level can be re-enabled by an instance override. To retire a node for good, delete it at the component and accept the override loss, or disable it per instance.

## Prompting the designer

- One prompt per round, with numbered items. Give numbers (exact pixel sizes, gaps, column widths, colours as existing token names); the designer invents otherwise.
- The designer pads: it invents figures (a derived percentage beside a count, a second review total, counts that disagree, wrong account names). Name the data explicitly and check the export for invented numbers as carefully as layout.
- Name exact frames, the existing components to reuse, and where new frames go ("row to the right of ..."). Name the components to update so all screens change together.
- End with the frame list and "Nothing else changes". When the ask is local, say explicitly "do not touch any variable or colour token".
- Ground each fix in a named design rule (Refactoring UI, Emil Kowalski's design engineering notes) and put the reason in the prompt. The designer follows rules better than adjectives.
- A block that must never wrap (money) needs a fixed-width figure column named in the prompt.
- When a component must lose its container, say the component owns the whole block and the surrounding box is removed. "Keep the outer card as is" keeps the thing the owner disliked.
- Flag alignment invariants explicitly (footer hairlines on one line, equal bar heights).
- The CLI cannot do tabular-nums or sticky positioning. State them as intent in the frame name.
- A run takes 5 to 20 minutes for 5 to 25 frames, and 10 to 20 minutes for 20+ frames. Run it in the background with a long timeout and wait for it to finish.

## Rendering and reading frames

The designer's summary reports intent, not result, and is not evidence. The whole-document `--export` strip is too tall to read and the app view is stale, so trust neither.

1. Copy and open a fresh file: `cp designs/app.pen designs/app-rN.pen && open designs/app-rN.pen`.
2. Through `execute`, with `filePath` pointing at the copy, list the frames and export each one:
   ```js
   Get(n => n.type==='frame' && Print(n.id, n.name), {depth:0});
   Export([...ids], 'png', dir, {scale: 1.5});
   ```
3. Read the PNGs before reporting. Crop a region with `sips -c H W --cropOffset Y X` at the export scale.
4. Verify with visitors, not eyes: `Get(frame,(n,c)=>c.problems&&Print(n.name,c.problems))` finds clipping, and counting icons or text by predicate proves a change landed.
5. Read the designer's final message. It lists deviations and judgement calls; surface them to the user.

The gate reference has a headless alternative (`snapshot.sh`) that needs no app.

## .pen facts that break silently

- `fill_container` inside a `fill_container` parent collapses to zero or overlaps siblings. A row that pushes items apart needs `fit_content` groups with exactly one `fill_container` spacer between them.
- `flipY` pivots on the top-left, so a flipped path needs `y` set to its height to stay in its box.
- Text clamping needs a wrapper frame with a fixed height and `clip: true`. `fixed-width-height` on the text alone overflows onto its siblings.
- An absolutely positioned badge is placed relative to its parent frame's box, not a sibling icon: offset from the frame's corner, not the glyph's.
- A top-level `Get(visitor)` walks root frames only. To touch nested nodes, collect root ids first and walk each subtree.
- `Update(id, ...)` needs a string id. Passing the result of `Get(...)` (an array) errors.
- A bare `Get({depth:0})` errors. Always pass a visitor or a node id.
- Never mutate during a `Get` walk: collect targets first, update afterwards.
