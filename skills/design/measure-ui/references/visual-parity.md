# Visual parity: pixel-exact equivalence

Use when a change must not move a single pixel: migrating a styling system (CSS modules to Tailwind, one design-system version to the next), swapping a component's implementation, or matching two implementations of the same UI. The baseline is the spec, and an image diff decides equivalence; the eye does not.

1. **Build the baseline before any migration.** A visual-regression harness that screenshots the current component in every state (default, hover, focus, open, error, empty, each theme and breakpoint that ships), plus the target when you are matching two implementations. Capture deterministically: fixed viewport, device scale factor, fonts loaded, animations and caret blink disabled, network data stubbed, dates frozen. No baseline, no parity claim: the baseline is a blocking prerequisite, never a follow-up.
2. **Hold the anti-shortcut rules.** No harness changes, no edits to the baseline images, no restructuring a component to make a diff pass. If the baseline looks wrong, stop and ask the user; never edit it.
3. **Migrate one component at a time.** Shared primitives (tokens, typography, spacing, the base button) migrate first, as a blocking phase. After that, parallelize across worktrees with one owner per component, per the **separate-before-serializing-shared-state** principle (call the Skill tool with "principles"): two owners never touch the same component or the same baseline folder.
4. **Verify each component against its baseline by image diff** in the same harness on the same surface (call the Skill tool with "control-ui" for the browser or Electron driver). A nonzero diff is a fail. Investigate the pixel delta with the measurement rules in this skill's SKILL.md: read the computed styles and rects of the differing region on both sides and name the property that moved. Repeat per component until its diff is zero, with your harness's loop command if it has one.
5. **Keep a parity ledger.** One row per component: states covered, diff result, baseline path, and any approved deviation (each needs the user's explicit sign-off, recorded in the row).
6. **Open a PR per component or per safe batch.** Call the Skill tool with "pr" for the body, and cite the diff result for every component in it.

The reply adds: components migrated, the diff result for each, where the baseline harness lives, and what is left.
