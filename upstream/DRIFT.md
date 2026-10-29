# Upstream drift

Written by `bun run skills sync --report` and `--update`. `--update` moves vendored skills and references to upstream HEAD; forks keep their base commit until the `upstream-review` skill ports the change.

## Forks: needs review

### babysit (fork, engineering/babysit)

`https://github.com/cursor/plugins` `pstack/skills/poteto-mode/playbooks/babysit.md, pstack/skills/poteto-mode/playbooks/shipping.md, pstack/skills/poteto-mode/references/bugbot-triage.md, pstack/skills/poteto-mode/scripts/watch-pr, pstack/skills/poteto-mode/scripts/bootstrap.ts, pstack/skills/poteto-mode/scripts/package.json, pstack/skills/poteto-mode/scripts/bun.lock`, 019a6a2..1ba91fc

- c742dd6 feat(pstack): make Orchestrate agentic and delete the orch scripts (#1043)
- ab1f702 feat(pstack): port recent skill updates (#986)
- fe096ef fix(watch-pr): cap polling sleeps at the deadline (#802)
- 96dec8e fix(watch-pr): distinguish fork heads during stack discovery (#801)

```text
 pstack/skills/poteto-mode/playbooks/babysit.md     |  2 +-
 pstack/skills/poteto-mode/scripts/package.json     |  2 +-
 .../poteto-mode/scripts/watch-pr/github.test.ts    | 62 ++++++++++++++++++++++
 .../skills/poteto-mode/scripts/watch-pr/github.ts  | 12 ++++-
 .../poteto-mode/scripts/watch-pr/policy.test.ts    | 62 ++++++++++++++++++++++
 .../skills/poteto-mode/scripts/watch-pr/policy.ts  | 10 +++-
 .../skills/poteto-mode/scripts/watch-pr/types.ts   |  1 +
 7 files changed, 145 insertions(+), 6 deletions(-)
```

### autonomous-run (fork, engineering/autonomous-run)

`https://github.com/cursor/plugins` `pstack/skills/poteto-mode/playbooks/autonomous-run.md`, 019a6a2..1ba91fc

- ab1f702 feat(pstack): port recent skill updates (#986)

```text
 pstack/skills/poteto-mode/playbooks/autonomous-run.md | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

## Patch conflicts: needs a hand fix

These skills keep their old pin: their patch no longer applies to upstream HEAD. Move the pin by hand, run `bun run skills sync`, redo the edit in the skill folder, then run `bun run skills patch <name>`.

### reflect (vendor, engineering/reflect)

`https://github.com/cursor/plugins` `pstack/skills/reflect`, 190d287..1ba91fc

- 7054003 fix(pstack): route reflect edits out of the plugin cache (#800)

```text
git apply /Users/mac/WebstormProjects/skills/upstream/patches/reflect.patch: error: patch failed: SKILL.md:12
error: SKILL.md: patch does not apply
```

```text
 pstack/skills/reflect/SKILL.md | 2 ++
 1 file changed, 2 insertions(+)
```

### swarm (vendor, engineering/swarm)

`https://github.com/cursor/plugins` `pstack/skills/swarm`, 190d287..1ba91fc

- e73df47 fix(pstack): renumber swarm's Phase A and fix its dangling table reference (#807)

```text
git apply /Users/mac/WebstormProjects/skills/upstream/patches/swarm.patch: error: patch failed: SKILL.md:19
error: SKILL.md: patch does not apply
```

```text
 pstack/skills/swarm/SKILL.md | 8 ++++----
 1 file changed, 4 insertions(+), 4 deletions(-)
```

## Vendored

### arena (vendor, engineering/arena)

`https://github.com/cursor/plugins` `pstack/skills/arena`, 019a6a2..1ba91fc

- ab1f702 feat(pstack): port recent skill updates (#986)

```text
 pstack/skills/arena/SKILL.md | 8 ++++----
 1 file changed, 4 insertions(+), 4 deletions(-)
```

### interrogate (vendor, engineering/interrogate)

`https://github.com/cursor/plugins` `pstack/skills/interrogate`, 019a6a2..1ba91fc

- ab1f702 feat(pstack): port recent skill updates (#986)

```text
 pstack/skills/interrogate/SKILL.md                 | 71 ++++----------------
 .../interrogate/references/code-quality-review.md  | 47 -------------
 .../skills/interrogate/references/lead-judgment.md | 39 -----------
 .../interrogate/references/reviewer-prompt.md      | 62 -----------------
 pstack/skills/interrogate/references/rubric.md     | 77 ----------------------
 5 files changed, 14 insertions(+), 282 deletions(-)
```

### create-formal-verification-skill (vendor, engineering/create-formal-verification-skill)

`https://github.com/cursor/plugins` `pstack/skills/create-formal-verification-skill`, 190d287..1ba91fc

- 34b1b7c feat(pstack): port the statechart compiler (#977)
- 00d5dec feat(pstack): tell generated verify skills to read each model-check result with /statechart (#794)

```text
 pstack/skills/create-formal-verification-skill/SKILL.md | 2 ++
 1 file changed, 2 insertions(+)
```

### vercel-react-view-transitions (vendor, engineering/vercel-react-view-transitions)

`https://github.com/vercel-labs/agent-skills` `skills/react-view-transitions`, 063bee9..1a2c79d

- 6ec2693 fix: recommend stable React 19.3 for view transitions

```text
 skills/react-view-transitions/AGENTS.md | 2 +-
 skills/react-view-transitions/SKILL.md  | 2 +-
 2 files changed, 2 insertions(+), 2 deletions(-)
```

### deploy-to-vercel (vendor, engineering/deploy-to-vercel)

`https://github.com/vercel-labs/agent-skills` `skills/deploy-to-vercel`, 063bee9..1a2c79d

- dfeeb54 fix(deploy-to-vercel): clarify sandbox login check
- 4f8ed60 fix(deploy-to-vercel): run project checks before the no-auth fallback in sandboxes
- add393b fix(deploy-to-vercel): use vercel deploy --temporary for no-auth deploys

```text
 skills/deploy-to-vercel/Archive.zip               | Bin 11314 -> 0 bytes
 skills/deploy-to-vercel/SKILL.md                  |  94 +------
 skills/deploy-to-vercel/resources/deploy-codex.sh | 301 ----------------------
 skills/deploy-to-vercel/resources/deploy.sh       | 301 ----------------------
 4 files changed, 14 insertions(+), 682 deletions(-)
```

### modern-web-guidance (vendor, engineering/modern-web-guidance)

`https://github.com/GoogleChrome/modern-web-guidance` `skills/modern-web-guidance`, b31dc0a..4f2b13e

- 4f2b13e Release v0.0.196
- 65e7edd Release v0.0.195

```text
 skills/modern-web-guidance/SKILL.md                |  43 ++-
 .../guides/accessibility/accessibility.md          | 332 +++++++++++------
 .../guides/css/atrule-support-conditionals.md      |   2 +-
 .../modern-web-guidance/guides/css/css-layout.md   |   8 +-
 .../guides/forms/animated-select-picker.md         |   2 +-
 .../guides/forms/autofill-address-form.md          |  13 +-
 .../guides/forms/autofill-payment-form.md          |  10 +
 .../guides/forms/autofill-sign-in-form.md          |   8 +-
 .../guides/forms/autofill-sign-up-form.md          |   6 +-
 .../guides/forms/branded-select-styling.md         |   2 +-
 .../guides/forms/custom-select-picker-layouts.md   |   2 +-
 .../guides/forms/ime-safe-enter-submit.md          |   8 +-
 .../guides/forms/rich-media-picker.md              |   2 +-
 .../guides/forms/sms-otp-form.md                   |   2 +-
 .../guides/js/calculate-event-differentials.md     | 134 ++++---
 .../guides/js/capture-location-agnostic-data.md    | 144 ++++++--
 .../guides/js/coordinate-global-events.md          |  21 +-
 .../guides/js/format-human-readable-durations.md   |  87 -----
 .../guides/js/manage-recurring-intervals.md        |  73 ----
 .../guides/js/model-partial-time-concepts.md       |  96 -----
 .../guides/js/sort-high-precision-timestamps.md    |  92 +++++
 .../guides/js/stabilize-reactive-state.md          |  72 ----
 .../guides/js/support-global-calendar-systems.md   |  36 +-
 .../guides/performance/batch-analytics-events.md   |   2 +-
 .../performance/conditional-async-dependencies.md  |  40 +-
 .../guides/performance/full-session-analytics.md   |   2 +-
 .../guides/performance/identify-inp-causes.md      |  62 +++-
 .../performance/sequence-distributed-events.md     |  76 ----
 .../guides/security/passkeys.md                    |   1 +
 .../guides/security/quick-sign-ins.md              | 242 ++++++++++++
 .../security/secure-external-subresources.md       | 202 ++++++++++
 .../guides/security/security.md                    |  15 +-
 .../guides/security/trusted-types.md               |  19 +-
 .../guides/security/validate-origins.md            |   8 +-
 .../modern-web-guidance/guides/ui-atoms/icons.md   | 290 +++++++++++++++
 .../guides/ui-atoms/position-aware-tooltips.md     |   4 +-
 .../guides/ui-atoms/responsive-table.md            |  19 +-
 ...ed-dropdowns.md => viewport-aware-dropdowns.md} |   8 +-
 .../guides/ui-behaviors/2d-panning.md              | 151 ++++++++
 .../anchor-positioning-tab-underline.md            |   2 +-
 .../guides/ui-behaviors/custom-button-actions.md   |   7 +
 .../ui-behaviors/interest-triggered-tooltips.md    |  31 +-
 .../guides/ui-behaviors/motion.md                  |  47 ++-
 .../ui-behaviors/scoped-component-transitions.md   | 229 ++++++++++++
 .../guides/ui-components/card.md                   | 132 +++++++
 .../guides/ui-components/checkbox.md               |   9 +-
 .../guides/ui-components/dialog.md                 | 226 ++++++++++++
 .../guides/ui-components/hovercard.md              |   2 +-
 .../guides/ui-components/menu.md                   | 410 +++++++++++++++++++++
 .../guides/ui-components/persistent-app-tours.md   |   2 +-
 .../guides/ui-components/progress.md               | 181 +++++++++
 .../guides/ui-components/spinner.md                |  34 +-
 .../guides/visual-design/apply-webgl-shaders.md    | 235 +++++++-----
 .../guides/visual-design/browser-ui-theming.md     |   2 +-
 .../visual-design/custom-text-decorations.md       | 337 +++++++++++++++++
 .../guides/visual-design/dark-mode.md              |   7 +-
 .../visual-design/export-html-media-from-canvas.md | 263 ++++++++-----
 .../expose-canvas-content-to-browser-features.md   | 380 ++++++++++---------
 .../interactive-content-in-3d-scenes.md            | 407 +++++++++++---------
 .../guides/webmcp/agentic-forms.md                 |   6 +-
 .../guides/webmcp/agentic-javascript-tools.md      |  65 ++++
 skills/modern-web-guidance/guides/webmcp/webmcp.md |   2 +
 62 files changed, 4020 insertions(+), 1332 deletions(-)
```

### humanizer (vendor, productivity/humanizer)

`https://github.com/blader/humanizer` `.`, 8c307f3..0ef9fe5

- 0ef9fe5 Merge pull request #307 from devilliersdutoit/fix/plugin-manifest-schema-key
- b6039ea fix: remove $schema key from Claude plugin manifest

```text
 .claude-plugin/plugin.json | 1 -
 1 file changed, 1 deletion(-)
```

### ab-testing (vendor, marketing/ab-testing)

`https://github.com/coreyhaines31/marketingskills` `skills/ab-testing`, 365b412..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- 0c9c8de fix: correct ab-testing sample-size tables

```text
 skills/ab-testing/SKILL.md                        | 12 +++---
 skills/ab-testing/references/sample-size-guide.md | 52 ++++++++++++-----------
 2 files changed, 34 insertions(+), 30 deletions(-)
```

### ad-creative (vendor, marketing/ad-creative)

`https://github.com/coreyhaines31/marketingskills` `skills/ad-creative`, 365b412..0cd9b3a

- 3bc63dc fix: don't label Remotion open source (it's source-available)
- 0791b15 fix: list ad-creative generation tools as options instead of picks
- 1841d3b fix: stop recommending Remotion as the only code-based video option in ad-creative

```text
 skills/ad-creative/SKILL.md                        | 14 ++--
 skills/ad-creative/evals/evals.json                |  2 +-
 skills/ad-creative/references/generative-tools.md  | 98 +++++++++++-----------
 .../ad-creative/references/imessage-video-ads.md   |  4 +-
 4 files changed, 57 insertions(+), 61 deletions(-)
```

### ads (vendor, marketing/ads)

`https://github.com/coreyhaines31/marketingskills` `skills/ads`, 365b412..0cd9b3a

- 929f087 test: add ads evals for October learnings
- 76ee08b chore: bump ads, ai-seo, prospecting, video, directory-submissions and repo to 2.13.4
- 3e3b311 docs: route ads questions to sequencing, tracker, and AI Max
- 2c394e9 feat: cover AI Max under the Google match-type gate
- c245b98 feat: add a persistent competitor ad tracker workflow
- e53425a feat: add Meta ad sequencing to the Andromeda playbook
- 686f50e Merge main into feature/conversion-tracking-skill
- 890da96 fix: replace cross-skill relative links with skill names
- 59dad5c chore: retire ads/references/conversion-tracking.md
- 88e0996 chore: point analytics, attribution and ads at conversion-tracking

```text
 skills/ads/SKILL.md                                |  21 +-
 skills/ads/evals/evals.json                        |  40 +++
 skills/ads/references/conversion-tracking.md       | 361 ---------------------
 .../ads/references/creative-research-automation.md |  19 ++
 .../ads/references/google-ads-audit-checklist.md   |   2 +-
 skills/ads/references/google-search-playbook.md    |   2 +
 skills/ads/references/meta-andromeda-playbook.md   |  19 ++
 7 files changed, 91 insertions(+), 373 deletions(-)
```

### ai-seo (vendor, marketing/ai-seo)

`https://github.com/coreyhaines31/marketingskills` `skills/ai-seo`, 365b412..0cd9b3a

- 44a17a0 test: add ai-seo evals for October learnings
- 76ee08b chore: bump ads, ai-seo, prospecting, video, directory-submissions and repo to 2.13.4
- 8364e8b feat: add topic-gap scoring, Bing grounding queries, Brave submit, Fern Agent Score to ai-seo
- 01f9b49 fix: drop drift-prone scan counts and partner list from AgentReady section
- 1a05b8e chore: bump ai-seo to 2.10.2 and repo to 2.13.1
- f2f3324 fix: add AgentReady standard to ai-seo agent readiness
- 001fd4e fix(ai-seo): merge two DIY monitoring steps to stay at 500 lines
- b3a1cce fix(ai-seo): describe Omnia's row as monitoring only
- 49fe560 docs(ai-seo): add Omnia to AI visibility monitoring options
- 1304398 fix(ai-seo): split the run-on crawler sentence
- 4f126de fix(ai-seo): fold the dated-facts check into visible pricing to stay at 500 lines
- 2793a0c chore: release 2.12.2 (ai-seo Meta crawlers and Muse)
- 854037f feat(ai-seo): keep proof as text and date the key facts agents quote
- 1c0677a feat(ai-seo): cover Meta AI and the Muse shopping agent
- 000180d feat(ai-seo): separate Meta's search, training, and user-fetch crawlers
- 435cde4 feat: route link work from related skills to link-building

```text
 skills/ai-seo/SKILL.md                             | 23 +++++-----
 skills/ai-seo/evals/evals.json                     | 27 +++++++++++
 skills/ai-seo/references/agent-readiness.md        | 53 ++++++++++++++++++----
 .../references/citations-vs-recommendations.md     |  2 +-
 .../ai-seo/references/multilingual-and-commerce.md |  4 +-
 .../ai-seo/references/platform-ranking-factors.md  | 24 ++++++++--
 skills/ai-seo/references/prompt-portfolio.md       | 14 ++++++
 7 files changed, 121 insertions(+), 26 deletions(-)
```

### analytics (vendor, marketing/analytics)

`https://github.com/coreyhaines31/marketingskills` `skills/analytics`, 365b412..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- 6b18883 fix: send GA4's recommended sign_up event in analytics' gtag samples
- 686f50e Merge main into feature/conversion-tracking-skill
- 554cfc9 fix(conversion-tracking): put operative rules in the description and add a revops boundary
- 88e0996 chore: point analytics, attribution and ads at conversion-tracking

```text
 skills/analytics/SKILL.md                         | 11 +++++++----
 skills/analytics/references/ga4-implementation.md |  6 +++---
 2 files changed, 10 insertions(+), 7 deletions(-)
```

### aso (vendor, marketing/aso)

`https://github.com/coreyhaines31/marketingskills` `skills/aso`, 3b84db2..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- f457dd8 fix: align aso scoring with its screenshot benchmarks and CPP figures

```text
 skills/aso/SKILL.md                       | 2 +-
 skills/aso/references/apple-specs.md      | 2 +-
 skills/aso/references/scoring-criteria.md | 6 +++---
 3 files changed, 5 insertions(+), 5 deletions(-)
```

### attribution (vendor, marketing/attribution)

`https://github.com/coreyhaines31/marketingskills` `skills/attribution`, 365b412..0cd9b3a

- 686f50e Merge main into feature/conversion-tracking-skill
- 88e0996 chore: point analytics, attribution and ads at conversion-tracking

```text
 skills/attribution/SKILL.md                       | 8 ++++----
 skills/attribution/references/by-business-type.md | 2 +-
 2 files changed, 5 insertions(+), 5 deletions(-)
```

### cold-email (vendor, marketing/cold-email)

`https://github.com/coreyhaines31/marketingskills` `skills/cold-email`, 3b84db2..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- 2fc2a2e fix: align cold-email's follow-up reply share with its sourced benchmark

```text
 skills/cold-email/SKILL.md                          | 2 +-
 skills/cold-email/references/follow-up-sequences.md | 2 +-
 2 files changed, 2 insertions(+), 2 deletions(-)
```

### community-marketing (vendor, marketing/community-marketing)

`https://github.com/coreyhaines31/marketingskills` `skills/community-marketing`, 5b2c000..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- a4ce322 fix: correct small contradictions in four skills

```text
 skills/community-marketing/SKILL.md                       | 4 ++--
 skills/community-marketing/references/community-models.md | 4 ++--
 2 files changed, 4 insertions(+), 4 deletions(-)
```

### competitor-profiling (vendor, marketing/competitor-profiling)

`https://github.com/coreyhaines31/marketingskills` `skills/competitor-profiling`, 3b84db2..0cd9b3a

- 435cde4 feat: route link work from related skills to link-building

```text
 skills/competitor-profiling/SKILL.md | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

### content-strategy (vendor, marketing/content-strategy)

`https://github.com/coreyhaines31/marketingskills` `skills/content-strategy`, 3b84db2..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- a4ce322 fix: correct small contradictions in four skills
- 435cde4 feat: route link work from related skills to link-building

```text
 skills/content-strategy/SKILL.md | 7 +++++--
 1 file changed, 5 insertions(+), 2 deletions(-)
```

### copy-editing (vendor, marketing/copy-editing)

`https://github.com/coreyhaines31/marketingskills` `skills/copy-editing`, 365b412..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- 15474fd fix: remove an em dash from copy-editing's approved example

```text
 skills/copy-editing/SKILL.md | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
```

### copywriting (vendor, marketing/copywriting)

`https://github.com/coreyhaines31/marketingskills` `skills/copywriting`, 365b412..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- a4ce322 fix: correct small contradictions in four skills

```text
 skills/copywriting/SKILL.md                      | 4 ++--
 skills/copywriting/references/copy-frameworks.md | 2 +-
 2 files changed, 3 insertions(+), 3 deletions(-)
```

### customer-research (vendor, marketing/customer-research)

`https://github.com/coreyhaines31/marketingskills` `skills/customer-research`, dda3841..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- a4ce322 fix: correct small contradictions in four skills

```text
 skills/customer-research/SKILL.md | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
```

### directory-submissions (vendor, marketing/directory-submissions)

`https://github.com/coreyhaines31/marketingskills` `skills/directory-submissions`, 3b84db2..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- 85b482e fix: correct G2/Capterra ownership and an unsourced penalty claim
- 7f7b9bc test: add directory-submissions evals for October learnings
- 76ee08b chore: bump ads, ai-seo, prospecting, video, directory-submissions and repo to 2.13.4
- ffbf38c fix: update Notion listing to the Notion Marketplace requirements
- 435cde4 feat: route link work from related skills to link-building

```text
 skills/directory-submissions/SKILL.md                    | 13 +++++++------
 skills/directory-submissions/evals/evals.json            | 16 ++++++++++++++--
 .../directory-submissions/references/directory-list.md   |  8 ++++----
 .../references/positioning-variations.md                 |  2 +-
 .../references/submission-tracker-template.csv           |  2 +-
 5 files changed, 27 insertions(+), 14 deletions(-)
```

### free-tools (vendor, marketing/free-tools)

`https://github.com/coreyhaines31/marketingskills` `skills/free-tools`, 365b412..0cd9b3a

- 435cde4 feat: route link work from related skills to link-building

```text
 skills/free-tools/SKILL.md | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

### image (vendor, marketing/image)

`https://github.com/coreyhaines31/marketingskills` `skills/image`, dda3841..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- 0e63fe1 fix: update image skill to current Flux names and fix inconsistencies

```text
 skills/image/SKILL.md                         | 14 +++++++-------
 skills/image/references/ai-image-prompting.md | 10 +++++-----
 2 files changed, 12 insertions(+), 12 deletions(-)
```

### lead-magnets (vendor, marketing/lead-magnets)

`https://github.com/coreyhaines31/marketingskills` `skills/lead-magnets`, 3b84db2..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- 529d3d9 fix: merge duplicate cro entries in popups and lead-magnets related skills

```text
 skills/lead-magnets/SKILL.md | 5 ++---
 1 file changed, 2 insertions(+), 3 deletions(-)
```

### marketing-loops (vendor, marketing/marketing-loops)

`https://github.com/coreyhaines31/marketingskills` `skills/marketing-loops`, 365b412..0cd9b3a

- 3c849a2 feat(marketing-loops): verify gap evidence in the signal-sweep loop
- 2651b01 feat(marketing-loops): run the backlink-prospecting loop through link-building

```text
 skills/marketing-loops/SKILL.md                   |  2 +-
 skills/marketing-loops/references/loop-catalog.md | 23 ++++++++++++-----------
 2 files changed, 13 insertions(+), 12 deletions(-)
```

### offers (vendor, marketing/offers)

`https://github.com/coreyhaines31/marketingskills` `skills/offers`, 365b412..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- 864b357 fix: distinguish annual-prepay pricing from acquisition discounts in offers

```text
 skills/offers/SKILL.md                    | 2 +-
 skills/offers/references/offer-formats.md | 2 +-
 2 files changed, 2 insertions(+), 2 deletions(-)
```

### paywalls (vendor, marketing/paywalls)

`https://github.com/coreyhaines31/marketingskills` `skills/paywalls`, 5b2c000..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- 448ab68 fix: align paywall discount experiments with the offers skill
- 6038ccd test: add mobile subscription paywall eval
- 31db506 feat: add mobile paywall triggers to paywalls description and refresh web map
- 22b65bc feat: add mobile subscription-app paywall reference

```text
 skills/paywalls/SKILL.md                           |  7 ++-
 skills/paywalls/evals/evals.json                   | 15 +++++
 skills/paywalls/references/experiments.md          | 10 +++-
 .../references/mobile-subscription-paywalls.md     | 69 ++++++++++++++++++++++
 4 files changed, 96 insertions(+), 5 deletions(-)
```

### popups (vendor, marketing/popups)

`https://github.com/coreyhaines31/marketingskills` `skills/popups`, 5b2c000..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- 529d3d9 fix: merge duplicate cro entries in popups and lead-magnets related skills

```text
 skills/popups/SKILL.md | 5 ++---
 1 file changed, 2 insertions(+), 3 deletions(-)
```

### programmatic-seo (vendor, marketing/programmatic-seo)

`https://github.com/coreyhaines31/marketingskills` `skills/programmatic-seo`, 3b84db2..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- 1f25782 fix: reconcile programmatic-seo's subfolder advice with its platforms reference

```text
 skills/programmatic-seo/SKILL.md                | 4 ++--
 skills/programmatic-seo/references/playbooks.md | 2 +-
 2 files changed, 3 insertions(+), 3 deletions(-)
```

### prospecting (vendor, marketing/prospecting)

`https://github.com/coreyhaines31/marketingskills` `skills/prospecting`, 3b84db2..0cd9b3a

- ec6d913 test(prospecting): add a gap-play eval
- 40bacfe feat(prospecting): route gap-play requests to signal plays
- 08c2612 feat(prospecting): add gap plays to signal plays
- 5c72851 test: add prospecting evals for October learnings
- 76ee08b chore: bump ads, ai-seo, prospecting, video, directory-submissions and repo to 2.13.4
- 49492d4 feat: add warm-path network mining to prospecting signal plays

```text
 skills/prospecting/SKILL.md                   |  6 ++--
 skills/prospecting/evals/evals.json           | 28 +++++++++++++++++
 skills/prospecting/references/signal-plays.md | 44 ++++++++++++++++++++++++++-
 3 files changed, 74 insertions(+), 4 deletions(-)
```

### public-relations (vendor, marketing/public-relations)

`https://github.com/coreyhaines31/marketingskills` `skills/public-relations`, dda3841..0cd9b3a

- 435cde4 feat: route link work from related skills to link-building

```text
 skills/public-relations/SKILL.md | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)
```

### revops (vendor, marketing/revops)

`https://github.com/coreyhaines31/marketingskills` `skills/revops`, 365b412..0cd9b3a

- 15b38b5 chore: bump 17 skills and repo to 2.13.7
- c1f91d8 fix: reconcile revops MQL thresholds and SLA reassignment rules

```text
 skills/revops/SKILL.md                            | 2 +-
 skills/revops/references/automation-playbooks.md  | 6 +++---
 skills/revops/references/lifecycle-definitions.md | 2 ++
 3 files changed, 6 insertions(+), 4 deletions(-)
```

### seo-audit (vendor, marketing/seo-audit)

`https://github.com/coreyhaines31/marketingskills` `skills/seo-audit`, 365b412..0cd9b3a

- 435cde4 feat: route link work from related skills to link-building

```text
 skills/seo-audit/SKILL.md                    | 3 ++-
 skills/seo-audit/references/rankings-push.md | 2 +-
 2 files changed, 3 insertions(+), 2 deletions(-)
```

### video (vendor, marketing/video)

`https://github.com/coreyhaines31/marketingskills` `skills/video`, dda3841..0cd9b3a

- 230ce15 test: add video evals for October learnings
- 76ee08b chore: bump ads, ai-seo, prospecting, video, directory-submissions and repo to 2.13.4
- ff70191 feat: add per-account personalized video workflow and drop HeyGen endorsement
- 3bc63dc fix: don't label Remotion open source (it's source-available)
- 9cc40d0 fix: reduce video framework comparison to durable facts
- 2cf9516 fix: correct Hyperframes vs Remotion comparison in video skill

```text
 skills/video/SKILL.md         | 47 ++++++++++++++++++++++++++++---------------
 skills/video/evals/evals.json | 27 +++++++++++++++++++++++++
 2 files changed, 58 insertions(+), 16 deletions(-)
```

### ketchup (vendor, productivity/ketchup)

`https://github.com/cursor/plugins` `pstack/skills/ketchup`, 019a6a2..1ba91fc

- bc14437 fix(pstack): say outright that ketchup never cuts items to stay under a word count (#708)
- 16541c6 fix(pstack): list every waiting item so each ketchup call is decidable (#692)

```text
 pstack/skills/ketchup/SKILL.md | 20 +++++++++++++-------
 1 file changed, 13 insertions(+), 7 deletions(-)
```

### explain-the-number (reference, engineering/principles)

`https://github.com/cursor/plugins` `pstack/skills/principle-explain-the-number/SKILL.md`, 56aca54..1ba91fc

- ab1f702 feat(pstack): port recent skill updates (#986)

```text
 pstack/skills/principle-explain-the-number/SKILL.md | 5 +++--
 1 file changed, 3 insertions(+), 2 deletions(-)
```

## Untracked upstream

Skills and subagent definitions at upstream HEAD that no `upstream/sources.json` entry tracks. Vendor each one, or list it in `upstream/ignored.json` with a reason.

### https://github.com/cursor/plugins

- `pstack/skills/ketchup-video` (skill): Catch the user up like /ketchup, with a short subtitled video of slides for what happened and the waiting calls as text under it. Use for /ketchup-video.
- `pstack/skills/statechart` (skill): Check a TLA+ model of a system that moves between states, such as a product flow, a protocol, or a service, and draw it as a Mermaid statechart. The report gives the shortest path to each state that breaks a rule. Use for /statechart, or to show a bug as a path through states.

### https://github.com/emilkowalski/skills

- `skills/remove-animations` (skill): Find the animations an interface doesn't need and remove them — motion on keyboard actions, high-frequency surfaces, functional data, and decoration with no purpose — then clean up what they leave behind. Edits code, but only to subtract; it never adds or retunes motion. Use when the user says the app "feels slow", "has too much animation", "feels over-animated", wants to "tone down the motion", or asks what animations to remove. For finding places that should animate, use find-animation-opportunities; for fixing animations that should stay, use improve-animations or review-animations.

### https://github.com/DannyMac180/skills

- `codex-dynamic-workflows` (skill): Design a multi-agent workflow for a complex task when the user requests dynamic orchestration.
- `codex-relay` (skill): Open one new native Codex task with a compact handoff, end this turn, and receive a single completion or blocker message back. Use when the user invokes $codex-relay and asks to open a new task, optionally naming a model or reasoning effort.
- `explain-this` (skill): Explain any digital artifact — a paper, PDF, article, code diff, or codebase — so the person actually understands it, not just skims it. Explanations are shaped by a persistent learner profile, gated by comprehension quizzes, and feed a spaced-repetition review loop. USE WHEN: explain this, explain this paper / PDF / article / diff / repo, help me understand this, what does this mean, what is this really saying, break this down, walk me through this, quiz me, review my cards, explain-this review, explain-this interview. NOT FOR: plain summarization when the user only wants a TL;DR, writing new content, or reviewing code for defects.
- `modsmith` (skill): Patterns, cost review and ready templates for Claude Mods (Claude Code plugins whose behaviour is a function-hooks module). Adds what the built-in mod authoring does not: proven designs (fork-check-draw, tool + ledger, mode registry, artifact-backed state), prompt-cache and token-cost review, a vetting pass for someone else's mod, and rules for mods that compose. USE WHEN: build a mod, make a claude mod, mod templates, quiz me after each turn, assumptions tool / register_assumption, supervisor that checks the turn, next-steps check, mode selector / mode registry, effort by domain, model router that keeps the cache, prompt cache cost of a mod, what does this mod cost per turn, review or vet someone's mod before installing, mods that work together, Kanban artifact as shared project state. NOT FOR: classic shell-command hooks in settings.json (PreToolUse etc.), a plain skill or slash command, MCP server authoring, or looking up the hooks API itself (use the engine's plugin-authoring guidance and generated types).
