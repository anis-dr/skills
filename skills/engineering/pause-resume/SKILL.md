---
name: pause-resume
description: "Pause in-flight work at a safe boundary with a wip commit and a resume note, or pick up a prior agent's in-flight work from its transcript, pushed branch or pause note without redoing it. Use when the user explicitly asks to pause, stop for now, or is about to restart the harness or hit context compaction, or asks to resume, continue or take over an earlier session's work."
---

# Pause and resume

Two branches. Pausing leaves a checkpoint a cold-start agent can resume from. Picking up reads that checkpoint, or any prior trail, and continues from it.

This skill resumes one session's work. It differs from two user-invoked skills:

- `/recall` rebuilds context across many recent chats and the shared record. It does not resume one session.
- `/handoff` writes a portable document for a new harness, folder or person. When the next agent lives elsewhere, tell the user to run `/handoff` instead.

## Pausing

You own a clean stop. Pause only on an explicit request: a pause, going offline, a harness restart, or imminent context compaction. On "keep going", "going to bed, keep going" or "don't stop", keep working.

1. **Stop at a safe boundary.** Finish the current atomic step or back out of it. Start nothing new, and cancel any subagents you started.
2. **Take no irreversible action to pause.** Open no PR and push nothing, unless a PR or push was already out.
3. **Make the work durable.** Commit uncommitted edits as one clear `wip:` commit on the current branch so nothing is lost. If the tree is broken, say so in one line of the commit body.
4. **Write the resume note off-context.** `Call the Skill tool with "scratchpad"` and write the note to `.scratchpad/<slug>/resume.md`. Capture the intent, what you were doing, progress and what is verified, the current state, the next steps, key files and gotchas. If a show-me-your-work trail exists, point at it instead of copying it.

## Picking up

You own the resume point. Read the prior trail and continue from it; redo nothing it already settled.

1. **Locate the prior trail.** It is one of these:
   - A local transcript of this workspace. `Call the Skill tool with "transcripts"` to find it, and read only this workspace's transcripts, never other projects' chats.
   - A link to another agent's run.
   - A pushed branch.
   - A pause note in `.scratchpad/<slug>/resume.md`.

   Read the overview and the last messages first, then scan back for the decision points. Parse a long transcript in a subagent and keep only the reduced timeline in the main thread, per the guard-the-context-window principle (call the Skill tool with "principles").
2. **Reconstruct operational state.** Record the branch and worktree, what already landed (`git log` and `git diff` against the base), the open todos and the decisions made. Treat the prior trail as authoritative input and build on it instead of deriving it again.
3. **Diff done against pending.** Compare what shipped with what was planned and name the resume point. Keep the prior repro and completed work as they are. The urge to "verify from scratch" means you are treating an authoritative trail as untrustworthy.
4. **Route the rest.** Pick the verdict: continue the execution, ship a finished recommendation, ratify or override a prior conclusion, or write a postmortem of a failed run. Hand the remaining work to the matching skill, for example `Call the Skill tool with "autonomous-run"` for a long unattended task or `"diagnosing-bugs"` for a defect. When the matching skill is user-invoked, such as `/babysit` for a PR, tell the user to run it and wait. Picking up ends here; the routed skill owns the rest.
5. **Verify inherited claims on the real artifact.** Check them against the original goal per the prove-it-works principle (call the Skill tool with "principles"). A passing self-report from the prior agent is not the proof.

## Reply

- **After pausing.** This is a pause, not a final report. Say where you are in the loop, what is on disk and what is still only in your head (paths, no diff dumps), the commits you made and whether the tree is clean, and the first action on resume.
- **After picking up.** Say where the prior agent stopped, what you inherited and what you redid (ideally nothing), the resume point, and the outcome.
