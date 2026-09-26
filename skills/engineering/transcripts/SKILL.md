---
name: transcripts
description: Where omp, Claude Code, Codex, Cursor and pi store session transcripts, and how to find the current session's own transcript. Use when a step reads past chats or this run's transcript.
---

# Transcripts

Each harness writes one JSONL file per session, one message or event per line. Use the row for the harness you run in. When unsure which that is, check which of these folders exist.

| Harness | Sessions folder | Files |
|---|---|---|
| Claude Code | `~/.claude/projects/<slug>/` | `<session-id>.jsonl` |
| Codex | `~/.codex/sessions/<yyyy>/<mm>/<dd>/` | `rollout-<time>-<session-id>.jsonl` |
| Cursor | `~/.cursor/projects/<slug>/agent-transcripts/` | `<session-id>/<session-id>.jsonl` |
| omp | `~/.omp/agent/sessions/<slug>/` | `<time>_<session-id>.jsonl` |
| pi | `~/.pi/agent/sessions/<slug>/` | `<time>_<session-id>.jsonl` |

`<slug>` encodes the workspace path with `/` turned into `-`, and each harness adds its own prefix and suffix: `/Users/you/app` becomes `-Users-you-app` in Claude Code (which also turns `.` into `-`), `Users-you-app` in Cursor, and `--Users-you-app--` in pi. omp drops the home folder, so `~/app` becomes `-app`, and wraps paths outside it like pi (`/tmp/app` becomes `--tmp-app--`). List the sessions folder and pick the entry that encodes the current workspace. Codex keeps no per-workspace folder: the first line of each file is a `session_meta` event whose `cwd` names the workspace.

## The current session

When the harness names this session's transcript path, use it. Otherwise take the most recently modified file for the current workspace, and confirm it by finding the latest user message of this conversation in it.

## Privacy

Read only the current workspace's transcripts. Other workspaces' folders hold unrelated, private chats; never glob across them.
