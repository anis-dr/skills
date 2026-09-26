---
name: dependabot-backlog
description: Use when a repo has a backlog of open Dependabot PRs to consolidate into one verified batch PR, and to configure grouped updates so the backlog does not come back.
---

# Dependabot batch PR

Use when a repo has accumulated many open Dependabot PRs and the user wants them consolidated.

## 1. Inventory and dedupe

1. `gh pr list --author "app/dependabot" --state open --json number,title,createdAt`. Titles encode "bump X from A to B [in /dir]".
2. Confirm suspected duplicates by touched files (`gh api repos/OWNER/REPO/pulls/N/files --jq '.[].filename'`), never by title alone. A true duplicate is the same package, the same file, and the same or an older target version. Watch for one grouped PR covering several directories that individual per-directory PRs also cover.
3. Close duplicates and superseded PRs with a comment naming the survivor (`gh pr close N --comment "Duplicate of #M ..."`). Dependabot won't recreate a closed PR for the same version.

## 2. Extract exact bumps

`gh api repos/OWNER/REPO/pulls/N/files --jq '.[] | .filename, .patch'` gives the exact before and after lines, including range prefixes (`^`) that titles omit. Apply them as literal string replacements per `package.json`.

## 3. Branch and apply

- Branch off the up-to-date base (`git fetch origin <base> && git checkout -B user/deps-batch origin/<base>`).
- Apply all bumps, then run ONE install for a coherent lockfile.
- Risk-triage: majors and formatter or linter bumps get individual attention. A formatter bump that reformats files can break more than formatting (for example an oxfmt reformat tripping TS2589). If it churns, consider dropping it from the batch into its own PR.

## 4. Prevent recurrence

Rewrite the per-directory blocks in `dependabot.yml` into one `package-ecosystem` block with `directories: [...]` plus `groups:`. Put family groups first (order matters: the first matching group wins), then a `minor-and-patch` catch-all with `update-types`. Majors still get individual PRs. Check that nothing non-npm (github-actions, docker), no `ignore:` entry, and no label gets dropped.

## 5. Verify

- Lint or format check, typecheck, boot the app, hit a health endpoint.
- Smoke every major specifically (for example chalk 5 to 6 is ESM-only: boot the CLI that uses it).
- If local test failures are provably pre-existing environment drift, document them and let CI on a clean environment be the gate. Prove it by comparing against a stashed baseline, and remember that stash does NOT revert `node_modules`: a stash baseline isolates FILE changes, not dependency changes.

## 6. Ship

- PR body: a table of package, from, to, and superseded PR number, the exclusions with reasons, and the verification evidence.
- Leave the remaining Dependabot PRs open before merge. Dependabot auto-closes them once the base branch satisfies the bumped versions.
- Watch CI to green before declaring done. A brand-new security advisory can fail scans on every PR: check `gh api /advisories/GHSA-...` for the publish date, and whether the base branch has the same vulnerable version, before assuming your PR caused it.

## Gotchas

- `git stash apply stash@{0}` after your own stash was already popped grabs someone's OLD stash and makes a conflict mess. Recover surgically with `git stash show --name-only stash@{0} | xargs git restore --source=HEAD --staged --worktree --`; never `reset --hard`.
- An empty `git diff` after a failed commit usually means the changes are still STAGED (`git diff --cached`).
