# Skills

Agent skills for engineering, writing and design work, in one repo that installs on omp, Claude Code, Codex, Cursor and pi. It holds:

- Matt Pocock's [skills](https://github.com/mattpocock/skills), vendored unchanged.
- Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) and Cursor's [cursor-team-kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit) skills, rewritten so they run outside Cursor.
- Corey Haines' [marketing skills](https://github.com/coreyhaines31/marketingskills), Vercel's [agent skills](https://github.com/vercel-labs/agent-skills), Effect's [Effect skills](https://github.com/Effect-TS/skills), supermemory's [svg-animations](https://github.com/supermemoryai/skills), 0xpili's [simplified-technical-english](https://github.com/0xpili/simplified-technical-english), Boris Tane's [logging-best-practices](https://github.com/boristane/agent-skills), Emil Kowalski's [design, motion and Swift skills](https://github.com/emilkowalski/skills), Ayoub Ghriss' [i-have-adhd](https://github.com/ayghri/i-have-adhd) and Dan McAteer's [be-ambitious](https://github.com/DannyMac180/skills/tree/main/be-ambitious), vendored unchanged.
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
- [correct](skills/engineering/correct/SKILL.md): Find the mistakes agents keep repeating in this repo and make each one impossible.
- [create-formal-verification-skill](skills/engineering/create-formal-verification-skill/SKILL.md): Generate a project-local skill that formally verifies the code where a bug costs the most and tests reach the least, in any language, with whichever verification tool fits.
- [create-verification-skill](skills/engineering/create-verification-skill/SKILL.md): Generate a project-local verification skill that drives your app the way a user does — any language, framework, or platform.
- [effect-v3-to-v4](skills/engineering/effect-v3-to-v4/SKILL.md): Use this skill when migrating a codebase from Effect v3 to Effect v4, upgrading `effect` or any `@effect/*` package across the v3/v4 boundary.
- [eval](skills/engineering/eval/SKILL.md): Blind test a skill or prompt change across models
- [grill-with-docs](skills/engineering/grill-with-docs/SKILL.md): Grill a design and write its docs
- [implement](skills/engineering/implement/SKILL.md): Build work from a spec or tickets
- [implement-spec](skills/engineering/implement-spec/SKILL.md): Implement the result of /to-spec and /to-tickets in code.
- [improve-codebase-architecture](skills/engineering/improve-codebase-architecture/SKILL.md): Find and grill architecture improvements
- [interrogate](skills/engineering/interrogate/SKILL.md): Use for "interrogate", "adversarial review", "multi-model review", "challenge this", "stress test this code", "find blind spots", or "tear this apart".
- [maintain-formal-verification-skill](skills/engineering/maintain-formal-verification-skill/SKILL.md): Bring a project's formal verification back in line with the code after the code changes: find the commits that touched verified code, update the model, harness, or properties to describe the code as it is now, rerun, and say whether each failure is drift in the verification or a bug in the code.
- [maintain-verification-skill](skills/engineering/maintain-verification-skill/SKILL.md): Periodic pass that keeps a project's verification skill and feature map honest: parallel source readers per feature, one live session driving every feature, at most one PR of proven corrections.
- [no-comments](skills/engineering/no-comments/SKILL.md): Spawn Comment Sicko, fix accepted findings, and offer encodings for claimed constraints.
- [recall](skills/engineering/recall/SKILL.md): Reconstruct your recent working context from your own chat history, live state, and the shared record (user reports, prior fixes, incidents), then hand back a tight current-state brief.
- [reflect](skills/engineering/reflect/SKILL.md): Mine the active transcript for durable learnings and route each to a concrete edit on an existing skill.
- [retro](skills/engineering/retro/SKILL.md): Conduct a retrospective on a coding session.
- [setup-matt-pocock-skills](skills/engineering/setup-matt-pocock-skills/SKILL.md): Configure a repo for the skills
- [sharpen](skills/engineering/sharpen/SKILL.md): Make a task deeper, not bigger, then rewrite the prompt.
- [statechart](skills/engineering/statechart/SKILL.md): Check a TLA+ model of a system that moves between states, such as a product flow, a protocol, or a service, and draw it as a Mermaid statechart.
- [swarm](skills/engineering/swarm/SKILL.md): Fan out N parallel workers, drain them, and return one report.
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
- [benchmark-checklist](skills/engineering/benchmark-checklist/SKILL.md): Vet a perf measurement (limiter, tuning, limits, errors, repeatability, relevance, and whether the work happened) before you report or act on it.
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
- [effect-ts](skills/engineering/effect-ts/SKILL.md): Use this skill when setting up a repository that uses the Effect Typescript library.
- [estimate](skills/engineering/estimate/SKILL.md): Ranged, calibrated estimates for agent runs, tickets and quotes
- [fable-5-2-prompt-audit](skills/engineering/fable-5-2-prompt-audit/SKILL.md): Audit the prompts and instructions in a project for lines written for earlier Claude models that Anthropic says to reconsider on Claude Fable 5.2: standing delegation rules, token budgets written into the prompt, harness code that edits earlier turns, "treat that answer as done" lines, think-less instructions, hard style limits, and cautions that have piled up in notes and memory.
- [file-structure](skills/engineering/file-structure/SKILL.md): Place, name and tidy files so the tree explains the code
- [git-split-amended-followup](skills/engineering/git-split-amended-followup/SKILL.md): Split an amended fix into its own follow-up commit
- [how](skills/engineering/how/SKILL.md): Use for "how does X work", code walkthroughs before changing something, and placement / ownership / layering questions ("where should this live", "which package owns this", "is this the right layer").
- [likec4-postcss-isolation](skills/engineering/likec4-postcss-isolation/SKILL.md): Stop root PostCSS config breaking likec4 serve
- [logging-best-practices](skills/engineering/logging-best-practices/SKILL.md): Logging best practices focused on wide events (canonical log lines) for powerful debugging and analytics
- [make-pr-easy-to-review](skills/engineering/make-pr-easy-to-review/SKILL.md): Prepare PRs for review by cleaning noisy history, improving PR descriptions, and adding reviewer guidance without changing code behavior.
- [modern-web-guidance](skills/engineering/modern-web-guidance/SKILL.md): Search tool for modern web development best practices.
- [omp-session-retro](skills/engineering/omp-session-retro/SKILL.md): Retro over many sessions and harnesses
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
- [write-swift](skills/engineering/write-swift/SKILL.md): How to write modern Swift well — modeling with value types, Swift 6 data-race safety and approachable concurrency (@concurrent, main-actor-by-default, actors, task groups), protocols and generics (some vs any), API design, performance and ARC, Swift Testing, macros, and the modern language features agents don't know about yet.

### Productivity

**User-invoked**

- [grill-me](skills/productivity/grill-me/SKILL.md): Sharpen a plan through interview
- [handoff](skills/productivity/handoff/SKILL.md): Compact a conversation into a handoff
- [i-have-adhd](skills/productivity/i-have-adhd/SKILL.md): Action-first output for ADHD readers
- [ketchup](skills/productivity/ketchup/SKILL.md): Catch the user up on what changed in this chat since their last message, in plain words and small visuals.
- [ketchup-video](skills/productivity/ketchup-video/SKILL.md): Catch the user up like /ketchup, with a short subtitled video of slides for what happened and the waiting calls as text under it.
- [teach](skills/productivity/teach/SKILL.md): Learn a concept in a guided workspace
- [to-questionnaire](skills/productivity/to-questionnaire/SKILL.md): Front-load questions into a doc for someone to answer
- [wait-what](skills/productivity/wait-what/SKILL.md): Re-pitch that: simpler, with the context I'm missing

**Model-invoked**

- [be-ambitious](skills/productivity/be-ambitious/SKILL.md): Turn a task or prompt into a deeper version of itself, not a bigger one.
- [checkbox-picker](skills/productivity/checkbox-picker/SKILL.md): Bulk keep/delete choices in a local picker
- [diagram-rules](skills/productivity/diagram-rules/SKILL.md): Judgement for any diagram, before the tool
- [explain-this](skills/productivity/explain-this/SKILL.md): Explain any digital artifact — a paper, PDF, article, code diff, or codebase — so the person actually understands it, not just skims it.
- [grilling](skills/productivity/grilling/SKILL.md): Stress-test thinking a round of questions at a time
- [humanizer](skills/productivity/humanizer/SKILL.md): Make AI-written text sound like the writer
- [macos-uninstall](skills/productivity/macos-uninstall/SKILL.md): Remove a macOS app and all its leftovers
- [scratchpad](skills/productivity/scratchpad/SKILL.md): Where files go; temp files you can read and edit
- [show-me](skills/productivity/show-me/SKILL.md): Help the user understand the current topic visually with concise diagrams, code-shape sketches, and focused HTML artifacts.
- [simplified-technical-english](skills/productivity/simplified-technical-english/SKILL.md): Writes and rewrites text in Simplified Technical English (ASD-STE100), a controlled language for clear technical documentation.
- [technical-html](skills/productivity/technical-html/SKILL.md): Markdown docs built into styled HTML pages
- [technical-pdf](skills/productivity/technical-pdf/SKILL.md): Typst technical PDFs with verified layout
- [technical-writing](skills/productivity/technical-writing/SKILL.md): Layered technical-writing standard: Diátaxis structure, Google developer style sentences, STE instruction rules, Global English syntax.
- [trademark-search](skills/productivity/trademark-search/SKILL.md): Search trademark registers through TMview
- [unslop](skills/productivity/unslop/SKILL.md): Cut AI tells from any writing.
- [vscode-theme-to-zed](skills/productivity/vscode-theme-to-zed/SKILL.md): Port a VS Code color theme to Zed
- [writing-for-agents](skills/productivity/writing-for-agents/SKILL.md): Write documents agents consume
- [writing-guidelines](skills/productivity/writing-guidelines/SKILL.md): Review docs/prose for Writing Guidelines compliance.

### Design

**User-invoked**

- [ask-emil](skills/design/ask-emil/SKILL.md): Ask which skill or flow fits your situation.
- [learn-taste](skills/design/learn-taste/SKILL.md): Turn a session's design corrections into rules, with their why, in DESIGN.md, a project skill, or a lint check.
- [pick-ui-library](skills/design/pick-ui-library/SKILL.md): Pick the library for a frontend task from a curated list — primitives, toasts, drawers, command menus, OTP, numbers, charts, virtualization, drag and drop, state, styling.
- [review-animations](skills/design/review-animations/SKILL.md): Reviews animation and motion code against a high craft bar derived from Emil Kowalski's design engineering philosophy.

**Model-invoked**

- [animate](skills/design/animate/SKILL.md): Build an animation from scratch, making the decisions in the order that determines whether it feels right — should it animate at all, what purpose, which tool, which properties, which curve and duration, how it interrupts, how it exits.
- [animate-expo](skills/design/animate-expo/SKILL.md): Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread it runs on, which properties, spring or timing, how the gesture hands off, how it degrades.
- [animation-performance](skills/design/animation-performance/SKILL.md): Keep web animations inside the frame budget — animate composite-only properties, keep motion off the main thread when the page is busy, and find the cause when an animation drops frames.
- [animation-vocabulary](skills/design/animation-vocabulary/SKILL.md): Reverse-lookup glossary that turns a vague description of a web animation or motion effect into its exact term ("the bouncy thing when a popover opens" → Pop in; "the iOS rubber-band scroll" → Rubber-banding).
- [app-ux](skills/design/app-ux/SKILL.md): App screen rules for click cost, states and generated-UI tells
- [apple-design](skills/design/apple-design/SKILL.md): Apple's approach to interface design and fluid, physical motion, translated for the web.
- [ask-sonner](skills/design/ask-sonner/SKILL.md): Guide to Sonner, the React toast library — install and wire up the Toaster, pick the right toast() call, promise and loading toasts, updating, dismissing and persisting toasts, styling, theming and icons, positioning and multiple toasters.
- [break-ui](skills/design/break-ui/SKILL.md): Try to break a piece of UI by feeding it worst-case data — long names, unbreakable emails, one-letter names, missing fields, huge counts, zero items, long labels, non-Latin text, emoji, extreme numbers — then render it behind a "Demo data / Worst case" toggle and report everything that broke, with the fix for each.
- [choreograph](skills/design/choreograph/SKILL.md): Coordinate several elements that animate together — decide what moves, in what order, how much they overlap, and what stays still — so a group reads as one intentional motion instead of a pile of separate animations.
- [design-references](skills/design/design-references/SKILL.md): Mobbin references as a catalog to pick from
- [emil-design-eng](skills/design/emil-design-eng/SKILL.md): Emil Kowalski's design-engineering philosophy for UI polish, component design, animation decisions, and the invisible details that make software feel great.
- [find-animation-opportunities](skills/design/find-animation-opportunities/SKILL.md): Search a codebase or UI for places that don't animate but should, and reject everything that shouldn't.
- [gestures](skills/design/gestures/SKILL.md): Build drag, swipe, and sheet interactions that track the finger 1:1 and stay interruptible.
- [improve-animations](skills/design/improve-animations/SKILL.md): Survey a codebase's animation and motion code as a senior motion advisor, then produce a prioritized audit and self-contained implementation plans for other agents (or cheaper models) to execute.
- [logo-surface-board](skills/design/logo-surface-board/SKILL.md): Judge logo marks on favicon, tile and nav
- [measure-ui](skills/design/measure-ui/SKILL.md): Prove UI fidelity and states by measuring
- [mobile-native](skills/design/mobile-native/SKILL.md): Make a web app feel native on a phone — the small CSS and meta-tag fixes that separate "a website in a browser" from something that feels installed.
- [pen-dev](skills/design/pen-dev/SKILL.md): Design, gate and migrate tokens in pen.dev files
- [plotter](skills/design/plotter/SKILL.md): Draw and animate flat construction illustrations
- [redesign-inventory](skills/design/redesign-inventory/SKILL.md): Redesign a UI without dropping any control
- [refactoring-ui](skills/design/refactoring-ui/SKILL.md): Refactoring UI rules, scales and review checklist
- [remove-animations](skills/design/remove-animations/SKILL.md): Find the animations an interface doesn't need and remove them — motion on keyboard actions, high-frequency surfaces, functional data, and decoration with no purpose — then clean up what they leave behind.
- [svg-animations](skills/design/svg-animations/SKILL.md): Create beautiful, performant SVG animations and illustrations.
- [web-design-guidelines](skills/design/web-design-guidelines/SKILL.md): Review UI code for Web Interface Guidelines compliance.

### In progress (beta)

**User-invoked**

- [loop-me](skills/in-progress/loop-me/SKILL.md): Spec the workflows you want to build
- [setup-ts-deep-modules](skills/in-progress/setup-ts-deep-modules/SKILL.md): Enforce deep TypeScript modules
- [software-factory](skills/in-progress/software-factory/SKILL.md): Shared language for designing a software factory: the tasks it runs and the services it plugs into.
- [writing-beats](skills/in-progress/writing-beats/SKILL.md): Assemble raw material into beats
- [writing-fragments](skills/in-progress/writing-fragments/SKILL.md): Mine raw writing fragments
- [writing-shape](skills/in-progress/writing-shape/SKILL.md): Shape raw material into an article

**Model-invoked**

- [youtube-video-to-skill](skills/in-progress/youtube-video-to-skill/SKILL.md): Turn a video tutorial into a skill with frames

### Marketing

**Model-invoked**

- [ab-testing](skills/marketing/ab-testing/SKILL.md): When the user wants to plan, run, or read A/B tests, or asks a judgement call on one: is the result real, can we stop, which version won, is this worth testing at all: sample size, duration, significance, hypotheses, and experiment backlogs.
- [ad-creative](skills/marketing/ad-creative/SKILL.md): When the user wants to write or judge ad creative, or asks which ad, hook, or angle to run or kill: headlines, primary text, and variations for Google, Meta, LinkedIn, and TikTok, fresh angles when creative fatigues.
- [ads](skills/marketing/ads/SKILL.md): When the user wants to plan, run, or fix paid ads on Google, Meta, and LinkedIn, or asks a judgement call on them: are ads worth it, which channel or budget split, why CPA rose, kill or keep a campaign.
- [ai-seo](skills/marketing/ai-seo/SKILL.md): When the user wants to get cited and recommended in AI answers (ChatGPT, Perplexity, AI Overviews), or asks why AI cites a competitor, which content gets cited, or whether llms.txt or a page format is worth it: AEO, GEO, AI visibility, agent-readable sites.
- [analytics](skills/marketing/analytics/SKILL.md): When the user wants to set up or audit analytics, or asks whether a metric or number is calculated right, what to track, or how to name events: tracking plans, GA4, GTM, Mixpanel, PostHog, UTMs.
- [aso](skills/marketing/aso/SKILL.md): When the user wants to audit or optimize an App Store or Google Play listing, or asks which title, keywords, or screenshots to pick or why downloads are low: subtitle, description, ratings, and comparing listings with competitors.
- [attribution](skills/marketing/attribution/SKILL.md): When the user wants to work out which marketing drives revenue, or asks whether a channel is really working, which numbers to trust, or how to credit podcasts and dark social: attribution models, platforms that over-claim, MMM, incrementality and holdout tests, self-reported attribution.
- [churn-prevention](skills/marketing/churn-prevention/SKILL.md): When the user wants to reduce churn, or asks why customers cancel, whether to offer a discount or pause: cancellation flows, exit surveys, save offers, dunning and failed-payment recovery.
- [co-marketing](skills/marketing/co-marketing/SKILL.md): When the user wants co-marketing partners or joint campaigns, or asks whether a partner fits, a size mismatch matters, or how to split work and leads: integration partners, cross-promotion, co-branded content, joint webinars.
- [cold-email](skills/marketing/cold-email/SKILL.md): When the user wants to write or run B2B cold outbound, or asks whether an opener, reason to reach out, or email works or why nobody replies: cold emails, follow-ups, sending domains, deliverability, LinkedIn, cadences.
- [community-marketing](skills/marketing/community-marketing/SKILL.md): When the user wants to build or grow an online community, or asks whether a community is worth it, where to host it, or why members stay quiet: Discord, Slack, forums, participation, community-led growth, advocates.
- [competitor-profiling](skills/marketing/competitor-profiling/SKILL.md): When the user wants to research competitors into dated profiles, or asks what a rival charges, claims, or is doing, or whether a conclusion about them is fair: positioning, pricing, features, reviews, SEO, observed facts kept apart from inference.
- [competitors](skills/marketing/competitors/SKILL.md): When the user wants to create or audit comparison and alternative pages ('X vs Y', 'X alternative', 'best X alternatives'), or asks what a public page may say about a competitor: page formats, fair claims, and outdated pages.
- [content-strategy](skills/marketing/content-strategy/SKILL.md): When the user wants to plan content, or asks which topic or piece to prioritize, what to write about, or why posts bring no customers: topic clusters, editorial calendars, roadmaps tied to customers and search.
- [copy-editing](skills/marketing/copy-editing/SKILL.md): When the user wants to edit, tighten, proofread, or refresh existing copy, or asks whether to keep, cut, or change a line in it, without rewriting from scratch.
- [copywriting](skills/marketing/copywriting/SKILL.md): When the user wants to write or rewrite page copy (homepage, landing, pricing, feature), or asks which headline, promise, or message to lead with.
- [cro](skills/marketing/cro/SKILL.md): When the user wants more conversions from a page or form, or asks why a page isn't converting, what to change first, or whether to add or remove a field or element: landing and pricing pages, lead forms, or a URL shared for feedback.
- [customer-research](skills/marketing/customer-research/SKILL.md): When the user wants to run or synthesize customer research, or asks what customer quotes, reviews, or feedback really mean, what is safe to conclude, and what to ask next: interviews, surveys, voice of customer, personas, JTBD, mining Reddit and reviews.
- [directory-submissions](skills/marketing/directory-submissions/SKILL.md): When the user wants to list a product in startup, SaaS, AI, MCP, and review directories, or asks which directories are worth it or whether listings are working: Product Hunt, G2, Capterra, AlternativeTo, MCP registries, awesome lists, and a submission tracker.
- [emails](skills/marketing/emails/SKILL.md): When the user wants to create or improve automated email sequences, or asks what to send, when, or whether an email or flow is working: welcome, onboarding, nurture, and win-back flows.
- [events](skills/marketing/events/SKILL.md): When the user wants to plan, run, sponsor, or speak at events, or asks whether an event or booth is worth the money: webinars, conferences, booths, meetups, show-up rates, and follow-up into pipeline.
- [free-tools](skills/marketing/free-tools/SKILL.md): When the user wants to plan or build a free tool as marketing, or asks whether a tool idea is worth building or which one to pick: calculators, graders, generators, and other interactive tools for leads, SEO, and links.
- [image](skills/marketing/image/SKILL.md): When the user wants to create, generate, edit, or optimize marketing images, or asks which approach to take (generate, design, or photograph): blog heroes, social graphics, product mockups, banners, OG images.
- [influencer-marketing](skills/marketing/influencer-marketing/SKILL.md): When the user wants creator, influencer, or ambassador partnerships, or asks which creators fit, what to pay, which rights to buy, or whether a sponsorship worked: vetting, contracts, briefs, UGC, newsletter and podcast sponsorships, FTC disclosure.
- [launch](skills/marketing/launch/SKILL.md): When the user wants to plan a product or feature launch, or asks whether it's ready, when to announce, or how to get noticed: Product Hunt, beta and early access, waitlists, release go-to-market, launch checklists, release notes.
- [lead-magnets](skills/marketing/lead-magnets/SKILL.md): When the user wants to plan or improve a lead magnet, or asks what to give away for emails or how much to ask in return (gating, form fields): checklists, templates, ebooks, gated guides, content upgrades.
- [marketing-council](skills/marketing/marketing-council/SKILL.md): When the user wants several expert takes on a marketing decision, or asks what a famous marketer would say about it: a simulated board (Seth Godin, David Ogilvy, April Dunford, Byron Sharp, and more), each grounded in their documented frameworks, where they disagree, and a recommendation.
- [marketing-ideas](skills/marketing/marketing-ideas/SKILL.md): When the user wants marketing ideas or growth tactics for a software product, or asks what to try to get attention or the next customers with little time or budget, or after the obvious channels.
- [marketing-loops](skills/marketing/marketing-loops/SKILL.md): When the user wants a recurring marketing job an AI agent runs on a cadence or trigger, or asks what a weekly or daily automated check should do, remember, and when it should stop: SEO and ads checks, churn watches, outbound triage.
- [marketing-plan](skills/marketing/marketing-plan/SKILL.md): When the user wants a full marketing or go-to-market plan for a client, an advised company, or their own product, or asks how to sequence or prioritize several initiatives with a fixed team and budget: channels, budget, team, goals across AARRR, market sizing.
- [marketing-psychology](skills/marketing/marketing-psychology/SKILL.md): When the user wants to apply psychology to marketing, or asks why buyers behave or value things as they do, or whether a persuasion tactic is honest: biases, mental models, anchoring, social proof, scarcity, loss aversion, framing.
- [offers](skills/marketing/offers/SKILL.md): When the user wants to design or improve the offer itself, or asks why it isn't selling or how to add urgency honestly: value stacking, bonuses, guarantees, scarcity, payment plans, upsells.
- [onboarding](skills/marketing/onboarding/SKILL.md): When the user wants better onboarding and activation, or asks why new users don't stick or what the first session should do: first-run experience, aha moments, checklists, empty states, time to value.
- [paywalls](skills/marketing/paywalls/SKILL.md): When the user wants to create or improve in-app paywalls and upgrade moments, or asks when or how hard to ask free users to pay (after they've seen value): upgrade screens, upsell modals, feature gates, limit-reached and trial-expired screens, mobile subscription paywalls.
- [popups](skills/marketing/popups/SKILL.md): When the user wants to create or improve popups, modals, slide-ins, sticky bars, and banners, or asks whether one will help or annoy and when to show it: exit intent, email capture, scroll and time triggers, announcements.
- [pricing](skills/marketing/pricing/SKILL.md): When the user wants to set pricing and packaging, or asks what to charge, whether to raise prices, or how to move existing customers: tiers, value metrics, per-seat vs usage, freemium and trials, willingness to pay, pricing pages.
- [product-marketing](skills/marketing/product-marketing/SKILL.md): When the user wants to create or update the product marketing context doc (.agents/product-marketing.md), or asks what belongs in it or whether positioning or ICP is clear enough: product, ICP, positioning, competitors, customer language, brand voice.
- [programmatic-seo](skills/marketing/programmatic-seo/SKILL.md): When the user wants SEO pages at scale from templates and data, or asks whether a page set will rank or look thin: location, integration, comparison, directory, and '[X] for [Y]' pages, each useful rather than thin.
- [prospecting](skills/marketing/prospecting/SKILL.md): When the user wants to find and qualify prospects for outbound, or asks who to target first, which signal to prioritize, or where to spot buyers with the problem: buying signals, enrichment, verification, account research.
- [public-relations](skills/marketing/public-relations/SKILL.md): When the user wants press and media coverage, or asks what to say to a reporter, whether a story is newsworthy, or how to handle a crisis: pitches, press releases, media lists, HARO, op-eds, podcast guest prep, newsjacking (public relations, not pull requests).
- [referrals](skills/marketing/referrals/SKILL.md): When the user wants referral and affiliate programs or word of mouth, or asks what to reward, how much to pay, or which loop to start with: refer-a-friend incentives, commissions and payouts, partner programs, 'made with' badges, review campaigns.
- [reverse-engineer-marketing](skills/marketing/reverse-engineer-marketing/SKILL.md): When the user wants to know how another company grew and what to copy, or asks what a competitor did and when: a dated log of their moves against their traffic from public data, archives, job posts, reviews, and their funnel, compared with the user's data, ending in plays routed to other skills.
- [revops](skills/marketing/revops/SKILL.md): When the user wants to design revenue operations, or asks when a lead is ready for sales or why sales and marketing disagree on lead quality: lifecycle stages, MQL and SQL, scoring, routing, handoff, pipeline stages, CRM automation.
- [sales-enablement](skills/marketing/sales-enablement/SKILL.md): When the user wants sales collateral, or asks what to give a champion or rep, or how to answer an objection or make the case: decks, one-pagers, objection handling, demo scripts, talk tracks, battle cards, proposals, win-loss.
- [schema](skills/marketing/schema/SKILL.md): When the user wants to add, fix, or validate schema markup (JSON-LD), or asks which type fits a page or whether some markup is allowed: product, review, recipe, FAQ, rich result eligibility (FAQ no longer earns Google rich results), Search Console errors.
- [seo-audit](skills/marketing/seo-audit/SKILL.md): When the user wants to audit or diagnose SEO, or asks why traffic dropped, a page won't rank, or whether a setup like canonicals, hreflang, or redirects is right: technical SEO, indexing, Google updates, on-page and titles, Core Web Vitals, local SEO.
- [signup](skills/marketing/signup/SKILL.md): When the user wants better signup, registration, and trial start flows, or asks which fields or steps to cut or whether to require a card: SSO and drop-off before an account exists.
- [site-architecture](skills/marketing/site-architecture/SKILL.md): When the user wants to plan or restructure a website, or asks which pages they need or where something belongs: hierarchy, navigation, URL structure, internal linking, website builders and migrations.
- [sms](skills/marketing/sms/SKILL.md): When the user wants SMS, MMS, or WhatsApp marketing, or asks whether texting is worth it or a message is allowed: abandoned cart, win-back, and promo texts, WhatsApp templates and windows, TCPA and A2P 10DLC compliance, SMS vs email.
- [social](skills/marketing/social/SKILL.md): When the user wants organic social content for LinkedIn, X, Instagram, TikTok, or Facebook, or asks what to post, which format to favor, or from which account: posts, threads, carousels, short-form video scripts, calendars, build-in-public posts from commits, listening.
- [video](skills/marketing/video/SKILL.md): When the user wants to create video with AI tools or code, or asks which approach to use (screen recording, AI avatar, generated, or templated) or how to make videos repeatably: product demos, AI generation (Veo, Sora, HeyGen), programmatic video with Remotion.

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
| `bun run skills sync --report` | Writes `upstream/DRIFT.md`: upstream commits since each pin, and upstream skills and subagents nothing tracks. |
| `bun run skills sync --update` | Moves vendored skills to upstream HEAD and writes the report. |
| `bun run skills patch <name>` | Saves hand edits to a vendored skill or agent as its patch. |
| `bun run skills check` | Checks frontmatter, invocation, skill calls, banned terms, the router and this README. |
| `bun run skills readme` | Regenerates the skill list above. |

Subagent definitions vendored from upstream live in `agents/<name>.md`. An entry with `"mode": "agent"` in `upstream/sources.json` names the upstream Markdown file, and sync builds it like a vendored skill: the agent-neutral rules, then `upstream/patches/<name>.patch`. The drift report lists every upstream skill and subagent that no entry tracks; to leave one out on purpose, add it to `upstream/ignored.json` with a reason.

[CONVENTIONS.md](CONVENTIONS.md) says how a skill here is written. Upstream sources and licenses are in [NOTICE.md](NOTICE.md).
