---
type: how-to
eyebrow: "anis-dr/skills · How-to guide"
lede: "Add a new skill of your own to anis-dr/skills so that `bun run skills check` passes and the `/ask-anis` router lists it. For a contributor with a clone of the repo."
meta: "16 Oct 2026 · commands from `src/cli.ts`, rules from [CONVENTIONS.md](https://github.com/anis-dr/skills/blob/main/CONVENTIONS.md)"
---

# Add a skill to anis-dr/skills

## Before you start

You need these items:

- A clone of `anis-dr/skills` with its packages installed (`bun install`).
- Bun. The weekly CI job uses Bun 1.3.14.
- A local copy of `upstream/private-terms.json`. This file stays out of git. Without it, `bun run skills check` stops with `PrivateTermsMissing`. Get the file from the repo owner.

> [!TIP]
> If a skill for the same tool or topic exists, do not add a new skill. Add a branch to the existing skill: put the procedure in `references/<branch>.md` and add one pointer line to its `SKILL.md`. You then do not need a new `sources.json` entry or a router line.

## Add the skill

The example skill is `changelog-entry` in the `productivity` bucket. Use your own name and bucket.

> [!CAUTION]
> Do not write a private name, a client name, a host name, or an email address in a skill. The repo is public. Git keeps the text in the history after you remove it. `bun run skills check` finds only the names in `upstream/banned-terms.json` and `upstream/private-terms.json`.

::: steps
1. **Select the bucket and the name**
   Select one bucket: `engineering`, `productivity`, `design`, `in-progress`, `marketing`, or `misc`. Give the skill a name of one to three words. Use the words that a user types to find the skill. Do not add `-patterns` or `-safety` to the name.
2. **Write SKILL.md**
   Make the folder `skills/<bucket>/<name>/`. Write `SKILL.md` in the folder. Make sure that `name` is the same as the folder name. Make sure that `description` has a maximum of 1024 characters.

   ```markdown
   ---
   name: changelog-entry
   description: "Write a changelog entry for a merged pull request. Use for release notes."
   ---

   # Changelog entry
   ```
3. **Set the invocation**
   Most skills are model-invoked. For a model-invoked skill, write the `description` for the model and keep its triggers ("Use when..."). If only a person can start the skill, add `disable-model-invocation: true` to the frontmatter. For a user-invoked skill, write the `description` as one line for a person.
4. **Write agents/openai.yaml**
   Write `agents/openai.yaml` next to `SKILL.md`. Use the title-case name for `display_name`.

   ```yaml
   interface:
     display_name: "Changelog Entry"
     short_description: "Write one changelog entry from a merged pull request"
   ```

   For a user-invoked skill, add these two lines at the end of the file:

   ```yaml
   policy:
     allow_implicit_invocation: false
   ```
5. **Add the entry to sources.json**
   Add one entry to the array in `upstream/sources.json`. Use the mode `ours` for a skill that has no upstream.

   ```json
   { "name": "changelog-entry", "bucket": "productivity", "mode": "ours" }
   ```
6. **Add the skill to the router**
   Open `skills/engineering/ask-anis/SKILL.md`. Find the section for your topic. Add one line that starts with the `/name` label.

   ```markdown
   - **`/changelog-entry`** writes one changelog entry from a merged pull request.
   ```
7. **Write the README skill list again**
   Run this command from the repo root. The command writes the list between the `skills:start` and `skills:end` markers in `README.md`.

   ```bash
   bun run skills readme
   ```
8. **Do the check**
   Run this command from the repo root. Make sure that the last line of the output is `0 findings`.

   ```bash
   bun run skills check
   ```
:::

To add a skill that comes from an upstream repo, use the mode `vendor`. Give the entry a `source`, a `path`, and a full 40-character `commit`. Then run `bun run skills sync`. Do not edit the vendored folder without a patch: run `bun run skills patch <name>` after each edit.

## If a command fails

`bun run skills check` prints one line for each finding: the skill, the rule, and the detail. The last row is an error from `bun run skills sync`.

| Finding | Cause | Fix |
|---|---|---|
| `engineering/ask-anis: router: "changelog-entry": skill missing from the router` | The router has no `/changelog-entry` label. | Do step 6. |
| `README.md: readme: the skill list is stale` | The skill list in `README.md` does not show the new skill. | Do step 7. |
| `productivity/changelog-entry: orphan-folder: no entry in upstream/sources.json` | The folder has no entry in `sources.json`. | Do step 5. |
| `productivity/changelog-entry: frontmatter: name "changelog" differs from the folder name` | The `name` field and the folder name are different. | Make the two names the same. |
| `productivity/changelog-entry: invocation: agents/openai.yaml is missing` | The skill has no `agents/openai.yaml`. | Do step 4. |
| `productivity/changelog-entry: invocation: disable-model-invocation is true but agents/openai.yaml allows implicit invocation` | The frontmatter and the `policy` lines do not agree. | Add the `policy` lines, or remove `disable-model-invocation: true`. |
| `engineering/tdd: its patch no longer applies` | Upstream changed the lines that the skill's patch changes. | Edit the folder until the text is correct. Then run `bun run skills patch tdd`. |
