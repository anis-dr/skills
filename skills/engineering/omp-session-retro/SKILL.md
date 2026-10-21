---
name: omp-session-retro
description: "Use for a multi-day or cross-harness retro over omp, Claude Code, Codex, Cursor and pi session logs, to rank steering-file, skill and config improvements with evidence."
---

# Session retro over many sessions and harnesses

Use this when a retro covers days or months of sessions: thousands of JSONL files and GBs of raw logs. For one session, use `/retro` (repo environment) or `/reflect` (skill edits) instead. If a previous run exists, reuse its scripts in `.scratchpad/agent-retro/work/` (condense.py, tighten.py) and its `state.json`. Back up `state.json` before re-running condense.

## Two kinds of finding
Every finding is one of two kinds, and the report keeps them apart:
- **Environment:** checks, lint rules, hooks, AGENTS.md or CLAUDE.md, coding standards, tool cost, information access. These are the retro skill's seven categories.
- **Skill:** a skill that gave wrong or missing guidance, or did not trigger when it should have. These follow the reflect skill's rules: route only to a skill the sessions actually loaded, prefer editing an existing skill over a new one, and move anything a check could enforce to the environment list.

## Locate
- **omp:** `~/.omp/agent/sessions/<slug>/`. Subagent sessions sit in `<session-without-.jsonl>/<Name>.jsonl`, nested further for sub-subagents. Skip the current run's own folder and its descendants. This includes sessions whose first user message is `[agent-retro]`.
- **Claude Code:** `~/.claude/projects/<slug>/`. Orca profiles symlink their `projects` here.
- **Codex:** `~/.codex/sessions/yyyy/mm/dd/rollout-*.jsonl`. The `session_meta` payload has the cwd. Exec runs have only one user message.
- **Cursor:** `~/.cursor/projects/*/agent-transcripts/**`. Records have no timestamps; use the file mtime.
- **pi:** `~/.pi/agent/sessions/`. Its records have the same shape as omp's.
- Subagent session-local artifacts (e.g. `local://x.md` written by a child) live in `<parent-session-dir>/local/`.

## Record shapes
- **omp and pi:** records are typed `session` (cwd), `title`, `model_change`, `session_init` (has `systemPrompt`, a list of strings since 10-12), `ttsr_injection` (`injectedRules`), `compaction`, and `message` (role `user`, `assistant` or `toolResult`). An assistant message contains `text` and `toolCall` items (`id`, `name`, `arguments`). A toolResult carries `toolCallId` and `isError`.
- **Claude:** `type` is `user` or `assistant`; tool calls are `tool_use` items, and errors are `tool_result` items with `is_error`.
- **Codex:** `response_item` records hold `message`, `function_call`, `custom_tool_call` and `*_output` payloads. Errors show as `Process exited with code N` in the output text.
- **Cursor:** each record has `role` and `message.content`, with `tool_use` items.
- **Skill loads** (for skill findings): omp and pi show a `read` of the skill's internal URL or its SKILL.md path; Claude shows a `Skill` tool_use; Codex and Cursor show a read of the SKILL.md file.

## Condense
1. Per session, keep: user messages, assistant text, tool calls with truncated args (mark steering files with ⚑STEER and skill loads with ⚑SKILL), errors, TTSR injections, and a header with cwd, harness, model and counts.
2. Scrub with a regex before anything is written: `sk-`, `ghp_`, `xox*`, JWTs, `AKIA`, `key/token/secret=` query params, emails, and `postgres://` URLs.
3. Tighten each session: collapse plain tool calls into `CALLS: name×n` and steering reads into one line. Keep the assistant reply each user turn reacts to. Subagent and exec sessions keep only the brief, errors and final reply. Drop injected `<skill>` and `<heartbeat>` user messages.
4. Dedupe forks and copied subagent transcripts by a signature of their first user turns, keeping the largest copy.
5. Batch by repo at about 300 KB. Collapse worktree paths (`/worktrees/<hex4>/X`, `orca/workspaces/X`) to the repo name.
6. Small delta (under ~100 KB condensed): read it directly and verify the 7-day window with scripted raw-JSONL probes instead of fanning out scouts.

