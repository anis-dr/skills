---
name: scratchpad
description: >-
  Decide where a file goes and keep temporary files the user may want to read or edit in the repository's gitignored `.scratchpad/` folder. Use before writing a report, draft, screenshot, captured output, decision log, resume note, hand-off, or probe script that is not meant to be committed.
---

# Scratchpad

`.scratchpad/` at the repository root holds temporary files **that are useful for the user to see, read or modify**: a report to review, a draft to edit, evidence to check, a probe to rerun. Git ignores the folder. Unlike the OS temp folder, it sits beside the code, survives a reboot, and the user can open it from their editor.

## Where a file goes

Pick the first row that matches.

| The file is | It goes |
|---|---|
| A location a skill names for its own output (an issue tracker, a worktree, an isolated folder outside the repo) | Where that skill says. Its location wins. |
| Durable: meant to be committed or kept | Matt Pocock's structure: `CONTEXT.md` for domain language, `docs/adr/` for decisions, `docs/agents/` for agent setup, the configured issue tracker for specs and tickets (GitHub, or `.issues/<feature>/` when the repo uses the local-markdown tracker), and the code, tests and docs themselves. |
| Temporary, and the user may want to see, read or change it | `.scratchpad/<task>/` |
| Temporary plumbing only the agent touches (a swap file, a git index, a large download it deletes, a working directory that must sit outside the repo) | The OS temp folder |

`.issues/` holds tickets and specs you track; `.scratchpad/` holds temporary files and is never committed. (Matt Pocock's skills call the tracker folder `.scratch/`; this repo renames it to `.issues/`.)

## Steps

1. **Check the folder.** If `.scratchpad/` is missing, create it and add `.scratchpad/` to `.gitignore`. Done when `git status` stays clean after you write a file inside it.
2. **Make one folder per task.** Name it for the task, such as `.scratchpad/slug-collision-probe/` or `.scratchpad/issue-42/`. Put every file from that task inside it.
3. **Name files for what they show.** `drizzle-check-output.sql` beats `test2.sql`. A reader should know what a file shows without opening it.
4. **Record how to rerun it.** Each probe carries the command that runs it, in a comment at the top or in a `README.md` in the task folder.
5. **Tell the user the path** of anything they should look at.
6. **Promote what lasts.** When a result has to outlive the task, move it to its durable place from the table above. The scratch copy then goes.
7. **Clean up when the work lands.** Delete the task folder once its change is merged and nobody needs its evidence. Keep a folder only while someone still has to review it.

## What belongs here

- Reports, as PDFs (call the Skill tool with "technical-pdf").
- Plans and explanations in show-me's format: Markdown or HTML, whichever show-me picks.
- Prototypes, pickers, catalogs and boards the user clicks through, as HTML.
- Drafts the user may edit before they are published, such as a spec or a PR body.
- Evidence: screenshots, recordings, captured logs, API responses, generated SQL, measurements.
- Decision logs and resume notes from long runs.
- Probe scripts, spikes and throwaway prototypes.
- Hand-off files between agents in the same workspace.

## Rules

- **Tracked code stays independent.** Code, tests, and build config never import from `.scratchpad/`, because a fresh clone doesn't have it.
- **Local paths stay local.** A path into `.scratchpad/` works only on this machine. Commits, pull requests, and issues get a summary of the finding instead.
- **Worktrees don't share it.** Each worktree has its own `.scratchpad/`. When an agent in one worktree needs files from another, give it the absolute path to that checkout's folder.
- **Credentials stay out.** Scratch files are plain files that any local process can read. Use placeholder values or read secrets from the environment at run time.
