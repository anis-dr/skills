---
type: design
eyebrow: "anis-dr/skills · Design note"
lede: "Why a vendored skill folder is build output, and what `bun run skills sync` does to turn a pinned upstream commit into it. For anyone who edits a vendored skill or adds a rule to `src/rules.ts`."
meta: "16 Oct 2026 · read from `src/sync.ts`, `src/rules.ts`, `src/Upstream.ts` and `src/SkillTree.ts` at `af49a3a` · [CONVENTIONS.md](https://github.com/anis-dr/skills/blob/main/CONVENTIONS.md)"
stats:
  - { value: "139", label: "vendored skills that sync rebuilds", tone: none }
  - { value: "13", label: "upstream repos they come from", tone: none }
  - { value: "7", label: "agent-neutral rules in `src/rules.ts`", tone: none }
  - { value: "27", label: "skills that carry their own patch", tone: none }
toc: true
---

# How `bun run skills sync` builds a vendored skill

## Why the folder is built, not edited

Most skills in this repo are other people's text. 139 of the 185 skill folders are copies of skills from 13 upstream repos, and those upstreams keep changing [@sourcesjson]. The copies cannot stay word for word, either: upstream text names one harness's tools, model ids and folders, and every skill here has to run unchanged on omp, Claude Code, Codex, Cursor and pi.

So a vendored folder is not where the text lives. Its source is four things: the upstream commit pinned in `upstream/sources.json`, the shared rewrites in `src/rules.ts`, the entry's `invocation` override, and the skill's own patch in `upstream/patches/<name>.patch` [@patches]. `bun run skills sync` combines them and writes the result over the folder [@sync]. Running it twice gives the same folder, and a weekly job can move every pin forward without anyone touching the text by hand [@drift].

## The pipeline for one skill

```d2
pin: "Upstream at\npinned commit" {class: provider}
stage: "Scoped temp folder\n\n1. copy the entry path\n2. apply the rules\n3. apply the invocation override\n4. write openai.yaml if missing\n5. apply the skill patch" {class: part}
folder: "Skill folder\nin skills/" {class: store}
fail: "PatchConflict\nfolder unchanged" {class: part}

pin -> stage: "shallow\nfetch"
stage -> folder: "replaces\nthe folder"
stage -> fail: "patch no\nlonger applies" {style: {stroke: "#c0392b"; stroke-dash: 4}}
```

*Arrows follow the skill text from the upstream commit to the folder under `skills/`. The five stages in the temp folder run in this order for every vendored entry. The red dashed arrow is the failure path: the patch does not apply, sync stops, and the folder keeps its old content.*

`Upstream.fetchPinned` fetches one commit with `git fetch --depth 1` and checks it out under `.upstream/<source>@<sha>`. It fetches into a temporary folder and renames it at the end, so a failed fetch never looks cached, and a second skill from the same commit reuses the checkout. The pin is a full 40-character SHA because git fetches a pinned commit only by its full id [@upstream].

Everything after the fetch happens in a scoped temporary folder that closes when the skill is written. Sync copies the entry's `path` there, drops a `.git` folder that a whole-repo path brings along, and fails with `MissingUpstreamPath` if the path is gone [@sync].

The rules then run over every `.md` file. Each rule is a named list of regex rewrites: `skillCalls` turns "Run the **x** skill" into a Skill tool call, `issuesFolder` renames Matt Pocock's `.scratch/` to `.issues/`, and `modelLines` swaps hard-coded model ids for roles [@rules]. Sync records which rules changed some text. When every entry is done, a rule that matched nothing in any skill fails the run with `DeadRules`, because that rule no longer does its job [@sync; @rules].

The invocation override comes next. An entry with `invocation: model` deletes the `disable-model-invocation: true` line from `SKILL.md`, and deletes the matching policy lines from upstream's own `agents/openai.yaml`. If upstream ships no `agents/openai.yaml`, sync writes one with a title-cased `display_name` and, for a user-invoked skill, `allow_implicit_invocation: false` [@sync].

The patch goes last. Sync runs `git init` in the temp folder, runs `git apply` with the patch, and removes the `.git` again. Only then does `SkillTree.writeFolder` delete `skills/<bucket>/<name>` and copy the staged folder in its place [@skilltree].

> [!NOTE]
> A hand edit in a vendored folder is lost on the next sync. Edit the folder, then run `bun run skills patch <name>`. The command stages the skill again without its patch, diffs your folder against that staging, and writes the difference to `upstream/patches/<name>.patch`. An empty difference deletes the patch file [@sync].

## Who owns the text: the four modes

Every entry in `upstream/sources.json` has a `mode`. Sync treats each one differently, and the weekly upstream job moves only some of them [@conventions].

| Mode | Who owns the text | What sync does | When upstream changes | Entries |
|---|---|---|---|--:|
| `vendor` | Upstream | Rebuilds the whole folder with the pipeline above | `sync --update` moves the pin to upstream HEAD [@drift] | 139 |
| `fork` | Us, based on upstream at a pinned commit | Leaves the folder alone | `sync --report` lists the new commits in `upstream/DRIFT.md`; a person ports them | 8 |
| `ours` | Us, no upstream | Leaves the folder alone. With `into`, carries the file over when it rebuilds that skill's `references/` | Nothing to track | 39 |
| `reference` | Upstream, one file | Writes it into another skill's `references/` with frontmatter stripped and the rules applied | `sync --update` moves the pin | 25 |

The 39 `ours` entries are 38 skills plus one file inside the `principles` skill. The 25 `reference` entries land in two skills: 24 in `principles` and 1 in `prototype` [@sourcesjson].

## Trade-offs and the alternatives

Most of the design sits in the order of the stages. Rules run before the patch, and `bun run skills patch` diffs against a staging that already has the rules, the override and the generated metadata, so a patch records only what no shared rule covers. When upstream moves, sync fails in one of two named ways: `PatchConflict` when a patch no longer applies, or `DeadRules` when a rewrite stopped matching. I prefer that to the alternatives below, which tend to fail by producing text that looks fine and is wrong.

Editing the copies in place would be simpler on day one. It turns every upstream update into a manual three-way merge across 139 folders, which the weekly job could not do alone.

Git submodules or subtrees keep upstream history, but they carry upstream text unchanged. The agent-neutral rewrites would then need a fork of each upstream, which is the cost this design avoids.

Patches alone, with no shared rules, would work for a single skill. The rewrites in `src/rules.ts` repeat across many skills (the pstack model lines appear in several of them), and as patches each copy would conflict separately when upstream rewords a line. A regex survives small upstream edits, and the dead-rule check catches the case where it stops matching.

Forking everything gives full control and costs a review for every upstream commit. That cost is right for the 8 skills whose text has moved far from upstream and wrong for the other 139.

The design has a real cost too. A patch conflict needs a person: edit the folder until it reads right, then run `bun run skills patch <name>` again. And because `writeFolder` replaces the folder outright, nothing protects an edit that was never saved as a patch [@skilltree].

::: footer
The view on alternatives is the author's reading of the code, not a recorded decision.
:::
