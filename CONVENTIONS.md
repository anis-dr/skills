# Conventions

How a skill in this repo is written. Every skill must run unchanged on omp, Claude Code, Codex, Cursor and pi.

## Layout and ownership

A skill lives at `skills/<bucket>/<name>/SKILL.md`, with buckets `engineering`, `productivity`, `design`, `in-progress` (beta) and `misc` (kept around, rarely used). Vendored skills keep the bucket their upstream gives them. Its frontmatter `name` equals the folder name, and its `description` stays within 1024 characters.

Name a skill after its job in one to three words, the way the user would ask for it (`drizzle-postgres`, `measure-ui`, `stacked-prs`). Leave out filler (`-safety`, `-patterns`, `-verification`) and jargon. One tool or topic is one skill: when a new lesson belongs to a topic that already has a skill, it becomes a branch there, with its procedure in `references/<branch>.md` and one pointer line in `SKILL.md`.

Every skill has one entry in `upstream/sources.json`. The entry's `mode` says who owns the text:

- **vendor**: an upstream copy. `bun run skills sync` builds the folder from the pinned upstream commit, then applies the agent-neutral rules in `src/rules.ts`, the entry's `invocation` override, generated `agents/openai.yaml` when upstream ships none, and `upstream/patches/<name>.patch`. A hand edit alone is lost on the next sync: edit the folder, then run `bun run skills patch <name>` to save the edit as the skill's patch. A rewrite that several skills need belongs in `src/rules.ts` instead.
- **fork**: our text, based on upstream text at a pinned commit; `path` lists one upstream path or several. `bun run skills sync --report` reports upstream changes to any of them, and they are ported by review.
- **ours**: no upstream.
- **reference**: one upstream file that sync writes into another skill's `references/` folder, frontmatter stripped. That skill's `SKILL.md` links every file in the folder.

The `ask-anis` router maps every skill by its `/name` label. Adding, renaming or removing a skill means updating the router: `bun run skills check` fails on a skill the router leaves out or a `/name` that is not a skill.

## Invocation

Every skill is either model-invoked or user-invoked. This follows Matt Pocock's rules.

- **Model-invoked** is the default: the model or the user can reach it. The `description` is written for the model and keeps its triggers ("Use when the user wants..."). Keep a skill model-invoked when the model could usefully reach for it without being asked.
- **User-invoked** skills are reachable only by the human typing the name. Set `disable-model-invocation: true` in the frontmatter and `policy.allow_implicit_invocation: false` in `agents/openai.yaml`. The `description` is a one-line summary for a person browsing commands, with no trigger list.

A user-invoked skill may call model-invoked skills. No skill can call a user-invoked one: when a step depends on it, tell the user to run `/name`.

Every skill carries `agents/openai.yaml` beside its `SKILL.md`, holding the Codex picker text (`interface.display_name`, `interface.short_description`) and, for user-invoked skills, the policy line. The frontmatter and the policy line always agree.

## Calling other skills

A step that runs another skill says so with the tool: `Call the Skill tool with "grilling"`. The tool takes one skill per call, so a step needing two says `Call the Skill tool twice, for "grilling" and "domain-modeling"`. Prose that only names skills for a human to choose from, such as a router, keeps `/name` labels.

Reference material shared by several skills lives inside the skill that owns it. Other skills reach it by calling the Skill tool with the owner, never by linking into another skill's folder.

A skill outside this repo is a recommended skill. Name it with its install command, and tell the agent what to do when it is missing: `If "install-anti-slop" isn't installed, ask the user to run npx skills add dmmulroy/anti-slop --skill install-anti-slop, then continue.`

## Harness-neutral wording

- Describe a subagent by its role and constraints ("a read-only research subagent", "a subagent that runs in the background"), never by one harness's tool parameters.
- Name models by role: "your strongest judgment model", "a fast model", "a model from another family". Model ids and model config files belong to one harness.
- Facts that differ per harness live in one skill that owns them, which other skills call. Transcript locations live in the `transcripts` skill. Its banned-term exemption (`allowIn` in `upstream/banned-terms.json`) is the only place a harness path may appear.
- Links, paths and commands work in every harness: no `skill://` links, no paths under one harness's home folder.

## Public repo

This repo is public. No skill copies another company's site, store, brand or product, or names one as the thing to copy. Skills name no private project, host or account; examples use neutral names such as `acme-api` and `example.com`. `bun run skills check` fails on any pattern in `upstream/banned-terms.json` (harness-only terms) or in `upstream/private-terms.json` (private names). The private file stays out of git: keep a local copy, and CI writes it from the `SKILLS_PRIVATE_TERMS` secret.

## Prose

No em dashes in text we write (Matt's rule). Rewrite the sentence with a comma, colon, period or parentheses, whichever it needs. Vendored text keeps upstream's punctuation.
