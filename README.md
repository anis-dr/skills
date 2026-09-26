# Skills

Agent skills for engineering, writing and design work, in one repo that installs on omp, Claude Code, Codex, Cursor and pi. It holds:

- Matt Pocock's [skills](https://github.com/mattpocock/skills), vendored unchanged.
- Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) and Cursor's [cursor-team-kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit) skills, rewritten so they run outside Cursor.
- Our own skills, distilled from day-to-day work.

A weekly job pulls upstream changes into a pull request, so vendored skills stay current.

## Install

Every skill:

```bash
npx skills@latest add anis-dr/skills
```

One skill:

```bash
npx skills@latest add anis-dr/skills --skill <name>
```

Add `-g` to install into your user folder instead of the current project. Not sure which skill fits? Run `/ask-anis`: it maps every skill here and how they connect.

## Skills

<!-- skills:start -->
### Engineering

**User-invoked**

- [architect](skills/engineering/architect/SKILL.md): Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in.
- [arena](skills/engineering/arena/SKILL.md): Spawn N parallel candidates at the same task, pick a base, graft the strongest parts of the losers into it.
- [ask-anis](skills/engineering/ask-anis/SKILL.md): Find the right skill or workflow
- [automate-me](skills/engineering/automate-me/SKILL.md): Use for "automate me", "create/update/refresh my -mode skill", "turn/capture my preferences or working style into a skill", or wanting agents to follow how the user works.
- [blast-radius](skills/engineering/blast-radius/SKILL.md): Find what a change could break somewhere else before it ships, beyond the diff, and prove the one fact it's safe because of by running real code instead of writing it up.
- [create-verification-skill](skills/engineering/create-verification-skill/SKILL.md): Generate a project-local verification skill that drives your app the way a user does — any language, framework, or platform.
- [grill-with-docs](skills/engineering/grill-with-docs/SKILL.md): Grill a design and write its docs
- [implement](skills/engineering/implement/SKILL.md): Build work from a spec or tickets
- [improve-codebase-architecture](skills/engineering/improve-codebase-architecture/SKILL.md): Find and grill architecture improvements
- [interrogate](skills/engineering/interrogate/SKILL.md): Use for "interrogate", "adversarial review", "multi-model review", "challenge this", "stress test this code", "find blind spots", or "tear this apart".
- [maintain-verification-skill](skills/engineering/maintain-verification-skill/SKILL.md): Periodic pass that keeps a project's verification skill and feature map honest: parallel source readers per feature, one live session driving every feature, at most one PR of proven corrections.
- [recall](skills/engineering/recall/SKILL.md): Reconstruct your recent working context from your own chat history, live state, and the shared record (user reports, prior fixes, incidents), then hand back a tight current-state brief.
- [setup-matt-pocock-skills](skills/engineering/setup-matt-pocock-skills/SKILL.md): Configure a repo for the skills
- [show-me-your-work](skills/engineering/show-me-your-work/SKILL.md): Keep a reviewable decision trail for long-running or unattended work: a TSV log with one row per decision (what, why, evidence, result).
- [to-spec](skills/engineering/to-spec/SKILL.md): Turn a conversation into a spec
- [to-tickets](skills/engineering/to-tickets/SKILL.md): Split a plan into tracer-bullet tickets
- [triage](skills/engineering/triage/SKILL.md): Move issues through triage roles
- [wayfinder](skills/engineering/wayfinder/SKILL.md): Map a large effort as decision tickets

**Model-invoked**

