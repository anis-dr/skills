# Upstream drift

Written by `bun run skills sync --report` and `--update`. `--update` moves vendored skills and references to upstream HEAD; forks keep their base commit until the `upstream-review` skill ports the change.

## Forks: needs review

### babysit (fork, engineering/babysit)

`https://github.com/cursor/plugins` `pstack/skills/poteto-mode/playbooks/babysit.md, pstack/skills/poteto-mode/playbooks/shipping.md, pstack/skills/poteto-mode/references/bugbot-triage.md, pstack/skills/poteto-mode/scripts/watch-pr, pstack/skills/poteto-mode/scripts/bootstrap.ts, pstack/skills/poteto-mode/scripts/package.json, pstack/skills/poteto-mode/scripts/bun.lock`, 019a6a2..99b609a

- fe096ef fix(watch-pr): cap polling sleeps at the deadline (#802)
- 96dec8e fix(watch-pr): distinguish fork heads during stack discovery (#801)

```text
 .../poteto-mode/scripts/watch-pr/github.test.ts    | 62 ++++++++++++++++++++++
 .../skills/poteto-mode/scripts/watch-pr/github.ts  | 12 ++++-
 .../poteto-mode/scripts/watch-pr/policy.test.ts    | 62 ++++++++++++++++++++++
 .../skills/poteto-mode/scripts/watch-pr/policy.ts  | 10 +++-
 .../skills/poteto-mode/scripts/watch-pr/types.ts   |  1 +
 5 files changed, 143 insertions(+), 4 deletions(-)
```

## Patch conflicts: needs a hand fix

These skills keep their old pin: their patch no longer applies to upstream HEAD. Move the pin by hand, run `bun run skills sync`, redo the edit in the skill folder, then run `bun run skills patch <name>`.

### reflect (vendor, engineering/reflect)

`https://github.com/cursor/plugins` `pstack/skills/reflect`, 190d287..99b609a

- 7054003 fix(pstack): route reflect edits out of the plugin cache (#800)

```text
git apply /home/runner/work/skills/skills/upstream/patches/reflect.patch: error: patch failed: SKILL.md:12
error: SKILL.md: patch does not apply
```

```text
 pstack/skills/reflect/SKILL.md | 2 ++
 1 file changed, 2 insertions(+)
```

### swarm (vendor, engineering/swarm)

`https://github.com/cursor/plugins` `pstack/skills/swarm`, 190d287..99b609a

- e73df47 fix(pstack): renumber swarm's Phase A and fix its dangling table reference (#807)

```text
git apply /home/runner/work/skills/skills/upstream/patches/swarm.patch: error: patch failed: SKILL.md:19
error: SKILL.md: patch does not apply
```

```text
 pstack/skills/swarm/SKILL.md | 8 ++++----
 1 file changed, 4 insertions(+), 4 deletions(-)
```

## Vendored

### create-formal-verification-skill (vendor, engineering/create-formal-verification-skill)

`https://github.com/cursor/plugins` `pstack/skills/create-formal-verification-skill`, 190d287..99b609a

- 00d5dec feat(pstack): tell generated verify skills to read each model-check result with /statechart (#794)

```text
 pstack/skills/create-formal-verification-skill/SKILL.md | 2 ++
 1 file changed, 2 insertions(+)
```

### modern-web-guidance (vendor, engineering/modern-web-guidance)

`https://github.com/GoogleChrome/modern-web-guidance` `skills/modern-web-guidance`, b31dc0a..65e7edd

- 65e7edd Release v0.0.195

```text
 skills/modern-web-guidance/SKILL.md                |  43 ++-
 .../modern-web-guidance/guides/css/css-layout.md   |   6 +-
 .../guides/forms/ime-safe-enter-submit.md          |   8 +-
 .../guides/js/calculate-event-differentials.md     |  46 ++-
 .../guides/js/capture-location-agnostic-data.md    |  38 +-
 .../guides/js/coordinate-global-events.md          |   4 +-
 .../guides/js/sequence-distributed-events.md       |  91 +++++
 .../guides/performance/batch-analytics-events.md   |   2 +-
 .../guides/performance/full-session-analytics.md   |   2 +-
 .../performance/sequence-distributed-events.md     |  76 ----
 .../guides/security/passkeys.md                    |   1 +
 .../guides/security/quick-sign-ins.md              | 242 ++++++++++++
 .../guides/security/validate-origins.md            |   8 +-
 .../modern-web-guidance/guides/ui-atoms/icons.md   | 290 +++++++++++++++
 .../guides/ui-atoms/position-aware-tooltips.md     |   2 +-
 .../guides/ui-atoms/responsive-table.md            |  19 +-
 ...ed-dropdowns.md => viewport-aware-dropdowns.md} |   4 +-
 .../guides/ui-behaviors/2d-panning.md              | 151 ++++++++
 .../guides/ui-behaviors/motion.md                  |  47 ++-
 .../ui-behaviors/scoped-component-transitions.md   | 229 ++++++++++++
 .../guides/ui-components/checkbox.md               |   9 +-
 .../guides/ui-components/progress.md               | 181 +++++++++
 .../guides/ui-components/spinner.md                |  34 +-
 .../guides/visual-design/apply-webgl-shaders.md    | 235 +++++++-----
 .../guides/visual-design/browser-ui-theming.md     |   2 +-
 .../guides/visual-design/dark-mode.md              |   5 +-
 .../visual-design/export-html-media-from-canvas.md | 263 ++++++++-----
 .../expose-canvas-content-to-browser-features.md   | 380 ++++++++++---------
 .../interactive-content-in-3d-scenes.md            | 407 ++++++++++++---------
 .../guides/webmcp/agentic-forms.md                 |   4 +-
 .../guides/webmcp/agentic-javascript-tools.md      |  47 +++
 skills/modern-web-guidance/guides/webmcp/webmcp.md |   1 +
 32 files changed, 2151 insertions(+), 726 deletions(-)
```

### ads (vendor, marketing/ads)

`https://github.com/coreyhaines31/marketingskills` `skills/ads`, 365b412..e85f3cb

- 686f50e Merge main into feature/conversion-tracking-skill
- 890da96 fix: replace cross-skill relative links with skill names
- 59dad5c chore: retire ads/references/conversion-tracking.md
- 88e0996 chore: point analytics, attribution and ads at conversion-tracking

```text
 skills/ads/SKILL.md                                |  15 +-
 skills/ads/references/conversion-tracking.md       | 361 ---------------------
 .../ads/references/google-ads-audit-checklist.md   |   2 +-
 3 files changed, 8 insertions(+), 370 deletions(-)
```

### ai-seo (vendor, marketing/ai-seo)

`https://github.com/coreyhaines31/marketingskills` `skills/ai-seo`, 365b412..e85f3cb

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
 skills/ai-seo/SKILL.md                             | 19 ++++++++++---------
 .../references/citations-vs-recommendations.md     |  2 +-
 .../ai-seo/references/multilingual-and-commerce.md |  4 +++-
 .../ai-seo/references/platform-ranking-factors.md  | 22 +++++++++++++++++++---
 4 files changed, 33 insertions(+), 14 deletions(-)
```

### analytics (vendor, marketing/analytics)

`https://github.com/coreyhaines31/marketingskills` `skills/analytics`, 365b412..e85f3cb

- 686f50e Merge main into feature/conversion-tracking-skill
- 554cfc9 fix(conversion-tracking): put operative rules in the description and add a revops boundary
- 88e0996 chore: point analytics, attribution and ads at conversion-tracking

```text
 skills/analytics/SKILL.md | 5 +++--
 1 file changed, 3 insertions(+), 2 deletions(-)
```

### attribution (vendor, marketing/attribution)

`https://github.com/coreyhaines31/marketingskills` `skills/attribution`, 365b412..e85f3cb

- 686f50e Merge main into feature/conversion-tracking-skill
- 88e0996 chore: point analytics, attribution and ads at conversion-tracking

```text
 skills/attribution/SKILL.md                       | 8 ++++----
 skills/attribution/references/by-business-type.md | 2 +-
 2 files changed, 5 insertions(+), 5 deletions(-)
```

### competitor-profiling (vendor, marketing/competitor-profiling)

`https://github.com/coreyhaines31/marketingskills` `skills/competitor-profiling`, 3b84db2..e85f3cb

- 435cde4 feat: route link work from related skills to link-building

```text
 skills/competitor-profiling/SKILL.md | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

### content-strategy (vendor, marketing/content-strategy)

`https://github.com/coreyhaines31/marketingskills` `skills/content-strategy`, 3b84db2..e85f3cb

- 435cde4 feat: route link work from related skills to link-building

```text
 skills/content-strategy/SKILL.md | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)
```

### directory-submissions (vendor, marketing/directory-submissions)

`https://github.com/coreyhaines31/marketingskills` `skills/directory-submissions`, 3b84db2..e85f3cb

- 435cde4 feat: route link work from related skills to link-building

```text
 skills/directory-submissions/SKILL.md | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

### free-tools (vendor, marketing/free-tools)

`https://github.com/coreyhaines31/marketingskills` `skills/free-tools`, 365b412..e85f3cb

- 435cde4 feat: route link work from related skills to link-building

```text
 skills/free-tools/SKILL.md | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

### marketing-loops (vendor, marketing/marketing-loops)

`https://github.com/coreyhaines31/marketingskills` `skills/marketing-loops`, 365b412..e85f3cb

- 2651b01 feat(marketing-loops): run the backlink-prospecting loop through link-building

```text
 skills/marketing-loops/SKILL.md                   |  2 +-
 skills/marketing-loops/references/loop-catalog.md | 18 +++++++++---------
 2 files changed, 10 insertions(+), 10 deletions(-)
```

### public-relations (vendor, marketing/public-relations)

`https://github.com/coreyhaines31/marketingskills` `skills/public-relations`, dda3841..e85f3cb

- 435cde4 feat: route link work from related skills to link-building

```text
 skills/public-relations/SKILL.md | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)
```

### seo-audit (vendor, marketing/seo-audit)

`https://github.com/coreyhaines31/marketingskills` `skills/seo-audit`, 365b412..e85f3cb

- 435cde4 feat: route link work from related skills to link-building

```text
 skills/seo-audit/SKILL.md                    | 3 ++-
 skills/seo-audit/references/rankings-push.md | 2 +-
 2 files changed, 3 insertions(+), 2 deletions(-)
```

### ketchup (vendor, productivity/ketchup)

`https://github.com/cursor/plugins` `pstack/skills/ketchup`, 019a6a2..99b609a

- bc14437 fix(pstack): say outright that ketchup never cuts items to stay under a word count (#708)
- 16541c6 fix(pstack): list every waiting item so each ketchup call is decidable (#692)

```text
 pstack/skills/ketchup/SKILL.md | 20 +++++++++++++-------
 1 file changed, 13 insertions(+), 7 deletions(-)
```

## Untracked upstream

Skills and subagent definitions at upstream HEAD that no `upstream/sources.json` entry tracks. Vendor each one, or list it in `upstream/ignored.json` with a reason.

### https://github.com/cursor/plugins

- `pstack/skills/ketchup-video` (skill): Catch the user up like /ketchup, with a short silent video of slides for what happened and the waiting calls as text under it. Use for /ketchup-video.
- `pstack/skills/statechart` (skill): Draw how any system moves between states, such as a product flow, a protocol, or a service, as a Mermaid statechart from a TLA+ model. Each bug is a numbered path with blue borders to a state that breaks a rule. Use for /statechart, to show a bug as a path through states, or to turn an agreed chart into a TLA+ skeleton.
