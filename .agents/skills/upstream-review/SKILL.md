---
name: upstream-review
description: Review and port upstream changes to this repo's vendored, referenced and forked skills. Use when upstream/DRIFT.md lists drift, the weekly upstream PR opens, `bun run skills sync` fails with PatchConflict or DeadRules, or the user asks to update skills from upstream.
# Repo-only: `npx skills` skips skills marked internal.
metadata:
  internal: true
---

# Upstream review

Every upstream entry in `upstream/sources.json` pins a commit. Vendored skills and references follow upstream mechanically (rules, then patches); forks follow by hand. This review moves both to upstream HEAD and leaves a record of what changed.

## 1. Read the drift

Run `bun run skills sync --report`. It writes `upstream/DRIFT.md`: for each entry, the upstream commits after its pin that touch its path, and a diffstat. Forks come first, under "Forks: needs review".

For each commit, read its diff in the cached mirror (`git -C .upstream/<slug>.git show <sha> -- <path>`) and classify it:

- **cosmetic**: wording, punctuation, formatting. Same behaviour.
- **behaviour**: steps, rules, triggers, invocation or files added or removed.
- **harness-only**: plugin manifests or wording that only matters to one harness.

Done when every commit in DRIFT.md has one class.

## 2. Move vendored skills and references

Run `bun run skills sync --update`, then `bun run skills check`. Resolve each failure at its cause:

- **PatchConflict**: upstream moved the lines the skill's patch edits. Read `upstream/patches/<name>.patch` to see what it did, delete it, run `bun run skills sync`, redo the edits in the skill folder, run `bun run skills patch <name>`, and sync again.
- **DeadRules**: a rule in `src/rules.ts` matches no upstream text any more. Reworded upstream: fix the pattern and replace its case in `test/rules.test.ts` with the new real line. Gone upstream: delete the rule and its cases.
- **banned-term or skill-call findings**: upstream added harness wording. When the same wording appears in several skills, add a rewrite to `src/rules.ts` with a test case made of the real upstream line. Otherwise edit the skill folder and run `bun run skills patch <name>`.
- **reference-index**: upstream added, removed or renamed a file that a reference entry vendors. Update the entry in `upstream/sources.json` and the index line in the owning skill's `SKILL.md`.

Rules change the text every patch applies to. After changing a rule, re-run `bun run skills sync`; a PatchConflict that follows is resolved as above.

## 3. Port forks

For each fork in DRIFT.md, port every behaviour commit into our text by hand, keeping our additions. Cosmetic and harness-only commits need no port. Then set the entry's `commit` in `upstream/sources.json` to the upstream HEAD shown after `..` in DRIFT.md.

The `ask-anis` router is a fork of `ask-matt`: a new or renamed skill upstream also needs its router line, which `bun run skills check` enforces.

## 4. Verify and commit

Run `bun run test`, `bun run skills sync`, `bun run skills check` (expect `0 findings`) and `bun run skills sync --report` (expect no drift). Commit per upstream source: `chore: sync <owner/repo> to <sha7>`.

Upstream skills that are new since the pins do not show in DRIFT.md. When the user asks what else upstream offers, list the upstream skill folders in the mirror and compare them with `upstream/sources.json`.

## Reply

The class of each commit, what was ported into which fork, every rule or patch changed, and the final `check` output.
