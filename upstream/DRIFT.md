# Upstream drift

Written by `bun run skills sync --report` and `--update`. `--update` moves vendored skills and references to upstream HEAD; forks keep their base commit until the `upstream-review` skill ports the change.

No pinned skill changed upstream.

## Untracked upstream

Skills and subagent definitions at upstream HEAD that no `upstream/sources.json` entry tracks. Vendor each one, or list it in `upstream/ignored.json` with a reason.

### https://github.com/emilkowalski/skills

- `skills/gestures` (skill): Build drag, swipe, and sheet interactions that track the finger 1:1 and stay interruptible. Use when building or fixing anything the user drags, swipes, flings, holds, or dismisses with a gesture — drawers, sheets, swipe-to-dismiss toasts and cards, drag-to-reorder, pull-to-refresh, hold-to-confirm — or when a gesture feels laggy, disconnected from the finger, jumps on release, or can't be caught mid-animation. Triggers on — gesture, drag, draggable, swipe, swipe to dismiss, fling, momentum, velocity, drawer, sheet, bottom sheet, snap points, Vaul, dragConstraints, dragElastic, dragMomentum, onDragEnd, whileDrag, useMotionValue, rubber-band, overscroll, pull to refresh, hold to delete, press and hold, touch-action, dismiss threshold, "doesn't follow my finger", "jumps when I let go", "can't grab it mid-animation".

### https://github.com/DannyMac180/skills

- `codex-dynamic-workflows` (skill): Design a multi-agent workflow for a complex task when the user requests dynamic orchestration.
- `codex-relay` (skill): Open one new native Codex task with a compact handoff, end this turn, and receive a single completion or blocker message back. Use when the user invokes $codex-relay and asks to open a new task, optionally naming a model or reasoning effort.
- `explain-this` (skill): Explain any digital artifact — a paper, PDF, article, code diff, or codebase — so the person actually understands it, not just skims it. Explanations are shaped by a persistent learner profile, gated by comprehension quizzes, and feed a spaced-repetition review loop. USE WHEN: explain this, explain this paper / PDF / article / diff / repo, help me understand this, what does this mean, what is this really saying, break this down, walk me through this, quiz me, review my cards, explain-this review, explain-this interview. NOT FOR: plain summarization when the user only wants a TL;DR, writing new content, or reviewing code for defects.
- `modsmith` (skill): Patterns, cost review and ready templates for Claude Mods (Claude Code plugins whose behaviour is a function-hooks module). Adds what the built-in mod authoring does not: proven designs (fork-check-draw, tool + ledger, mode registry, artifact-backed state), prompt-cache and token-cost review, a vetting pass for someone else's mod, and rules for mods that compose. USE WHEN: build a mod, make a claude mod, mod templates, quiz me after each turn, assumptions tool / register_assumption, supervisor that checks the turn, next-steps check, mode selector / mode registry, effort by domain, model router that keeps the cache, prompt cache cost of a mod, what does this mod cost per turn, review or vet someone's mod before installing, mods that work together, Kanban artifact as shared project state. NOT FOR: classic shell-command hooks in settings.json (PreToolUse etc.), a plain skill or slash command, MCP server authoring, or looking up the hooks API itself (use the engine's plugin-authoring guidance and generated types).
