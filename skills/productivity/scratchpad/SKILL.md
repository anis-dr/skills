---
name: scratchpad
description: >-
  Keep throwaway work in the repository's gitignored `.scratchpad/` folder. Use before writing a probe script, spike, draft, captured output, screenshot, or subagent hand-off that is not meant to be committed.
---

# Scratchpad

Throwaway work lives in `.scratchpad/` at the repository root. Git ignores the folder, so nothing in it reaches a commit. Unlike `/tmp`, it sits beside the code, survives a reboot, and a reviewer can open it.

## Steps

1. **Check the folder.** If `.scratchpad/` is missing, create it and add `.scratchpad/` to `.gitignore`. Done when `git status` stays clean after you write a file inside it.
2. **Make one folder per task.** Name it for the task, such as `.scratchpad/slug-collision-probe/` or `.scratchpad/issue-42/`. Put every file from that task inside it.
3. **Name files for what they show.** `drizzle-check-output.sql` beats `test2.sql`. A reader should know what a file shows without opening it.
4. **Record how to rerun it.** Each probe carries the command that runs it, in a comment at the top or in a `README.md` in the task folder.
5. **Promote what lasts.** When a result has to outlive the task, move it into tracked files: a test, a doc, an ADR, a comment in the code. The scratch copy then goes.
6. **Clean up when the work lands.** Delete the task folder once its change is merged and nobody needs its evidence. Keep a folder only while someone still has to review it.

## What belongs here

- Probe scripts that check how a library or query behaves.
- Spike code and throwaway prototypes.
- Design drafts, candidate sketches, and comparison notes.
- Captured output: logs, generated SQL, API responses.
- Screenshots and recordings from manual checks.
- Hand-off files between agents.

## Rules

- **Tracked code stays independent.** Code, tests, and build config never import from `.scratchpad/`, because a fresh clone doesn't have it.
- **Local paths stay local.** A path into `.scratchpad/` works only on this machine. Commits, pull requests, and issues get a summary of the finding instead.
- **Worktrees don't share it.** Each worktree has its own `.scratchpad/`. When an agent in one worktree needs files from another, give it the absolute path to that checkout's folder.
- **Credentials stay out.** Scratch files are plain files that any local process can read. Use placeholder values or read secrets from the environment at run time.
