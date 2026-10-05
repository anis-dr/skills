---
name: wayfinder-reversal
description: "Use on a GitHub-tracked wayfinder map when a decision reverses an earlier closed ticket, when the owner rejects a resolution after close, or when the last driveable ticket closes. Records the reversal, runs a contradiction check across all resolutions, and prepares the map for /to-spec."
---

# Wayfinder reversal

This builds on a wayfinder map. If there is no map yet, tell the user to run `/wayfinder` to chart one.

Use when a grilling answer contradicts a closed ticket, when the owner rejects a resolution after close, or when the map's last driveable ticket closes and `/to-spec` is next. Tracker conventions live in `docs/agents/issue-tracker.md`. The map is one issue (`$MAP` below, often #1) with Notes, Decisions so far, Not yet specified, and Out of scope sections.

## Reversal inside a ticket (owner rejects a closed resolution)

1. `gh issue reopen <n> --comment "Reopened: <what changed>. Re-grilling the delta."`
2. Call the Skill tool with "grilling" and grill only the delta. List what survives from the first resolution up front.
3. Post a new comment headed `## Resolution (second, supersedes the one above)`. Leave the old one unedited.
4. Rewrite the ticket's line in the map body in place, rather than appending a second one.
5. Update glossary terms in place (call the Skill tool with "domain-modeling" for the `GLOSSARY.md` format), then commit and push `GLOSSARY.md`.

## Reversal across tickets (new ticket contradicts old ones)

1. Name the conflict before asking: quote the earlier ticket's answer and the map line, then ask a settle-for-good question with the earlier decision as one option.
2. On close, post one `Correction from #<new> (<date>): ...` comment on every earlier ticket affected, saying exactly what changes and that everything else stands.
3. Patch each affected map line with `(reversed on #<new>)` or `(revised on #<new>)` rather than rewriting history. Patch the charting Notes bullet too if it was a charted fact.
4. Glossary: rewrite the affected terms, and move the old term to `_Avoid_` if it was renamed.
5. If the reversal creates a legal or licensing question, open a `wayfinder:research` ticket and say its answer can reopen the decision.

Map edits: read the body with `gh issue view $MAP --json body --jq .body`, change it in a script (for example Python with `subprocess`; assert the anchor line exists and the ticket link is absent before inserting), and write it back with `gh issue edit $MAP --body`.

## Check the map before /to-spec

Dump every closed ticket's comments in order (`gh issue view <n> --json title,comments`) and read each in its final state (the latest comment wins). List:

- contradictions between tickets;
- decisions nobody made that a spec would have to invent;
- stale text left behind by corrections;
- promised follow-up tickets never created.

Fix wording-only items with correction comments. Put real gaps to the owner as lettered questions, each with a recommendation. Only when the list is empty, tell the user to run `/to-spec`.

## Notes for the /to-spec run on this kind of map

Carry these into the `/to-spec` run:

- Read the codebase seams first (test app, database tests, i18n and router tests). Propose new seams only at external parties and time (provider, gateway, mailer, clock), and get a yes before writing.
- Create the `ready-for-agent` label if the repo lacks it (`gh label create ready-for-agent --color 0E8A16`).
- Write the spec to `.scratchpad/<map>/spec.md` so the owner can read it first, then `gh issue create --label ready-for-agent --body-file .scratchpad/<map>/spec.md`, then comment on the map: "Destination reached. Spec published as #<n>."
- Say in the spec that the latest comment on a ticket wins, and that whoever picks it up should delete any superseded plan file.