## Fan out
- Give each `scout` one batch, plus a shared context: the two kinds of finding above, the retro skill's seven categories, the evidence rule (file, ts, quote, steering line or skill marked helped/hurt/no-op/absent), and the known global steering.
- Each scout tags every finding `environment` or `skill`.
- Collect each scout's output with `read agent://<id>:raw`. Parse leniently with `json.JSONDecoder(strict=False).raw_decode` from each `[` or `{"category"`.
- A TTSR rule can replace a scout's final output with "False positive; I'm continuing." Recover the JSON from `history://<id>:raw`.

## Verify with corpus counts, not scout claims
- Grep the condensed text for each error class. Bucket the hits by ISO week and by model to see trends.
- For before/after a config change, parse raw JSONL: pair `toolCall.id` with `toolResult.toolCallId`, split by the config file's mtime, and check the argument shape actually changed (e.g. hashline `input` vs `old_string`).
- Check stale paths with `test -e`, and read the actual steering line. Diff steering/config against `backups/<date>/` to see which proposed fixes were applied.
- **Context-file loading:** grep subagent `session_init` systemPrompt for a known phrase (for example "Approval is scoped") per day. omp loads `~/.claude/CLAUDE.md` only through the Orca profile's `CLAUDE.md`.
- **omp judged rules** (`question:`) warn only after the fact; propose `bash.patterns` or `tools.approval` prompts instead.
- Before accepting a claim that a rule is lint-enforced, lint a throwaway file in the repo.
- Before proposing a hook/check change, measure its real cost from history (below) — don't assume.
- For a skill finding, confirm the ⚑SKILL load in at least two sessions before accepting it.

## Measure past command durations without rerunning
- Each omp bash toolResult ends with `Wall time: N seconds`; also the toolCall→toolResult timestamp gap. Backgrounded commands report in a later `## Completed … ### bg_N` toolResult block containing the same text.
- Identify hook runs by the hook's own echo lines on a `git commit` command (for example a "Running pre-commit checks" banner, or a checks box with `Formatting… ✓` steps). Read one real hook run per repo first to learn its lines.
- Classify outcomes: passed, failed step (e.g. `N/M test files passed … failed`), killed at the agent's 120 s timeout (wall ≈120 s, SIGTERM), backgrounded.
- Time components separately with regexes on the command (`bun run check`, `bun run test`, `bun run build`, `check-types`), keeping only single-component commands; report median/max per month.
- Record each repo's measured hook baseline (passing range, usual failure) in `state.json`, so the next run compares against it instead of re-measuring.

## Recurring patterns worth probing
- `HUSKY=0`/`--no-verify` in bash calls and in parent `task` briefs (briefs copy it from managed skills).
- Subagents editing the parent checkout: non-isolated children run in the parent cwd, so relative paths land there. Probe subagent text for "stray edits", "wrong worktree", "main worktree by mistake".
- Local gates passing in a long-lived worktree (built `dist/`, no memory cap) while CI fails; probe user turns about CI failing after a push.

## Report
- Two sections, environment then skill, each ranked by severity.
- Give each finding: category, scope, status (new/recurring/resolved), at least 2 cited quotes, the exact change, and the expected effect.
- Skill findings use reflect's Accepted / Rejected / Backlog shape. Wait for the user's approval before editing a skill; edit with the writing-for-agents skill. A skill in the anis-dr/skills repo is edited there (vendored ones through `bun run skills patch <name>`), then synced to `~/.agents/skills`.
- Add a "Resolved in window" table: error classes with no hits after a date, plus what fixed them.
- Record reported finding IDs and their probes in `state.json`, so the next run can mark findings recurring or resolved.

## Follow-on restructure pattern
- Back up untracked home config before editing (`~/.omp/agent` and `~/.codex` are not git repos).
- Run sequential passes, one commit each: no-ops, then a disclosure router, then CODING_STANDARDS.md plus a check. Keep a ledger so every moved instruction stays traceable.