- [agent-sources](skills/engineering/agent-sources/SKILL.md): Read a dependency's source at the installed version
- [anti-slop-migration](skills/engineering/anti-slop-migration/SKILL.md): Fix anti-slop lint findings without type laundering
- [avoid-feature-creep](skills/engineering/avoid-feature-creep/SKILL.md): Keep scope tight: MVPs, backlogs, one-more-feature
- [bun-monorepo](skills/engineering/bun-monorepo/SKILL.md): Bun catalogs, patches and Changesets publishing
- [code-review](skills/engineering/code-review/SKILL.md): Review a diff on standards and spec
- [codebase-design](skills/engineering/codebase-design/SKILL.md): Vocabulary for deep-module design
- [control-cli](skills/engineering/control-cli/SKILL.md): Build or adapt a local harness to drive, inspect, and profile an interactive CLI or TUI without external services.
- [control-ui](skills/engineering/control-ui/SKILL.md): Build or adapt a local browser/CDP harness to drive and inspect a web, IDE, or Electron UI.
- [dependabot-backlog](skills/engineering/dependabot-backlog/SKILL.md): Merge a Dependabot backlog into one verified PR
- [deslop](skills/engineering/deslop/SKILL.md): Remove AI-generated code slop and clean up code style
- [diagnosing-bugs](skills/engineering/diagnosing-bugs/SKILL.md): Diagnose hard bugs and regressions
- [domain-modeling](skills/engineering/domain-modeling/SKILL.md): Build and sharpen a domain model
- [drizzle](skills/engineering/drizzle/SKILL.md): Drizzle bulk params, migration merges, baselines
- [get-pr-comments](skills/engineering/get-pr-comments/SKILL.md): Fetch and summarize review comments from the active pull request
- [git-split-amended-followup](skills/engineering/git-split-amended-followup/SKILL.md): Split an amended fix into its own follow-up commit
- [how](skills/engineering/how/SKILL.md): Use for "how does X work", code walkthroughs before changing something, and placement / ownership / layering questions ("where should this live", "which package owns this", "is this the right layer").
- [likec4-postcss-isolation](skills/engineering/likec4-postcss-isolation/SKILL.md): Stop root PostCSS config breaking likec4 serve
- [loop-on-ci](skills/engineering/loop-on-ci/SKILL.md): Monitor PR checks and fix failures until green.
- [make-pr-easy-to-review](skills/engineering/make-pr-easy-to-review/SKILL.md): Prepare PRs for review by cleaning noisy history, improving PR descriptions, and adding reviewer guidance without changing code behavior.
- [orca](skills/engineering/orca/SKILL.md): Verify UI and hand off tickets inside Orca
- [parallel-branches](skills/engineering/parallel-branches/SKILL.md): Parallel subagents in one worktree to a gh stack
- [pr-size-breakdown](skills/engineering/pr-size-breakdown/SKILL.md): Honest LOC breakdown for a large GitHub PR
- [pragmatic-effect](skills/engineering/pragmatic-effect/SKILL.md): Keep Effect code simple and practical
- [principles](skills/engineering/principles/SKILL.md): Engineering principles, one per decision
- [prototype](skills/engineering/prototype/SKILL.md): Prototype to answer a design question
- [query-timeout-diagnosis](skills/engineering/query-timeout-diagnosis/SKILL.md): Query timeouts while the database is healthy
- [rds-snapshot-dump](skills/engineering/rds-snapshot-dump/SKILL.md): Portable pg_dump from an RDS Postgres snapshot
- [research](skills/engineering/research/SKILL.md): Research from high-trust sources
- [resolving-merge-conflicts](skills/engineering/resolving-merge-conflicts/SKILL.md): Resolve merge and rebase conflicts
- [setup-effect-toolchain](skills/engineering/setup-effect-toolchain/SKILL.md): Set up tsgo, Oxlint and oxfmt for Effect repos
- [spec-port-diverged-branch](skills/engineering/spec-port-diverged-branch/SKILL.md): Port a commit across diverged branches as a spec
- [stacked-prs](skills/engineering/stacked-prs/SKILL.md): Create, verify and unblock GitHub stacked PRs
- [system-flow-plan](skills/engineering/system-flow-plan/SKILL.md): Executor-ready plans as flows, not pasted code
- [tanstack-start-middleware](skills/engineering/tanstack-start-middleware/SKILL.md): Server-only imports in TanStack Start middleware
- [tdd](skills/engineering/tdd/SKILL.md): Test-driven red-green-refactor
- [transcripts](skills/engineering/transcripts/SKILL.md): Find session transcripts per harness
- [typescript-best-practices](skills/engineering/typescript-best-practices/SKILL.md): TypeScript best practices.
- [verify-api-shape](skills/engineering/verify-api-shape/SKILL.md): Check live API responses before trusting fixtures
- [verify-this](skills/engineering/verify-this/SKILL.md): Verify a claim with fresh local evidence: restate it falsifiably, capture baseline and treatment, compare artifacts, and return VERIFIED, NOT VERIFIED, or INCONCLUSIVE.
- [wayfinder-reversal](skills/engineering/wayfinder-reversal/SKILL.md): Handle wayfinder reversals and close the map
- [why](skills/engineering/why/SKILL.md): Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, or data-backed thresholds.
- [wizard](skills/engineering/wizard/SKILL.md): Generate an interactive setup wizard

