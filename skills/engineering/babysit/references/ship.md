# Ship

Run this branch only when the user explicitly asks to ship, land, merge, or merge when ready. Babysitting alone never authorizes it. It is the half after `drive`: the stack is green, and now you land it.

**You own what lands. Verify each PR independently, land only the verified run from the root, then keep your hands off the queue.** GitHub only, through `gh`. Never require Graphite (`gt`).

1. **Verify every PR independently.** One verification subagent per PR, not batched, each one an agent that did not write the code. Each subagent calls the Skill tool with "verify-this", then exercises the real surface against parent versus head: call the Skill tool with "control-ui" for a web or Electron UI, "control-cli" for a CLI or TUI. Each returns `PASS`, `PASS+NOTES` or `FAIL` and posts that verdict on its own PR. Safe means a verdict from an agent that did not write the code. CI green is not a verdict, and an approving bot review is not a verdict.
2. **Land only the contiguous verified run rooted at the bottom.** Walk up from the lowest unmerged PR and stop at the first one without a passing verdict (`PASS` and `PASS+NOTES` both pass). A verified PR above an unverified one is not landable. Report the ceiling as a PR number and say what breaks the chain.
3. **Re-check that each verdict still describes the patch.** Record the verdict's head SHA, base SHA, and the stable `git patch-id` of that PR's base-to-head diff. A rebase or base retarget rewrites SHAs and can silently invalidate a verdict without touching a check. Before landing a PR, compare the recorded patch-id with its current base-to-head patch-id.
   - When the two patches differ only in tests, docs, or lint config, build what each lane ran: twice at the verdict SHA and once at the current head. A difference is noise if the two builds at the verdict SHA also show it, or if it is an embedded commit SHA. Judge each difference, not each file, and report each kind of noise with its files. If only noise differs, that lane's result stays valid, and checks and a review of the change run fresh.
   - Do not reuse a lane result from a dev server or from anything else with no build output. Rerun that lane.
   - Re-verify anything else when the patch changed. When it did not, keep the code verdict but re-run mergeability and CI at the current head.
   - Never use matching commit messages or a green check from an older SHA as a substitute.
4. **Prepare only the bottom PR.** Fetch current trunk. Rebase the lowest verified branch onto the exact trunk tip when needed, push it, and retarget only that PR with `gh pr edit <pr> --base <trunk>`. Re-run step 3 after the push. Do not retarget, arm, or merge descendants yet.
5. **Land one PR at a time.** If the bottom PR is mergeable now, squash it with `gh pr merge <pr> --squash`. If requirements are still running and the user asked for merge when ready, arm only that PR with `gh pr merge <pr> --squash --auto` (GitHub auto-merge). Wait for that PR to merge before preparing the next one.
6. **Do not read `autoMergeRequest` as stack readiness.** At most it says auto-merge was requested for one PR. It does not prove that a descendant is queued, that a patch verdict is current, or that the contiguous stack is safe. Confirm GitHub's state for the current bottom PR, and say the state is unknown when GitHub cannot report it.
7. **Recompute after every merge.** Fetch trunk, confirm the merged SHA is present, drop the merged PR from the frozen bottom-to-top list, and inspect the new bottom PR's base, head, checks, and patch-id. GitHub may retarget a child automatically; do not assume it did. Repeat steps 3 through 6 for that one PR. Independent work stays outside this chain and ships on its own.
8. **Watch the current frontier until it merges or fails. Do not mutate the queue around it.**
   - Use `bun <this skill's folder>/scripts/watch-pr/watch-pr --queued-stack --stack-prs <bottom>` only as an event wake. After each wake, poll `gh pr view <pr> --json state,mergedAt,mergeStateStatus,statusCheckRollup,autoMergeRequest`. Ignore `READY` until `mergedAt` is non-null or `state` is `MERGED`. Only then run step 7. Without Bun, `gh pr checks <pr> --watch` is the wake and the same `gh pr view` poll decides.
   - Hard-fail only when `state` is `CLOSED` with no `mergedAt`, when a required check concludes `FAILURE` or `CANCELLED` and blocks merge after auto-merge is no longer pending, or when `mergeStateStatus` is `UNSTABLE` or `DIRTY` with no auto-merge pending. `BLOCKED` while checks are pending or auto-merge is armed is not failure.
   - Do not use `drive`'s queued `WAITING`/`merge-queue` stop here.
   - Hold the watch under your harness's loop or scheduling command if it has one; otherwise a background watcher that wakes you on the event, with a long heartbeat as fallback.
   - Report each merge and the new ceiling. If the queue stalls, diagnose before mutating.
9. **Stop at the ceiling.** When the verified run is merged, report what landed, what the next unverified PR is, and what verifying it would take. Extending the run is a new pass through step 1.

## Reply

The verified run and its ceiling, each PR's verdict and who produced it, what you armed and how you confirmed it, what landed, and what the next gap needs. Link each PR as `https://github.com/<owner>/<repo>/pull/<number>`.
