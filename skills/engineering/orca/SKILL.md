---
name: orca
description: "Working inside the Orca IDE with the orca CLI. Use when you need visual or behavioral proof of a web UI change in Orca's built-in browser (snapshots, computed styles, screenshots, app shells that own their scroll container). Also use when another agent tab is already open in the same Orca worktree and the user wants two tickets run in parallel."
---

# Working inside Orca

Inside Orca, drive the IDE through the `orca` CLI: its built-in browser, its terminals and its tabs. Launch a headless or external browser only when the user explicitly asks for one.

## Resolve the CLI once

Use the `ORCA_CLI_COMMAND` env var if set, else `orca-dev` in a dev checkout, else `orca-ide` on Linux outside Orca terminals, else `orca`. The references write `orca` for whichever command you resolved.

Before using unfamiliar subcommands, call the Skill tool with "orca-cli", or print the version-matched guide with `orca skills get orca-cli`. If "orca-cli" isn't installed, ask the user to run npx skills add stablyai/orca --skill orca-cli, then continue.

## Branches

- [Browser verification](references/browser-verification.md): proving a web UI change works, by snapshot, computed styles and screenshots in Orca's built-in browser.
- [Parallel ticket handoff](references/parallel-ticket-handoff.md): another agent tab is open in the same worktree and the user wants two tickets run in parallel.
