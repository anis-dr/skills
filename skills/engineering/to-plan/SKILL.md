---
name: to-plan
description: "Write an executor plan: file-anchored tasks with call trees, flow diagrams and test-first steps that another agent or a later session follows. Use when asked for an implementation, refactor or migration plan, or to turn a settled spec or ticket into step-by-step work. Not for specs, tickets or decision maps."
---

# To plan

Write plans as executable understanding, not executable code. A good plan shows flows, boundaries, composition, and call trees so the executor extends the existing system instead of copying new code into it.

## Where this fits

This plan is the last step before code. The artifacts before it have their own owners and formats, which this skill does not impose on: a requirements spec is `/to-spec`, build tickets are `/to-tickets`, and open decisions are a `/wayfinder` map. Those deliberately leave out file paths; this plan adds them. When the requirements or the split into tickets are not settled yet, tell the user to settle them with those commands first, then plan the work of one spec or one ticket here.

## Display belongs to `show-me`

Call the Skill tool with "show-me" before drawing anything. If "show-me" isn't installed, ask the user to run npx skills add humanlayer/skills --skill show-me, then continue. It owns every visual decision: picking the smallest view, call trees, component trees, file trees, pseudocode, Mermaid, and diffs for changes. Use its forms freely. This skill adds no labels, sigils, or drawing conventions of its own.

## Plan skeleton

Every plan carries, in order:

1. A header: goal, scope, non-goals, and the branch or worktree the executor starts from.
2. Numbered tasks. Each task lists its files on a `**Files:**` line, gives 1-2 lines of intent, and shows the diagrams below.
3. Test-first steps inside each task, per the `tdd` loop: each step names the failing behavior assertion first (red), then the change that makes it pass (green). A call tree names the seam under test.
4. Exact run commands with expected output at each verification point.
5. A commit point per task.
6. An execution handoff: what the executor runs first and what done looks like.

## Core rule

Plans must not contain copy-pastable implementation or test code. Wherever a conventional plan would paste a code block, substitute a `show-me` view plus behavior assertions; the executor writes the code and tests from these. Sketch logic only as labeled pseudocode. Describe tests as behavior assertions plus a call tree of the seam under test.

**Scan-first rule:** a reader must understand each task by reading only its diagrams, never the prose. Prose is caption-only: **max 1-2 lines per step**, for intent or a non-obvious constraint. Never restate a diagram in prose. If a step needs more than two lines of prose, the diagram is wrong. Fix the diagram.

## Companion skills

- Every plan, before the first task: call the Skill tool with "principles" and read every principle that matches the work. Cite the ones that shaped a task in that task's caption.
- High-stakes architecture, service boundaries, API or data model design, scaling, reliability, or unclear trade-offs: call the Skill tool with "system-design" first to shape the architecture, then use this skill to turn that design into an executor-ready plan. If "system-design" isn't installed, ask the user to run npx skills add wondelai/skills --skill system-design, then continue.
- A task moves module boundaries or shapes a new interface rather than extending an obvious seam: call the Skill tool with "codebase-design" to place the seam first.
- The plan introduces symbols or settles terminology: before drawing anything, call the Skill tool with "domain-modeling" to fix canonical terms and split overloaded concepts, then call the Skill tool with "naming-analyzer" to check proposed names against codebase context and conventions. If "naming-analyzer" isn't installed, ask the user to run npx skills add softaworks/agent-toolkit --skill naming-analyzer, then continue.
- All plan prose: call the Skill tool with "unslop". Captions, headers, and assertions follow its rules.
- Every plan: call the Skill tool with "tdd". Plans follow its loop: vertical slices, red before green, one seam per cycle, seams confirmed with the user before tests are planned against them.
- Effect-related code: call the Skill tool with "effect-index" to select the relevant Effect skills and patterns before writing the plan, and shape services, layers, errors, and streams with those concepts where they apply. If "effect-index" isn't installed, ask the user to run npx skills add mepuka/effect-ontology --skill effect-index, then continue.

## Rules

- Start with system flow, boundaries, and composition, before any code edit.
- Every node in a tree is a real symbol (`Service.method`, `<Component>`, a file path), never a prose phrase like "the metadata object literal". If a signature is unconfirmed, say so inline instead of inventing one.
- Show a change to an existing structure as a diff on the tree. Write the full tree only when most of it is new.
- Each task adds an anchors list: files to inspect, abstractions to extend, seams to introduce. Mark proposed seams as new.
- Use domain terms precisely. If one word covers two concepts, split them and name both canonically.

## Common mistakes

| Mistake                                   | Better                                                    |
| ----------------------------------------- | --------------------------------------------------------- |
| Pasting implementation or test code       | `show-me` view + behavior assertions; executor writes it  |
| Paragraph of prose per step               | 1-2 line caption + the diagram                            |
| Two full trees for a small change         | Diff on the tree                                          |
| Tests described vaguely                   | Behavior assertions + a call tree naming the seam         |
| Dropping the skeleton                     | Keep the header, tasks, commands, and commits             |
