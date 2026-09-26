---
name: autonomous-run
description: "Drive a long task to a checkable exit predicate without stopping: pick a wake mechanism, make the smallest evidence-backed change per iteration, revert what did not help, fix mid-run discoveries yourself, and checkpoint every iteration. Use when the user says 'run until done', 'loop until X', 'keep going while I'm away', or hands over a long task to finish unattended."
---

# Autonomous run

You own the exit condition. Define done, then drive to it without stopping.

## Steps

1. **State the exit predicate.** Before the first iteration, write done as a predicate you can check by running something: tests green, the repro fixed, all N PRs merged, pixel-diff zero. Done when the predicate names the command or artifact that proves it.
2. **Pick the wake mechanism.** Use your harness's loop or scheduling command if it has one. Otherwise:
   - When there is an event to watch (CI finishing, a merge, a ref advancing), start a subagent in the background that watches for the event and wakes you, with a long time-based heartbeat as the fallback.
   - When there is no event, use a fixed-interval heartbeat sized to when the result is worth checking again.
3. **Iterate.** Each iteration makes the smallest change the evidence justifies, checks it against the predicate, commits it if the predicate advanced, and discards it if it did not help. Revert a belt-and-suspenders change that "might help" instead of leaving it in. Sequence the work by the sequence-verifiable-units principle (call the Skill tool with "principles"). Verify each unit before starting the next, never in one batch at the end.
4. **Own mid-run discoveries.** Fix what you find along the way yourself, each through the skill that owns that kind of work:
   - A broken skill: `Call the Skill tool with "writing-for-agents"` and fix it.
   - A related bug, a flaky verifier, or a tooling failure: `Call the Skill tool with "diagnosing-bugs"`.
   - Red CI: `Call the Skill tool with "loop-on-ci"`.
   - Review noise and bot comments: `Call the Skill tool with "get-pr-comments"` and answer each on its merits.
   - Orphaned follow-ups and fixable drift: finish them with the skill that matches the work.

   Put each out-of-band fix in its own PR: `Call the Skill tool with "pr"` for the body, then `gh pr create`. Keep reversible work moving without asking the user or parking it for them. Surface only an irreversible action, a genuine product or preference call that no experiment can settle, or a real dead end. The predicate stays the main drive, so go back to it after each side fix.
5. **Checkpoint every iteration.** `Call the Skill tool with "show-me-your-work"` and add one row per iteration: what changed and whether the predicate moved.
6. **Stop only when the predicate holds.** A plateau is not a stop: change your approach and push past it. When you reach a genuine dead end, surface it instead of spinning. Keep the predicate exactly as stated in step 1; relaxing it to declare victory is not done.

## Reply

Give the exit predicate, the number of iterations run, what landed (PR links as `https://github.com/<owner>/<repo>/pull/<number>`), what you discarded and why, and the final predicate state with the evidence that shows it.
