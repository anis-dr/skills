---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## 1. Locate the active transcript

Before fanning out, call the Skill tool with "transcripts" and use it to find this conversation's transcript in the harness you run in. Read only the current workspace's transcripts. Do not glob across other workspaces' folders: that crosses workspace boundaries and reads private chats from unrelated projects. If you cannot find and confirm the transcript, pass a tight digest of the session instead.

## 2. Spawn three reviewers in parallel

Spawn three reviewer subagents in one message, so they run in parallel. Each reviewer reads files and may use MCP tools to look up the tickets, chat threads, and observability traces the transcript cites, but never edits. A read-only subagent may lose MCP access, so when your harness strips MCP tools from read-only subagents, spawn a general-purpose one; the template's no-edit rule still holds.

Each spawn names the model it needs by role. Use the closest model your harness offers; when it offers no choice, use its default model.

| Lens | Model | Prompt template |
|---|---|---|
| Judgment | the strongest model your harness offers | `references/judgment-reviewer.md` |
| Tooling | a fast model | `references/tooling-reviewer.md` |
| Divergent | the strongest model your harness offers | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in their final reply.

## 3. Synthesize

Spawn one synthesizer subagent on the strongest model your harness offers, with the reviewers' access: it spot-verifies citations through MCP tools and never edits. Pass `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. It returns an Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See the **encode-lessons-in-structure** principle (call the Skill tool with "principles" and read its reference).

Move any Accepted item that fixes the repo's environment rather than a skill to Backlog, under the note 'run /retro for these'. That covers checks, lint rules, hooks, AGENTS.md or CLAUDE.md, coding standards, and tool cost.

## 5. Apply

Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit. The user picks the subset and may redirect routings. Skill changes affect every future agent in the org. Do not auto-apply.

File each Backlog item to your team's devex or backlog tracker without waiting, except the items under 'run /retro for these': list those and tell the user to run `/retro`. Only the Accepted list waits for approval.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): the parent does it directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): call the Skill tool with "writing-for-agents" and write the edit by its rules.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): call the Skill tool with "writing-for-agents" and rewrite the description by its rules.
- `new skill: <kebab-name>`: call the Skill tool with "writing-for-agents" and create the skill by its rules. Do not invent the shape ad hoc. In a skills repo with a `CONVENTIONS.md`, such as the one this skill ships from, follow it too: an `ours` entry in `upstream/sources.json` and a line in the router.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done.

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