### Productivity

**User-invoked**

- [grill-me](skills/productivity/grill-me/SKILL.md): Sharpen a plan through interview
- [handoff](skills/productivity/handoff/SKILL.md): Compact a conversation into a handoff
- [teach](skills/productivity/teach/SKILL.md): Learn a concept in a guided workspace
- [technical-writing](skills/productivity/technical-writing/SKILL.md): Layered technical-writing standard: Diátaxis structure, Google developer style sentences, STE instruction rules, Global English syntax.
- [to-questionnaire](skills/productivity/to-questionnaire/SKILL.md): Front-load questions into a doc for someone to answer
- [wait-what](skills/productivity/wait-what/SKILL.md): Re-pitch that: simpler, with the context I'm missing

**Model-invoked**

- [checkbox-picker](skills/productivity/checkbox-picker/SKILL.md): Bulk keep/delete choices in a local picker
- [grilling](skills/productivity/grilling/SKILL.md): Stress-test thinking a round of questions at a time
- [macos-uninstall](skills/productivity/macos-uninstall/SKILL.md): Remove a macOS app and all its leftovers
- [scratchpad](skills/productivity/scratchpad/SKILL.md): Throwaway work in a gitignored folder
- [technical-pdf](skills/productivity/technical-pdf/SKILL.md): Typst technical PDFs with verified layout
- [trademark-search](skills/productivity/trademark-search/SKILL.md): Search trademark registers through TMview
- [typst-quote](skills/productivity/typst-quote/SKILL.md): Client quotes in Typst with computed prices
- [unslop](skills/productivity/unslop/SKILL.md): Cut AI tells from any writing.
- [vscode-theme-to-zed](skills/productivity/vscode-theme-to-zed/SKILL.md): Port a VS Code color theme to Zed
- [writing-for-agents](skills/productivity/writing-for-agents/SKILL.md): Write documents agents consume

### Design

**Model-invoked**

- [design-references](skills/design/design-references/SKILL.md): Mobbin references as a catalog to pick from
- [logo-surface-board](skills/design/logo-surface-board/SKILL.md): Judge logo marks on favicon, tile and nav
- [measure-ui](skills/design/measure-ui/SKILL.md): Prove UI fidelity and states by measuring
- [pen-dev](skills/design/pen-dev/SKILL.md): Design, gate and migrate tokens in pen.dev files
- [redesign-inventory](skills/design/redesign-inventory/SKILL.md): Redesign a UI without dropping any control
- [refactoring-ui](skills/design/refactoring-ui/SKILL.md): Refactoring UI rules, scales and review checklist

### In progress (beta)

**User-invoked**

- [implement-spec](skills/in-progress/implement-spec/SKILL.md): Implement a whole spec as one PR
- [retro](skills/in-progress/retro/SKILL.md): Conduct a retrospective on a coding session.
- [writing-beats](skills/in-progress/writing-beats/SKILL.md): Assemble raw material into beats
- [writing-fragments](skills/in-progress/writing-fragments/SKILL.md): Mine raw writing fragments
- [writing-shape](skills/in-progress/writing-shape/SKILL.md): Shape raw material into an article

**Model-invoked**

- [pr](skills/in-progress/pr/SKILL.md): Write a PR body that's fast to review
- [youtube-video-to-skill](skills/in-progress/youtube-video-to-skill/SKILL.md): Turn a video tutorial into a skill with frames

<!-- skills:end -->

## Working on this repo

`bun install`, then:

| Command | What it does |
|---|---|
| `bun run skills sync` | Rebuilds every vendored skill from its pinned upstream commit, then applies the agent-neutral rules and patches. |
| `bun run skills sync --report` | Writes `upstream/DRIFT.md`: upstream commits since each pin. |
| `bun run skills sync --update` | Moves vendored skills to upstream HEAD and writes the report. |
| `bun run skills patch <name>` | Saves hand edits to a vendored skill as its patch. |
| `bun run skills check` | Checks frontmatter, invocation, skill calls, banned terms, the router and this README. |
| `bun run skills readme` | Regenerates the skill list above. |

[CONVENTIONS.md](CONVENTIONS.md) says how a skill here is written. Upstream sources and licenses are in [NOTICE.md](NOTICE.md).
