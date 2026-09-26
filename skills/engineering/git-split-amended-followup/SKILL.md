---
name: git-split-amended-followup
description: Use when a correction was amended into an implementation commit but review wants it as a separate follow-up commit. Rebuilds the original commit plus a narrow follow-up without changing the worktree tree.
---

# Split an amended commit into a narrow follow-up

Use when a correction was amended into an implementation commit but review requires that correction as a dedicated follow-up commit.

## Preconditions

- The working tree is clean.
- The original pre-amend commit still exists (find it with `git reflog` if needed).
- The current tree is the intended final tree.
- `git diff <original> HEAD` contains only the correction that should become the follow-up.

## Procedure

1. Verify the original commit and the delta:
   ```bash
   git cat-file -e <original>^{commit}
   git show --format= --name-only <original>
   git diff --name-status <original> HEAD
   git diff <original> HEAD -- <expected-correction-file>
   ```
2. Capture the current tree and branch ref:
   ```bash
   git rev-parse HEAD^{tree}
   git symbolic-ref HEAD
   ```
3. Create the follow-up commit with the current tree and the original commit as parent:
   ```bash
   git commit-tree <current-tree> -p <original> -m "<follow-up message>"
   ```
4. Advance the branch atomically, guarding against concurrent movement:
   ```bash
   git update-ref <branch-ref> <new-commit> <old-head>
   ```
5. Verify:
   ```bash
   git rev-parse HEAD HEAD^ HEAD^^
   git show --format=fuller --name-status HEAD
   git diff --check HEAD^ HEAD
   git status --short --branch
   ```

## Invariants

- `HEAD^` is the original implementation commit.
- `HEAD` changes only the intended correction file(s).
- The worktree tree is unchanged.
- Status is clean.
- Never use this if unrelated changes exist or the original commit cannot be verified.
