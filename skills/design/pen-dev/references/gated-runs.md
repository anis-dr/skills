# Gated runs

The designer rewrites the whole file and will restyle tokens, shared components, and frames nobody asked about when a prompt is loose. Across 80+ frames a bad run is invisible in the designer's summary, owners notice, and it costs a revert. Gate every run.

## The rule

A run changes only the frames named in the prompt. Colours, variables, and shared components change only when the owner asked for that change by name. Show the diff and the changed frames to the owner and wait for approval before committing.

## Setup once per repo

Create two scripts (for example in `designs/scripts/`) and a `designs/AGENTS.md` describing the loop, and point the root `AGENTS.md` at it.

**`snapshot-tree.sh <file.pen> <out-dir>`** (the gate). Python reads the `.pen` as JSON and writes `tree.json` with, per top-level frame, `{id: {name, hash, nodes}}`: `hash` is a sha1 of the frame's whole subtree serialised with sorted keys, `nodes` is its node count. Add one synthetic `__variables__` entry hashing the document's variables. Deterministic, no network, no `pen` process, under a second. A token migration folds its integrity gate into this script (see [token-migration.md](token-migration.md)).

Do not compute the hash through `pen interactive` + `execute` + `Get` (with or without `resolveInstances`): resolved instance data differs between processes and the diff flags dozens of untouched frames.

**`diff-tree.sh <before> <after> [allowed-regex]`**. Joins the two `tree.json` files and prints one line per ADDED, REMOVED, or CHANGED frame with its node counts. Lines whose frame name matches the regex print `ok`, the rest `!!`. Exit 1 if any `!!` line exists.

**Optional pixel pair, for looking only.** `snapshot.sh <file.pen> <out-dir>` copies the file to a temp dir, pipes an `execute()` call into `pen interactive --out tmp.pen --in copy.pen` that collects every top-level frame id and name, `Export`s them as PNG at scale 1, and writes `names.json` (id to name). Headless, no app needed, about 30 s for 85 frames. `diff.sh <before> <after> [allowed-regex]` joins the two `names.json` and reports per frame ADDED, REMOVED, RESIZED (dimensions differ) or CHANGED (pixel count from ImageMagick `compare -metric AE -fuzz 2%`), with the same `ok`/`!!` marks. Parse `compare`'s stderr with awk, not sed labels (macOS sed rejects `t;`). Needs `pen` and ImageMagick (`magick`, `compare`).

Never gate on pixels:

- `Export` fetches fonts from Google Fonts at export time. On a slow connection text renders in fallbacks or at zero width and the PNGs are not comparable. Treat font warnings as "not comparable".
- `pen interactive` kills an `execute` after 55 s, so export in chunks of about 12 frames: `Export(ids.slice(i,i+12),'png',dir,{scale:1})`.

## Per change

1. **Snapshot before**: `designs/scripts/snapshot-tree.sh designs/app.pen /tmp/before`.
2. **Prompt narrowly**, by the SKILL.md section "Prompting the designer". Name every target frame and component and end with the frame list and "Nothing else changes". Include, in the prompt itself, the HARD RULE line followed by:
   > Do not touch any variable, colour token, or any frame other than the ones named here. Nothing else changes.

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
5. **Look yourself.** Render the changed frames, either with the pixel `snapshot.sh` or from the app by the SKILL.md section "Rendering and reading frames". Read the PNGs.
6. **Present the diff and the frames to the owner, and wait.** Commit only on explicit approval, with the frame names in the message. Save the diff report next to the exports.

If the tree diff shows "no changes", the CLI probably crashed with a stack trace and wrote nothing. Rerun the same prompt.

## Reverting

On denial before commit: `git checkout -- designs/app.pen`. If the bad run is already the last commit, drop it rather than layering a revert commit or checking files out on top of it:

```sh
git stash -u && git reset --hard <good> && git push --force-with-lease && git stash pop
```
