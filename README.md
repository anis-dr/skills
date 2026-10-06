# Skills

Agent skills for engineering, writing and design work, in one repo that installs on omp, Claude Code, Codex, Cursor and pi. It holds:

- Matt Pocock's [skills](https://github.com/mattpocock/skills), vendored unchanged.
- Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) and Cursor's [cursor-team-kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit) skills, rewritten so they run outside Cursor.
- Corey Haines' [marketing skills](https://github.com/coreyhaines31/marketingskills), Vercel's [agent skills](https://github.com/vercel-labs/agent-skills), Teever's [Effect skills](https://github.com/teeverc/effect-ts), supermemory's [svg-animations](https://github.com/supermemoryai/skills), 0xpili's [simplified-technical-english](https://github.com/0xpili/simplified-technical-english), Boris Tane's [logging-best-practices](https://github.com/boristane/agent-skills) and Emil Kowalski's [break-ui and mobile-native](https://github.com/emilkowalski/skills), vendored unchanged.
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
- [eval](skills/engineering/eval/SKILL.md): Blind test a skill or prompt change across models
- [grill-with-docs](skills/engineering/grill-with-docs/SKILL.md): Grill a design and write its docs
- [implement](skills/engineering/implement/SKILL.md): Build work from a spec or tickets
- [implement-spec](skills/engineering/implement-spec/SKILL.md): Implement the result of /to-spec and /to-tickets in code.
- [improve-codebase-architecture](skills/engineering/improve-codebase-architecture/SKILL.md): Find and grill architecture improvements
- [interrogate](skills/engineering/interrogate/SKILL.md): Use for "interrogate", "adversarial review", "multi-model review", "challenge this", "stress test this code", "find blind spots", or "tear this apart".
- [maintain-verification-skill](skills/engineering/maintain-verification-skill/SKILL.md): Periodic pass that keeps a project's verification skill and feature map honest: parallel source readers per feature, one live session driving every feature, at most one PR of proven corrections.
- [recall](skills/engineering/recall/SKILL.md): Reconstruct your recent working context from your own chat history, live state, and the shared record (user reports, prior fixes, incidents), then hand back a tight current-state brief.
- [retro](skills/engineering/retro/SKILL.md): Conduct a retrospective on a coding session.
- [setup-matt-pocock-skills](skills/engineering/setup-matt-pocock-skills/SKILL.md): Configure a repo for the skills
- [to-spec](skills/engineering/to-spec/SKILL.md): Turn a conversation into a spec
- [to-tickets](skills/engineering/to-tickets/SKILL.md): Split a plan into tracer-bullet tickets
- [triage](skills/engineering/triage/SKILL.md): Move issues through triage roles
- [wayfinder](skills/engineering/wayfinder/SKILL.md): Map a large effort as decision tickets

**Model-invoked**

- [agent-sources](skills/engineering/agent-sources/SKILL.md): Read a dependency's source at the installed version
- [anti-slop-migration](skills/engineering/anti-slop-migration/SKILL.md): Fix anti-slop lint findings without type laundering
- [autonomous-run](skills/engineering/autonomous-run/SKILL.md): Drive a long task to a checkable exit predicate
- [avoid-feature-creep](skills/engineering/avoid-feature-creep/SKILL.md): Keep scope tight: MVPs, backlogs, one-more-feature
- [babysit](skills/engineering/babysit/SKILL.md): Drive a GitHub PR or stack to merge-ready
- [bun-monorepo](skills/engineering/bun-monorepo/SKILL.md): Bun catalogs, patches and Changesets publishing
- [code-review](skills/engineering/code-review/SKILL.md): Review a diff on standards and spec
- [codebase-design](skills/engineering/codebase-design/SKILL.md): Vocabulary for deep-module design
- [control-cli](skills/engineering/control-cli/SKILL.md): Build or adapt a local harness to drive, inspect, and profile an interactive CLI or TUI without external services.
- [control-ui](skills/engineering/control-ui/SKILL.md): Build or adapt a local browser/CDP harness to drive and inspect a web, IDE, or Electron UI.
- [dependabot-backlog](skills/engineering/dependabot-backlog/SKILL.md): Merge a Dependabot backlog into one verified PR
- [deploy-to-vercel](skills/engineering/deploy-to-vercel/SKILL.md): Deploy applications and websites to Vercel.
- [deslop](skills/engineering/deslop/SKILL.md): Remove AI-generated code slop and clean up code style
- [diagnosing-bugs](skills/engineering/diagnosing-bugs/SKILL.md): Diagnose hard bugs and regressions
- [domain-modeling](skills/engineering/domain-modeling/SKILL.md): Build and sharpen a domain model
- [drizzle-postgres](skills/engineering/drizzle-postgres/SKILL.md): Drizzle bulk params, migration merges, baselines
- [effect-ts](skills/engineering/effect-ts/SKILL.md): Effect v3 (stable) guidance for TypeScript; for an Effect v4 project use effect-v4 instead.
- [effect-v4](skills/engineering/effect-v4/SKILL.md): Effect v4 (beta) development and v3 → v4 migration guidance.
- [git-split-amended-followup](skills/engineering/git-split-amended-followup/SKILL.md): Split an amended fix into its own follow-up commit
- [how](skills/engineering/how/SKILL.md): Use for "how does X work", code walkthroughs before changing something, and placement / ownership / layering questions ("where should this live", "which package owns this", "is this the right layer").
- [likec4-postcss-isolation](skills/engineering/likec4-postcss-isolation/SKILL.md): Stop root PostCSS config breaking likec4 serve
- [logging-best-practices](skills/engineering/logging-best-practices/SKILL.md): Logging best practices focused on wide events (canonical log lines) for powerful debugging and analytics
- [make-pr-easy-to-review](skills/engineering/make-pr-easy-to-review/SKILL.md): Prepare PRs for review by cleaning noisy history, improving PR descriptions, and adding reviewer guidance without changing code behavior.
- [modern-web-guidance](skills/engineering/modern-web-guidance/SKILL.md): Search tool for modern web development best practices.
- [orca](skills/engineering/orca/SKILL.md): Verify UI and hand off tickets inside Orca
- [parallel-branches](skills/engineering/parallel-branches/SKILL.md): Parallel subagents in one worktree to a gh stack
- [pause-resume](skills/engineering/pause-resume/SKILL.md): Pause work safely or pick up a prior session
- [performance](skills/engineering/performance/SKILL.md): Trace, fix and hillclimb against a measured baseline
- [pr](skills/engineering/pr/SKILL.md): Write a PR body that's fast to review
- [pr-size-breakdown](skills/engineering/pr-size-breakdown/SKILL.md): Honest LOC breakdown for a large GitHub PR
- [pragmatic-effect](skills/engineering/pragmatic-effect/SKILL.md): Keep Effect code simple and practical
- [principles](skills/engineering/principles/SKILL.md): Engineering principles, one per decision
- [prototype](skills/engineering/prototype/SKILL.md): Prototype to answer a design question
- [query-timeout-diagnosis](skills/engineering/query-timeout-diagnosis/SKILL.md): Query timeouts while the database is healthy
- [rds-snapshot-dump](skills/engineering/rds-snapshot-dump/SKILL.md): Portable pg_dump from an RDS Postgres snapshot
- [research](skills/engineering/research/SKILL.md): Research from high-trust sources
- [setup-effect-toolchain](skills/engineering/setup-effect-toolchain/SKILL.md): Set up tsgo, Oxlint and oxfmt for Effect repos
- [show-me-your-work](skills/engineering/show-me-your-work/SKILL.md): Keep a reviewable decision trail for long-running or unattended work: a TSV log with one row per decision (what, why, evidence, result).
- [spec-port-diverged-branch](skills/engineering/spec-port-diverged-branch/SKILL.md): Port a commit across diverged branches as a spec
- [stacked-prs](skills/engineering/stacked-prs/SKILL.md): Create, verify and unblock GitHub stacked PRs
- [tanstack-start-middleware](skills/engineering/tanstack-start-middleware/SKILL.md): Server-only imports in TanStack Start middleware
- [tdd](skills/engineering/tdd/SKILL.md): Test-driven red-green-refactor
- [to-plan](skills/engineering/to-plan/SKILL.md): Executor-ready plans as flows, not pasted code
- [transcripts](skills/engineering/transcripts/SKILL.md): Find session transcripts per harness
- [typescript-best-practices](skills/engineering/typescript-best-practices/SKILL.md): TypeScript best practices.
- [typescript-library](skills/engineering/typescript-library/SKILL.md): Library APIs that infer end to end and reject misuse
- [vercel-cli-with-tokens](skills/engineering/vercel-cli-with-tokens/SKILL.md): Deploy and manage projects on Vercel using token-based authentication.
- [vercel-composition-patterns](skills/engineering/vercel-composition-patterns/SKILL.md): React composition patterns that scale.
- [vercel-optimize](skills/engineering/vercel-optimize/SKILL.md): Use for Vercel cost and performance optimization on deployed projects, especially Next.js, SvelteKit, Nuxt, and limited Astro apps.
- [vercel-react-best-practices](skills/engineering/vercel-react-best-practices/SKILL.md): React and Next.js performance optimization guidelines from Vercel Engineering.
- [vercel-react-native-skills](skills/engineering/vercel-react-native-skills/SKILL.md): React Native and Expo best practices for building performant mobile apps.
- [vercel-react-view-transitions](skills/engineering/vercel-react-view-transitions/SKILL.md): Guide for implementing smooth, native-feeling animations using React's View Transition API (`<ViewTransition>` component, `addTransitionType`, and CSS view transition pseudo-elements).
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
- [diagram-rules](skills/productivity/diagram-rules/SKILL.md): Judgement for any diagram, before the tool
- [grilling](skills/productivity/grilling/SKILL.md): Stress-test thinking a round of questions at a time
- [humanizer](skills/productivity/humanizer/SKILL.md): Make AI-written text sound like the writer
- [macos-uninstall](skills/productivity/macos-uninstall/SKILL.md): Remove a macOS app and all its leftovers
- [scratchpad](skills/productivity/scratchpad/SKILL.md): Where files go; temp files you can read and edit
- [show-me](skills/productivity/show-me/SKILL.md): Help the user understand the current topic visually with concise diagrams, code-shape sketches, and focused HTML artifacts.
- [simplified-technical-english](skills/productivity/simplified-technical-english/SKILL.md): Writes and rewrites text in Simplified Technical English (ASD-STE100), a controlled language for clear technical documentation.
- [technical-pdf](skills/productivity/technical-pdf/SKILL.md): Typst technical PDFs with verified layout
- [trademark-search](skills/productivity/trademark-search/SKILL.md): Search trademark registers through TMview
- [unslop](skills/productivity/unslop/SKILL.md): Cut AI tells from any writing.
- [vscode-theme-to-zed](skills/productivity/vscode-theme-to-zed/SKILL.md): Port a VS Code color theme to Zed
- [writing-for-agents](skills/productivity/writing-for-agents/SKILL.md): Write documents agents consume
- [writing-guidelines](skills/productivity/writing-guidelines/SKILL.md): Review docs/prose for Writing Guidelines compliance.

### Design

**Model-invoked**

- [break-ui](skills/design/break-ui/SKILL.md): Try to break a piece of UI by feeding it worst-case data — long names, unbreakable emails, one-letter names, missing fields, huge counts, zero items, long labels, non-Latin text, emoji, extreme numbers — then render it behind a "Demo data / Worst case" toggle and report everything that broke, with the fix for each.
- [design-references](skills/design/design-references/SKILL.md): Mobbin references as a catalog to pick from
- [logo-surface-board](skills/design/logo-surface-board/SKILL.md): Judge logo marks on favicon, tile and nav
- [measure-ui](skills/design/measure-ui/SKILL.md): Prove UI fidelity and states by measuring
- [mobile-native](skills/design/mobile-native/SKILL.md): Make a web app feel native on a phone — the small CSS and meta-tag fixes that separate "a website in a browser" from something that feels installed.
- [pen-dev](skills/design/pen-dev/SKILL.md): Design, gate and migrate tokens in pen.dev files
- [redesign-inventory](skills/design/redesign-inventory/SKILL.md): Redesign a UI without dropping any control
- [refactoring-ui](skills/design/refactoring-ui/SKILL.md): Refactoring UI rules, scales and review checklist
- [svg-animations](skills/design/svg-animations/SKILL.md): Create beautiful, performant SVG animations and illustrations.
- [web-design-guidelines](skills/design/web-design-guidelines/SKILL.md): Review UI code for Web Interface Guidelines compliance.

### In progress (beta)

**User-invoked**

- [loop-me](skills/in-progress/loop-me/SKILL.md): Spec the workflows you want to build
- [setup-ts-deep-modules](skills/in-progress/setup-ts-deep-modules/SKILL.md): Enforce deep TypeScript modules
- [writing-beats](skills/in-progress/writing-beats/SKILL.md): Assemble raw material into beats
- [writing-fragments](skills/in-progress/writing-fragments/SKILL.md): Mine raw writing fragments
- [writing-shape](skills/in-progress/writing-shape/SKILL.md): Shape raw material into an article

**Model-invoked**

- [youtube-video-to-skill](skills/in-progress/youtube-video-to-skill/SKILL.md): Turn a video tutorial into a skill with frames

### Marketing

**Model-invoked**

- [ab-testing](skills/marketing/ab-testing/SKILL.md): When the user wants to plan, design, or implement an A/B test or experiment, or build a growth experimentation program.
- [ad-creative](skills/marketing/ad-creative/SKILL.md): When the user wants to generate, iterate, or scale ad creative — headlines, descriptions, primary text, or full ad variations — for any paid advertising platform.
- [ads](skills/marketing/ads/SKILL.md): When the user wants help with paid advertising campaigns on Google Ads, Meta (Facebook/Instagram), LinkedIn, Twitter/X, or other ad platforms.
- [ai-seo](skills/marketing/ai-seo/SKILL.md): When the user wants to optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers.
- [analytics](skills/marketing/analytics/SKILL.md): When the user wants to set up, improve, or audit analytics tracking and measurement.
- [aso](skills/marketing/aso/SKILL.md): When the user wants to audit or optimize an App Store or Google Play listing.
- [attribution](skills/marketing/attribution/SKILL.md): When the user wants to figure out which marketing actually drives conversions and revenue, choose or interpret an attribution model, or reconcile conflicting numbers across tools.
- [churn-prevention](skills/marketing/churn-prevention/SKILL.md): When the user wants to reduce churn, build cancellation flows, set up save offers, recover failed payments, or implement retention strategies.
- [co-marketing](skills/marketing/co-marketing/SKILL.md): When the user wants to find co-marketing partners, plan joint campaigns, or brainstorm partnership opportunities.
- [cold-email](skills/marketing/cold-email/SKILL.md): Write B2B cold emails and follow-up sequences that get replies.
- [community-marketing](skills/marketing/community-marketing/SKILL.md): Build and leverage online communities to drive product growth and brand loyalty.
- [competitor-profiling](skills/marketing/competitor-profiling/SKILL.md): When the user wants to research, profile, or analyze competitors from their URLs.
- [competitors](skills/marketing/competitors/SKILL.md): When the user wants to create competitor comparison or alternative pages for SEO and buyer-facing use.
- [content-strategy](skills/marketing/content-strategy/SKILL.md): When the user wants to plan a content strategy, decide what content to create, or figure out what topics to cover.
- [copy-editing](skills/marketing/copy-editing/SKILL.md): When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content.
- [copywriting](skills/marketing/copywriting/SKILL.md): When the user wants to write, rewrite, or improve marketing copy for any page, including homepage, landing pages, pricing pages, feature pages, about pages, or product pages.
- [cro](skills/marketing/cro/SKILL.md): When the user wants to optimize, improve, or increase conversions on any marketing page or form — including homepage, landing pages, pricing pages, feature pages, lead capture forms, or contact forms.
- [customer-research](skills/marketing/customer-research/SKILL.md): When the user wants to conduct, analyze, or synthesize customer research.
- [directory-submissions](skills/marketing/directory-submissions/SKILL.md): When the user wants to submit their product to startup, SaaS, AI, agent, MCP, no-code, or review directories for backlinks, domain rating, and discovery.
- [emails](skills/marketing/emails/SKILL.md): When the user wants to create or optimize an email sequence, drip campaign, automated email flow, or lifecycle email program.
- [events](skills/marketing/events/SKILL.md): When the user wants to plan, run, sponsor, speak at, or get pipeline from events — webinars, conferences, trade shows, meetups, dinners, workshops, virtual summits, or user conferences.
- [free-tools](skills/marketing/free-tools/SKILL.md): When the user wants to plan, evaluate, or build a free tool for marketing purposes — lead generation, SEO value, or brand awareness.
- [image](skills/marketing/image/SKILL.md): When the user wants to create, generate, edit, or optimize images for marketing — blog heroes, social graphics, product mockups, profile banners, listing visuals, or brand assets.
- [influencer-marketing](skills/marketing/influencer-marketing/SKILL.md): When the user wants to run influencer, creator, or ambassador partnerships to promote their product — finding and vetting partners, structuring deals, briefing creators, disclosure compliance, and measuring ROI.
- [launch](skills/marketing/launch/SKILL.md): When the user wants to plan a product launch, feature announcement, or release strategy.
- [lead-magnets](skills/marketing/lead-magnets/SKILL.md): When the user wants to create, plan, or optimize a lead magnet for email capture or lead generation.
- [marketing-council](skills/marketing/marketing-council/SKILL.md): When the user wants multiple expert perspectives on a marketing question — a simulated board of advisors staffed by legendary marketers (Seth Godin, David Ogilvy, Eugene Schwartz, April Dunford, Rory Sutherland, Alex Hormozi, Byron Sharp, and more).
- [marketing-ideas](skills/marketing/marketing-ideas/SKILL.md): When the user needs marketing ideas, inspiration, or strategies for their SaaS or software product.
- [marketing-loops](skills/marketing/marketing-loops/SKILL.md): When the user wants to set up a recurring, self-running marketing workflow — a repeatable loop an AI agent runs on a cadence (weekly, daily, on a trigger) rather than a one-off task.
- [marketing-plan](skills/marketing/marketing-plan/SKILL.md): When the user needs a comprehensive marketing plan for a client, a company they advise, or their own product.
- [marketing-psychology](skills/marketing/marketing-psychology/SKILL.md): When the user wants to apply psychological principles, mental models, or behavioral science to marketing.
- [offers](skills/marketing/offers/SKILL.md): When the user wants to design, construct, or improve an offer — the thing they actually sell — including value framing, bonus stacking, guarantee design, scarcity/urgency, naming, and payment structure.
- [onboarding](skills/marketing/onboarding/SKILL.md): When the user wants to optimize post-signup onboarding, user activation, first-run experience, or time-to-value.
- [paywalls](skills/marketing/paywalls/SKILL.md): When the user wants to create or optimize in-app paywalls, upgrade screens, upsell modals, or feature gates.
- [popups](skills/marketing/popups/SKILL.md): When the user wants to create or optimize popups, modals, overlays, slide-ins, or banners for conversion purposes.
- [pricing](skills/marketing/pricing/SKILL.md): When the user wants help with pricing decisions, packaging, or monetization strategy.
- [product-marketing](skills/marketing/product-marketing/SKILL.md): When the user wants to create or update their product marketing context document.
- [programmatic-seo](skills/marketing/programmatic-seo/SKILL.md): When the user wants to create SEO-driven pages at scale using templates and data.
- [prospecting](skills/marketing/prospecting/SKILL.md): When the user wants to find, qualify, and build a list of prospects to reach out to — across B2B SaaS, general B2B, or local small businesses.
- [public-relations](skills/marketing/public-relations/SKILL.md): When the user wants help with public relations, earned media, press coverage, journalist outreach, or media strategy (not pull requests).
- [referrals](skills/marketing/referrals/SKILL.md): When the user wants to create, optimize, or analyze a referral program, affiliate program, or word-of-mouth strategy.
- [revops](skills/marketing/revops/SKILL.md): When the user wants help with revenue operations, lead lifecycle management, or marketing-to-sales handoff processes.
- [sales-enablement](skills/marketing/sales-enablement/SKILL.md): When the user wants to create sales collateral, pitch decks, one-pagers, objection handling docs, or demo scripts.
- [schema](skills/marketing/schema/SKILL.md): When the user wants to add, fix, or optimize schema markup and structured data on their site.
- [seo-audit](skills/marketing/seo-audit/SKILL.md): When the user wants to audit, review, or diagnose SEO issues on their site.
- [signup](skills/marketing/signup/SKILL.md): When the user wants to optimize signup, registration, account creation, or trial activation flows.
- [site-architecture](skills/marketing/site-architecture/SKILL.md): When the user wants to plan, map, or restructure their website's page hierarchy, navigation, URL structure, or internal linking.
- [sms](skills/marketing/sms/SKILL.md): When the user wants to plan, build, or optimize SMS, MMS, or WhatsApp marketing — including welcome flows, abandoned cart texts, post-purchase, win-back, promotional sends, or transactional/auth SMS.
- [social](skills/marketing/social/SKILL.md): When the user wants help creating, scheduling, or optimizing social media content for LinkedIn, Twitter/X, Instagram, TikTok, or Facebook, or wants to do social listening and engagement triage.
- [video](skills/marketing/video/SKILL.md): When the user wants to create, generate, or produce video content using AI tools or programmatic frameworks.

### Misc (rarely used)

**Model-invoked**

- [git-guardrails-claude-code](skills/misc/git-guardrails-claude-code/SKILL.md): Block dangerous git commands
- [migrate-to-shoehorn](skills/misc/migrate-to-shoehorn/SKILL.md): Replace test assertions with shoehorn
- [scaffold-exercises](skills/misc/scaffold-exercises/SKILL.md): Scaffold lint-ready course exercises
- [setup-pre-commit](skills/misc/setup-pre-commit/SKILL.md): Add pre-commit quality checks

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
