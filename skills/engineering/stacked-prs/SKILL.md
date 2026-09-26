---
name: stacked-prs
description: Official GitHub Stacked PRs with the gh-stack CLI. Use when creating, adopting, submitting, syncing, updating or verifying a stack, especially when branches or ordinary PRs already exist. Also use when a stacked PR shows CONFLICTING or DIRTY on GitHub while local git merges cleanly against the PR base.
---

# GitHub stacked PRs with `gh stack`

A stack is a chain of PRs, bottom to top, registered with GitHub through the `gh stack` CLI extension.

## Key invariant

A chain of PR base branches is not automatically a GitHub Stack. The stack must be registered through `gh stack submit` (or the stack API). Verify with:

```bash
gh stack view --short
gh stack view --json
```

The output must show a `Stack #<number>`. Correct PR base branches alone are insufficient proof.

## Stack trunk

The stack trunk is the base of the bottom PR. GitHub evaluates every PR in the stack against it, so initialize, rebase and simulate merges against the stack trunk, fetched fresh from the remote.

## Branches

- [Create and submit](references/create-and-submit.md): building a stack, adopting existing branches or PRs, adding a PR for an empty top branch, or updating a lower layer.
- [Phantom conflict](references/phantom-conflict.md): a stacked PR reads `CONFLICTING` or `DIRTY` on GitHub, but local git merges cleanly against its base.
