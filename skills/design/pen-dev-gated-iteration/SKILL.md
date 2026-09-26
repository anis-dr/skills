---
name: pen-dev-gated-iteration
description: "Run a pen.dev CLI designer change on an existing .pen file without collateral edits: snapshot every frame, prompt narrowly, diff before and after against an allowed-frames regex, inspect the changed frames, get owner approval, then commit. Use when the user asks to change specific screens or components in a shared .pen file, or when an owner reviews every design change."
---

# Gated pen.dev iteration

The pen.dev CLI designer (`pen --in X.pen --out X.pen --prompt ...`) rewrites the whole file and will restyle tokens, shared components, and frames nobody asked about when a prompt is loose. Across 80+ frames a bad run is invisible in the designer's summary, owners notice, and it costs a revert. Gate every run.

## The rule

A run changes only the frames named in the prompt. Colours, variables, and shared components change only when the owner asked for that change by name. Show the diff and the changed frames to the owner and wait for approval before committing.

## Setup once per repo

Create two scripts (for example in `designs/scripts/`) and a `designs/AGENTS.md` describing the loop, and point the root `AGENTS.md` at it.

**`snapshot-tree.sh <file.pen> <out-dir>`** (the gate). Python reads the `.pen` as JSON (it is plain JSON with `children` and `variables`) and writes `tree.json` with, per top-level frame, `{id: {name, hash, nodes}}`: `hash` is a sha1 of the frame's whole subtree serialised with sorted keys, `nodes` is its node count. Add one synthetic `__variables__` entry hashing the document's variables. Deterministic, no network, no `pen` process, under a second.

Do not compute the hash through `pen interactive` + `execute` + `Get` (with or without `resolveInstances`): resolved instance data differs between processes and the diff flags dozens of untouched frames.

**`diff-tree.sh <before> <after> [allowed-regex]`**. Joins the two `tree.json` files and prints one line per ADDED, REMOVED, or CHANGED frame with its node counts. Lines whose frame name matches the regex print `ok`, the rest `!!`. Exit 1 if any `!!` line exists.

**Optional pixel pair, for looking only.** `snapshot.sh <file.pen> <out-dir>` copies the file to a temp dir, pipes an `execute()` call into `pen interactive --out tmp.pen --in copy.pen` that collects every top-level frame id and name, `Export`s them as PNG at scale 1, and writes `names.json` (id to name). Headless, no app needed, about 30 s for 85 frames. `diff.sh <before> <after> [allowed-regex]` joins the two `names.json` and reports per frame ADDED, REMOVED, RESIZED (dimensions differ) or CHANGED (pixel count from ImageMagick `compare -metric AE -fuzz 2%`), with the same `ok`/`!!` marks. Parse `compare`'s stderr with awk, not sed labels (macOS sed rejects `t;`). Needs `pen` and ImageMagick (`magick`, `compare`).

Never gate on pixels:

- `Export` fetches fonts from Google Fonts at export time. On a slow connection text renders in fallbacks or at zero width and the PNGs are not comparable. Treat font warnings as "not comparable".
- `pen interactive` kills an `execute` after 55 s, so export in chunks of about 12 frames: `Export(ids.slice(i,i+12),'png',dir,{scale:1})`.

## Per change

1. **Snapshot before**: `snapshot-tree.sh designs/app.pen /tmp/before`.
2. **Prompt narrowly.** Name every target frame and component, give numbers (sizes, gaps, column widths, colours as existing token names), and end with the frame list and "Nothing else changes". Include, in the prompt itself:
   > HARD RULE: inside reusable components only Update and Insert, never Delete or Move; set enabled false instead. Do not touch any variable, colour token, or any frame other than the ones named here. Nothing else changes.

   Ask the designer to print a verification (for example the bounds height of every instance it touched) so its own output can be checked.
   ```sh
   pen --in designs/app.pen --out designs/app.pen --prompt "..." --export /tmp/out.png --export-scale 1
   ```
3. **Snapshot after and diff**:
   ```sh
   designs/scripts/snapshot-tree.sh designs/app.pen /tmp/after
   designs/scripts/diff-tree.sh /tmp/before /tmp/after "Checkout|Components"
   ```
   A shared-component edit legitimately changes every frame that carries that component, so those frames belong in the regex (for example every frame with a Receipt). Check the changed list is exactly those frames, and list the unchanged ones as proof.
4. **On `!!` lines**: `git checkout -- designs/app.pen`, then narrow the prompt or ask the owner. Never commit `!!` lines the owner has not seen.
5. **Look yourself.** The designer's summary reports intent, not result, and is not evidence. Render the changed frames: either the pixel `snapshot.sh`, or from the app (copy the file to a fresh gitignored `app-r<N>.pen`, `open` it, and `Export` through the MCP `execute` tool). Read the PNGs. Crop with `sips -c H W --cropOffset Y X` at the export scale.
6. **Present the diff and the frames to the owner, and wait.** Commit only on explicit approval, with the frame names in the message. Save the diff report next to the exports.

If the tree diff shows "no changes", the CLI probably crashed with a stack trace and wrote nothing. Rerun the same prompt.

## App vs CLI

The pen.dev desktop app holds its own in-memory copy and does not reload a file the CLI rewrote. After each CLI run, copy to a fresh gitignored `app-r<N>.pen` and open that for MCP inspection. Edits made through the app's MCP are not on disk until the user saves; prefer CLI runs for anything that must be committed.

## Reverting

On denial before commit: `git checkout -- designs/app.pen`. If the bad run is already the last commit, drop it rather than layering a revert commit or checking files out on top of it:

```sh
git stash -u && git reset --hard <good> && git push --force-with-lease && git stash pop
```

## .pen specifics that cause silent breakage

- Inside a reusable component, never `Delete` or `Move` a child: instance overrides are keyed by child id and get orphaned. Use `enabled: false`.
- A child disabled at the component level can be re-enabled by an instance override. To retire a node for good, delete it at the component and accept the override loss, or disable it per instance.
- `fill_container` inside a `fill_container` parent collapses to zero or overlaps siblings. A row that pushes items apart needs `fit_content` groups with exactly one `fill_container` spacer between them.
- `flipY` pivots on the top-left, so a flipped path needs `y` set to its height to stay in its box.
- Text clamping needs a wrapper frame with a fixed height and `clip: true`; `fixed-width-height` on the text alone overflows onto its siblings.
- An absolutely positioned badge is placed relative to its parent frame's box, not a sibling icon: offset from the frame's corner, not the glyph's.
- A top-level `Get(visitor)` walks root frames only. To touch nested nodes, collect root ids first and walk each subtree.

## Prompt hygiene

- Give the designer numbers; it invents otherwise.
- A block that must never wrap (money) needs a fixed-width figure column named in the prompt.
- When a component must lose its container, say the component owns the whole block and the surrounding box is removed. "Keep the outer card as is" keeps the thing the owner disliked.
- When the ask is local, say explicitly "do not touch any variable or colour token".
