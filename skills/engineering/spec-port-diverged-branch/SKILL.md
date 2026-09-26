---
name: spec-port-diverged-branch
description: "Use when a cherry-pick across diverged branches (for example production main onto a restructured branch) shows heavy modify/delete or content conflicts. Ports the commit by treating it as a spec and converging file content so the eventual merge is clean."
---

# Spec-port a commit across diverged branches

When two branches rewrote the same subsystem (for example a runtime migration branch against production main), cherry-picking a main commit produces conflict soup. Instead, treat the commit as a **spec** and reimplement it natively, engineering the end state so the eventual merge is clean.

## 1. Triage with a simulation

```bash
git fetch origin main
git log --oneline --no-merges HEAD..origin/main        # classify incoming commits
git cherry-pick --no-commit <sha>; git status --short  # count conflict types
git cherry-pick --abort; git reset --hard HEAD
```

- Mostly clean hunks: just cherry-pick.
- Many `UU` plus `DU`/`UD` (modify against delete, both directions): spec-port.

## 2. Bucket every touched file by convergence rule

| Bucket | Rule | Merge outcome |
|---|---|---|
| New files on main | `git show <sha>:path > path` **verbatim** (fix only broken imports; note each divergence) | both-added-identical, clean |
| Files main deleted | delete on the branch too | both-deleted, clean |
| Shared low-divergence files | try `git show <sha> -- path \| git apply --check` first; apply the diff directly when it fits | identical content, clean |
| Files only one branch has | reimplement the spec's *semantics* natively | no convergence possible; document it |

Also hunt for **branch-only machinery the spec never saw** (extra workflows, tasks, config knobs serving the removed feature). The spec's file list understates your scope.

## 3. Implement, then chase the graph

- Map consumers before deleting (grep, or your editor's LSP find-references). A removed producer often orphans generic fields (state schemas, telemetry counts, test fixtures); remove those with their last producer.
- Use LSP rename for method renames. It may miss test files outside the LSP project, so grep afterward.

## 4. Verify convergence, not just correctness

After the normal test, typecheck and build run, commit, then:

```bash
git merge --no-commit --no-ff origin/main; git status --short | grep -E "^(UU|DU|UD|AA)"
git merge --abort
```

Confirm the subsystem's conflicts collapsed to the intentional divergences you documented. Mirror main's commit message (add a "ported from <sha>" note) so history correlates.

## Gotchas

- Line-range edits: a replace range that crosses a closing bracket and the next function's opener silently eats both. Re-read the exact boundary lines first.
- Multi-file edit batches: never include a delete-file operation for a path unless you mean to delete that file.
- Behavior flips hidden in "refactors": removing a fallback path can change a platform's default route (for example a bypass toggle's default). Surface these to the user as explicit decisions before implementing.
