---
name: parallel-subagents-shared-worktree-stack
description: "Use when fanning out independent code slices to parallel subagents that share one git worktree, where each slice lands on its own branch off a common base without checkouts and the branches become a linear gh stack."
---

# Parallel subagents in one shared worktree, then a gh stack

Use when dispatching 2+ subagents to edit disjoint files in the same checkout and each slice must become its own stacked PR.

## Before dispatch

1. Push the base branch (for example `feature/helper-base`) and note its SHA as `BASE`.
2. Give every agent a distinct branch name and an explicit, disjoint file list. Name the shared files nobody may touch.
3. Tell them up front, before any collision report: **never run `git checkout`, `switch`, `stash` or `reset`** in the shared worktree, and commit only their own paths.

## Commit without moving HEAD (plumbing)

HEAD will be on whichever branch someone checked out first. Agents whose branch is not HEAD build their commit directly on `BASE`:

```bash
GIT_INDEX_FILE=/tmp/idx-$ME git read-tree $BASE
GIT_INDEX_FILE=/tmp/idx-$ME git add <my files>
tree=$(GIT_INDEX_FILE=/tmp/idx-$ME git write-tree)
c=$(git commit-tree $tree -p $BASE -m '<msg>')
git update-ref refs/heads/$MY_BRANCH $c
git push origin refs/heads/$MY_BRANCH
```

This skips the pre-commit hook, so each agent must run typecheck and tests itself. Every branch ends up parented on `BASE`, and no branch stacks on a sibling by accident.

## Coordinator cleanup

1. Delete stray throwaway files the agents left in the worktree.
2. `git checkout -f BASE_BRANCH`; for each agent branch run `git branch -f <b> origin/<b>` (local refs may have drifted).
3. `gh stack init --base main BASE_BRANCH` if the stack is not registered yet. Then `gh stack add <b>` for each branch **in the desired order, checking out each as you add it** (`gh stack add` adopts the current or next branch). `gh stack sync` rebases them into one linear chain.
4. Check that `git log --oneline main..<top>` is linear, run the full gate on the top, `gh stack submit --auto`, then write the PR bodies.

## Gotchas

- `gh stack init` fails if the current branch is already in a stack; use `gh stack add` instead.
- A stale local `main` makes `main..top` look long; compare against `origin/main`.
- `gh stack merge` refuses draft PRs; mark them ready first.
