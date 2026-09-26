---
name: orca-parallel-ticket-handoff
description: "Use when another agent tab is already open in the same Orca worktree and the user wants two tickets (wayfinder or other) run in parallel. Hands one ticket to that tab and reviews UI in Orca without colliding with its browser."
---

# Orca parallel ticket handoff

Use when the user says another agent tab is already open in this Orca worktree and asks to run two tickets in parallel. The other tab runs its ticket; hand the work to it rather than spawning subagents for it.

The commands below use the `orca` CLI. For the full, version-matched guide, call the Skill tool with "orca-cli". If "orca-cli" isn't installed, ask the user to run npx skills add stablyai/orca --skill orca-cli, then continue.

## Hand off

1. `orca terminal list --worktree active --json`: find the idle agent terminal (titled like `<agent> > <repo>`), not the one running you.
2. `orca terminal read --terminal <handle> --limit 12 --json`: confirm it is at the prompt, not mid-task.
3. `orca terminal wait --terminal <handle> --for tui-idle --timeout-ms 15000 --json`
4. `orca terminal send --terminal <handle> --enter --json --text "$PROMPT"`, with `PROMPT` passed through the environment. It carries everything the other session needs: the slash command, the ticket number, the claim command, the tracker doc path, which tickets NOT to touch, and the resolve, close and map-update contract.
5. Read the terminal once after about 8s to confirm it started, then leave it alone.

## Review without colliding

The other session may own the worktree's active browser tab.

- `orca tab create --url <url> --json`, and save the `browserPageId`.
- Pass `--page <id>` on every `orca goto`, `wait`, `eval` and `screenshot` call.
- Serve throwaway boards with `python3 -m http.server <port> --bind 127.0.0.1 --directory <dir>` as a background process, and stop it when done.

## Prototype capture

Commit throwaway boards on `prototype/<slug>` from a temp worktree (`git worktree add /tmp/<x> -b prototype/<slug> main`), push, remove the worktree, and post the branch link on the ticket. Main stays clean.
