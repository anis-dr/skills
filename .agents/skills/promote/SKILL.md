---
name: promote
description: Promote local skills (an agent's managed or learned skills, a project's .agents/skills) into this public repo, merging near-duplicates and stripping private details, then open a PR. Use when the user asks to promote, publish or upstream their local skills, or for a dry run listing what would move.
# Repo-only: `npx skills` skips skills marked internal.
metadata:
  internal: true
---

# Promote

Moves the reusable part of the user's local skills into this repo as **ours** skills. Every skill gets one verdict, and only public skills reach the repo.

A **dry run** stops after step 3: it prints the table and writes nothing. Run dry whenever the user asks for a list, a preview or a dry run.

## 1. Inventory

Take the folders the user names (for example `~/.omp/agent/managed-skills`, `~/.claude/skills`, a project's `.agents/skills`). Every subfolder with a `SKILL.md` is a candidate. For each, read its frontmatter and body.

Done when every candidate has its name, description and folder recorded.

## 2. Verdict

Give each candidate exactly one verdict:

- **public**: useful to anyone with the same stack or task. Examples, hosts and names can be made neutral without losing the lesson.
- **project**: only makes sense inside one private project (its services, its data, its design file). It belongs in that project's `.agents/skills/`, not here.
- **personal**: tied to the user's own accounts, clients, reports or creative projects. A tool's quirks (a DAW's API, a design tool's CLI) are public even when the user found them on a personal project.
- **drop**: stale, superseded by a newer candidate, or built to copy another company's site, store, brand or product (`CONVENTIONS.md`, "Public repo").

A name or text that matches a pattern in `upstream/private-terms.json` points to project or personal. It stays public when the private name only appears in examples and the lesson holds without it.

## 3. Match public skills against the repo

List the repo's skills (`upstream/sources.json` and `skills/*/*/SKILL.md`). For each public candidate:

- Same job as an **ours** skill (same name, or descriptions that describe one task): compare the bodies. When the repo skill already carries every gotcha, command and branch of the candidate (it was promoted before, possibly scrubbed or merged), the action is **drop, covered by** it. When the candidate has something the repo skill lacks, **merge into** it and name what is new in the Reason column.
- Same job as a **vendor**, **fork** or **reference** skill: **drop, covered by** it. Upstream owns that text; a gotcha it lacks goes to the user as a note, not into the vendored folder.
- Several candidates with one job: **add as one** ours skill merged from all of them, named after the shared job (reuse the most general candidate's name when one fits).
- Same tool or topic as an **ours** skill but a different job: **merge into** it as a new branch (`CONVENTIONS.md`, "Layout and ownership").
- Otherwise: **add** as a new ours skill, named per `CONVENTIONS.md`. Its bucket is `engineering`, `productivity` or `design` by subject, or `in-progress` when its steps have not been proven on real work more than once.

Print one table and stop here on a dry run:

| Candidate | Verdict | Action | Reason |
|---|---|---|---|
| drizzle-stale-baseline | public | merge into `drizzle` | new branch for stale snapshots |
| acme-deploy-canary | project | skip: acme's `.agents/skills/` | calls acme's staging hosts |

Done when every candidate has a row, and the row counts per action are stated under the table.

## 4. Write

For each add or merge, follow `CONVENTIONS.md`. A merge keeps every distinct gotcha, command and branch of all sources and drops only exact duplicates. A new skill gets its folder, `agents/openai.yaml`, an entry `{ "name", "bucket", "mode": "ours" }` in `upstream/sources.json`, and a line in the `ask-anis` router.

Strip every private detail: names from `upstream/private-terms.json`, other clients and products that are not public, hosts, account ids, emails, usernames, local absolute paths, ticket and branch ids. Replace them with neutral examples (`acme-api`, `example.com`). Add any new private name you removed to `upstream/private-terms.json` (it stays out of git) so `check` catches it next time.

Done when `bun run skills check` prints `0 findings` and `git diff` shows no private detail.

## 5. Open the PR

Work on a branch (`git switch -c promote/<topic>`), commit one bucket per commit (`feat: promote <bucket> skills`), and show the user the table and the diff summary. Push and open the PR with `gh pr create` only after the user confirms: the repo is public.

## Reply

The table, the counts per action, and on a real run the PR link.
