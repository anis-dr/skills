---
name: github-gh-stack
description: Use when creating, adopting, submitting, syncing, or verifying official GitHub Stacked PRs with the gh-stack CLI, especially when branches or ordinary PRs already exist.
---

# GitHub stacked PRs with `gh stack`

Use this when the user asks for official GitHub Stacked PRs, especially when branches or ordinary PRs already exist.

## Key invariant

A chain of PR base branches is not automatically a GitHub Stack. The stack must be registered through `gh stack submit` (or the stack API).

## Existing branches and PRs

1. Ensure `gh stack` is installed:

   ```bash
   gh stack --help
   ```

   If it is missing and the user approved installation:

   ```bash
   gh extension install github/gh-stack
   ```

2. Fetch and fast-forward the local trunk branch to its remote. Never initialize against a stale local trunk.

3. Ensure the branch history is linear and ordered bottom to top:

   ```text
   trunk
   └── bottom
       └── middle
           └── top
   ```

4. Adopt the branches in bottom-to-top order:

   ```bash
   gh stack init --base <trunk> <bottom> <middle> <top>
   ```

5. Register the stack and create or update PRs:

   ```bash
   gh stack submit --auto --open
   ```

6. Synchronize local branches, PR bases, and remote stack metadata:

   ```bash
   gh stack sync
   ```

7. Verify the official stack exists:

   ```bash
   gh stack view --short
   gh stack view --json
   ```

The output must show a `Stack #<number>`. Correct PR base branches alone are insufficient proof.

## Empty top branch

If the top branch has no commits beyond its parent, GitHub cannot create a PR for it. `gh stack` may still track the branch locally. After the first commit:

```bash
gh stack submit --auto --open
```

This adds the new PR to the existing stack.

## Updating a lower layer

After changing or rebasing a lower branch:

1. Rebase upper branches through the stack.
2. Force-push only with lease.
3. Run `gh stack sync` or `gh stack submit`.
4. Verify the stack again with `gh stack view`.

## Safety checks

- Compare the candidate root against the actual trunk before opening a root PR.
- Refuse an accidentally huge or diverged root PR; port the focused commits onto the current trunk first.
- Preserve PR descriptions and changesets when adopting existing PRs.
- Report any branch that lacks a PR and why.
