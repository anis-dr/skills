---
type: status
eyebrow: "anis-dr/skills · Status report"
lede: "Where the skill catalogue stands on 16 October 2026: what it holds, which rules a script checks, and where the technical-html work goes next. A living document: it is rewritten in place as the work moves. For the repo owner and anyone who installs from the repo."
meta: "Updated 16 Oct 2026 · counted on `main` at `1113ecf` · [upstream/sources.json](https://github.com/anis-dr/skills/blob/main/upstream/sources.json)"
stats:
  - { value: "185", label: "skill folders under skills/", tone: none }
  - { value: "139", label: "of them vendored from 13 upstream repos", tone: none }
  - { value: "0", label: "findings from `bun run skills check`", tone: good }
  - { value: "40 of 40", label: "tests pass in `bun run test`", tone: good }
---

# Skill catalogue status: checks pass, two rules still rely on review

## Summary

The repo holds 185 skills. 139 are vendored copies that `bun run skills sync` rebuilds from a pinned upstream commit, 8 are forks of upstream text, and 38 are our own [@sourcesjson]. `bun run skills check` reports 0 findings and all 40 tests pass [@check; @tests]. The technical-html skill is rebuilt as a Markdown builder, pushed to `main` and installed from GitHub.

> [!WARNING]
> Two rules have no script behind them. Nothing checks for em dashes, and `bun run skills check` runs only inside the weekly upstream job [@workflow]. A push that breaks a rule shows up at the next Monday 06:00 UTC run at the earliest.

## What the catalogue holds

Each skill folder has one entry in `upstream/sources.json`, and the entry's `mode` says who owns the text. User-invoked skills set `disable-model-invocation: true`, so only a person typing `/name` can start them [@userinvoked].

| Bucket | Vendor | Fork | Ours | Skills | User-invoked |
|---|--:|--:|--:|--:|--:|
| engineering | 50 | 7 | 24 | 81 | 21 |
| marketing | 50 | 0 | 0 | 50 | 0 |
| productivity | 15 | 0 | 8 | 23 | 7 |
| design | 15 | 1 | 5 | 21 | 2 |
| in-progress | 5 | 0 | 1 | 6 | 5 |
| misc | 4 | 0 | 0 | 4 | 0 |
| **Total** | **139** | **8** | **38** | **185** | **35** |

`sources.json` has 211 entries in all. The other 26 are files, not skills: 25 `reference` entries that sync writes into another skill's `references/` folder (24 into `principles`, 1 into `prototype`), and 1 `ours` entry with `into`, our own file inside `principles`. Of the 139 vendored skills, 27 carry a patch in `upstream/patches/` and 8 carry an `invocation: model` override [@sourcesjson].

## How a change reaches an installed agent

```d2
tree: "Working tree" {class: part}
github: "GitHub main" {class: provider}
add: "npx skills add -g" {class: part}
agents: "~/.agents/skills" {class: store}
lock: ".skill-lock.json" {class: store}
claude: "~/.claude/skills" {class: part}

tree -> github: "git push"
github -> add: "fetch"
tree -> add: "local install\n(testing only)" {class: back}
add -> agents: "copies each\nskill folder"
add -> lock: "records source\nand folder hash"
agents -> claude: "symlinked\nper skill"
```

*Arrows follow the skill files from the repo to the folder an agent reads. The dashed arrow is a local install from the working tree, used only to test a skill before it is pushed.*

An edit in the working tree does nothing for an installed agent until it is pushed and installed again [@claudeskills]. The lock file entry for technical-html reads `"sourceType": "github"` with an update time of 21:38 UTC on 16 Oct 2026, so agents load the Markdown builder from `main` [@lockfile].

## Checks the repo enforces

`bun run skills check` runs every rule below in one pass and exits 1 on any finding [@conventions]. Each row names the finding kind it prints, from `src/check.ts` [@checkts].

| Rule | Status | Enforced by |
|---|---|---|
| Frontmatter `name` equals the folder name | `status:built` | `frontmatter` |
| `description` is at most 1024 characters | `status:built` | `frontmatter` |
| Every folder has a `sources.json` entry, and every entry has a folder | `status:built` | `orphan-folder`, `missing-folder` |
| The `ask-anis` router names every skill, and only skills | `status:built` | `router` |
| No banned or private term in any skill file (6 public patterns, 8 private) [@bannedterms] | `status:built` | `banned-term` |
| `agents/openai.yaml` exists and agrees with `disable-model-invocation` | `status:built` | `invocation` |
| A Skill tool call names a model-invoked skill here or carries an install command | `status:built` | `skill-call` |
| The skill list in `README.md` matches the folders | `status:built` | `readme` |
| No em dashes in text we write | `status:gap Not checked` | Review only. 0 of our 38 skills contain one today [@emdash]. |
| The checks run on every push | `status:partly Weekly only` | `.github/workflows/upstream.yml`, Mondays 06:00 UTC [@workflow] |

The em dash rule covers our text only. Vendored text keeps upstream punctuation, and 488 files under `skills/` contain at least one em dash [@emdash], so a check has to skip `vendor` and `reference` folders.

## Roadmap: the technical-html work

::: steps
1. **Add the skill and pass the checks** `status:done`
   technical-html has an `ours` entry in `sources.json` and a line in the `ask-anis` router. `bun run skills check` reports 0 findings with it in place.
2. **Rebuild it as a Markdown builder** `status:done`
   `scripts/build.ts` turns one Markdown file into one self-contained HTML file, and four example documents, this page among them, show each document type.
3. **Push and reinstall from GitHub** `status:done`
   Pushed to `main` at `1113ecf`. `npx skills@latest add anis-dr/skills --skill technical-html -g` moved the lock file entry from the local folder to GitHub.
4. **Run the checks on every push** `status:here`
   Waits on the first open decision below. Until then, `bun run skills check` runs only in the weekly upstream job.
5. **Rebuild the example pages in a check**
   A script builds the five examples and fails when a committed `.html` differs, so a change to `style.css` cannot leave them stale.
:::

## Open decisions

| Question | Who decides | What it blocks |
|---|---|---|
| Should `bun run skills check` run on every push and pull request, not only in the weekly job? | Repo owner | Catching a broken rule before it lands on `main` |
| Should `check` fail on an em dash in `ours` and `fork` skills? | Repo owner | Turning the em dash row green |
| Should a script rebuild the example HTML files and fail when one is stale? | Repo owner | Step 5 of the roadmap |

## Risks

::: card
**TALA is a separate install.** The build calls `d2 --layout=tala`, and TALA ships as its own plugin binary, `d2plugin-tala`, beside `d2`. On a machine without it every diagram fails, so the whole build fails. SKILL.md stating the install step, and a build error that names the plugin, retire this risk.

**The builder rides on fast-moving packages.** The builder is a SvelteKit app that prerenders the page, with mdsvex for the Markdown and Pierre for code and diffs, pinned in `app/bun.lock`. An upgrade that changes their HTML output changes every page. Rebuilding the examples after each upgrade and reading the diff catches it.

**The example pages can go stale.** The five built `.html` files are committed beside their sources. A change to `style.css`, `house.d2` or the plugins in `app/` without a rebuild leaves them showing the old look. Step 5 retires this risk.
:::
