---
name: checkbox-picker
description: "Generate a local HTML checkbox picker so the user can bulk keep/delete/install items (skills, plugins, MCP servers, dependencies), then read their decisions back as JSON and execute. Use when a choice spans dozens of items and listing them in chat would be inaccurate."
---

# Checkbox picker

When the user must choose over many items (100+ skills, plugins, MCP servers), don't negotiate the list in chat. Build a picker they click through, then execute from the exported JSON.

## Procedure

1. Collect items programmatically from the real sources (directories, config JSON, GitHub API), never hand-typed. For skills, parse the SKILL.md frontmatter `description`. Record a stable id per item with a source prefix (`agent:`, `skill:`, `plugin:`, `mcp:`, `pack:`).
2. Group items (by source, then by cluster) and pre-check each checkbox with your recommendation. Semantics: checked = keep/install, unchecked = delete/skip. Color rows green/red so the state is scannable.
3. Include per-group "keep all"/"delete all" buttons, a name filter input, and a sticky footer with live counts plus a **Download decisions** button that saves `{generated, keep: [ids], delete: [ids]}` (or install/skip) as JSON via a Blob download.
4. Write the HTML to `~/Desktop/<topic>.html` and `open` it. The user downloads the decisions file to `~/Downloads/`; read it from there and execute.
5. Reuse the previous HTML as a template for round 2: swap the `const ITEMS = ...` JSON, retitle, and rename the download filename so decision files don't collide.

## Execution gotchas (from a real skills cleanup)

- Move deletions to a dated trash dir (`~/skills-cleanup-trash-YYYYMMDD`), never rm. Offer to empty it later.
- Before deleting a canonical item, check whether any kept per-agent symlink still resolves to it; skip and report conflicts.
- Some "directories" are symlinks into another agent's install (a skill pack folder in one agent's skills dir can point into a second agent's home folder). `shutil.move` through such links corrupts the source; check `os.path.islink` on every parent before recursing.
- After deletions, sweep every agent skill dir for dangling symlinks.
- Claude Code plugins uninstall via `claude plugin uninstall <name>`; don't hand-edit `installed_plugins.json`.
- Back up every config JSON before editing (`.bak-<date>` copy).
- Items the agent can't change (for example MCP servers configured inside a desktop app) still belong in the picker; return the user's choices as a manual checklist.
