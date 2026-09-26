---
name: github-stack-phantom-conflict
description: Use when a GitHub Stacks (gh-stack) PR shows CONFLICTING or DIRTY while local git merges cleanly against the PR base. The cause is an intermediate stack branch lagging the stack trunk.
---

# GitHub Stacks phantom conflict

Use when a stacked PR shows `CONFLICTING` / `DIRTY` on GitHub (often `bun.lock` or a docs file) but `git merge-tree --write-tree HEAD origin/<base>` is clean, `git merge-base --is-ancestor origin/<base> HEAD` is true, and `/pull/N/conflicts` returns 404.

## Why

Stacks evaluate every PR with the stack's **bottom trunk** as merge base, not the PR's immediate base. When an intermediate base branch lags the trunk, files changed by both that base and your head (relative to trunk) look conflicted.

## Diagnose

```bash
T=origin/<trunk>   # base of the bottom PR in the stack
B=origin/<base>    # your PR's immediate base
git fetch origin <trunk> <base>
git merge-base --is-ancestor $T $B || echo "base lags trunk"
git merge-tree --write-tree --name-only --merge-base=$T HEAD $B | sed -n '2,10p'   # reproduces GitHub's list
```

`gh pr view N --json mergeable,mergeStateStatus` confirms. Changing the base through the API is refused ("part of a stack").

## Fix

1. Update the intermediate base in a temp worktree:
   ```bash
   W=$(mktemp -d); git worktree add -q "$W" -B base-sync $B
   (cd "$W" && git merge --no-edit $T)   # resolve; for stack-owned docs take HEAD's version
   git push origin base-sync:<base>
   ```
2. Merge the updated base into your head (it should be a zero content change), then push.
3. Wait about 30s; `gh pr view` for each stack PR should read `MERGEABLE CLEAN`.
4. `git worktree remove "$W"; git branch -D base-sync`.

Lockfile conflicts (Bun): `git checkout --theirs bun.lock && bun install --lockfile-only && bun install`, then check there are no `<<<<<<<` markers.

## Traps

- Simulate against the stack trunk, never against the default branch (such as `staging`): unrelated squash-merge conflicts there will mislead you.
- Keep the merge going instead of reaching for `--abort`: the fix is bringing the base forward, not rewriting head.
