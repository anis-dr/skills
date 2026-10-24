---
name: file-structure
description: Use before creating, moving, splitting or naming a file, and when a folder you work in is hard to navigate.
---

# File structure

Leave every folder you touch easier to navigate than you found it. The tree should say what the code does before anyone opens a file.

## Placing a file

1. **Look at the siblings first.** Put tests, configs, plans and docs where the existing ones live, named the way they are named.
2. **Put code with the code it works with.** Add to the file that owns the concern; split only topics a reader can understand apart.
3. **Reuse before you write, name for contents.** Search for an existing helper before adding one, and put shared code where the repo already keeps it. A new file's name tells a reader what is inside without opening it.

## Improving what you touch

4. **Tidy inside your footprint.** When a folder or file you work in is flat, vaguely named or scattered, regroup it by feature and rename for contents.
5. **Prepare first.** When the layout makes the task harder, restructure first, then make the change.
6. **Moves are their own commit.** Move and rename only, with imports rewritten by the language server or a codemod; run the checks; then commit the behaviour change separately.
7. **Propose beyond the footprint.** Folders you don't touch, cross-package moves and new top-level layouts go in your final reply as a short plan for the user to approve.

Done when every file you added or moved sits beside its siblings under a name that says what it holds, and the repo's checks (lint, dependency rules, `fallow audit` when installed) pass after the moves.

When a placement rule keeps being corrected, suggest the user run `/setup-ts-deep-modules` so a check enforces it. For temporary files, call the Skill tool with "scratchpad".
