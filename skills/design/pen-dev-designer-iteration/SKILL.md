---
name: pen-dev-designer-iteration
description: "Design or refine screens and a design system in a .pen file with the pen.dev CLI designer agent (not hand-drawn frames), grounded in Mobbin evidence and optional generated direction images, verified from per-frame exports instead of the stale app copy. Use when the user wants screens designed or iterated by the pen designer, a first build from a brief, or a multi-screen design round."
---

# pen.dev designer iteration

The pen.dev CLI (`pen`) runs its own designer agent. Your job is the brief, the evidence, verification, and version hygiene. Do not draw by hand when the owner asked for the designer.

When the owner reviews every change or the run must touch only named frames, also call the Skill tool with "pen-dev-gated-iteration" and run each round inside its snapshot and diff gate.

## Setup

- `pen status` must show an active session. Files live in `designs/`, never in a temp folder.
- Write `designs/brief.md`: what to design, the decided direction, the brand lock (wordmark SVG path, hex palette, type family, radii), and the component library the design must map onto (the project's component names). Pass it with `-f`, plus the wordmark SVG and direction images with more `-f` flags.

## Direction first (optional)

Generate 3 structurally different direction images with Higgsfield's `gpt_image_2` model. Call the Skill tool with "higgsfield-generate". If "higgsfield-generate" isn't installed, ask the user to run npx skills add higgsfield-ai/skills --skill higgsfield-generate, then continue.

- One prompt file per direction, in an application register rather than marketing.
- Pass the wordmark PNG as an image reference: `higgsfield generate create gpt_image_2 --prompt ... --image-references <wordmark png> --wait --json`.
- The Pro plan caps concurrent jobs at 4; rerun the rate-limited ones.
- Board the results in one HTML page, `open` it, and let the user pick or combine parts.

## Evidence before structure

Before any structural decision, and before each iteration, pull Mobbin evidence with the Mobbin MCP server's `search_screens` tool: `platform` is required (`web` for web apps), `mode: "deep"`, `limit` 4 to 8, a concrete one-screen query, and the same `task_intent` on every call. Look at the images and name what 3 or more shipped products agree on. Cite the `mobbin_url` for every pattern you adopt: owners reject uncited choices as "invented". Also ground each fix in a named design rule (Refactoring UI, Emil Kowalski's design engineering notes) and put the reason in the prompt; the designer follows rules better than adjectives.

## Running the designer

- First build:
  ```sh
  pen --out designs/app.pen --prompt "..." -f designs/brief.md -f logo.svg -f direction.png --export designs/app.png --export-scale 2
  ```
- Iterations:
  ```sh
  pen --in designs/app.pen --out designs/app.pen --prompt "..." --export designs/app.png --export-scale 1
  ```
- A run takes 5 to 20 minutes (5 to 25 frames; 10 to 20 minutes for 20+ frames). Run it in the background with a long timeout and wait for it to finish.
- One prompt per round: numbered items, exact pixel values, exact frame names, which existing components to reuse, placement of new frames ("row to the right of ..."), and end with "Nothing else changes".
- Every prompt that touches components carries the component rule (see "Traps").
- Commit `designs/` (the `.pen`, exports, backlog) after every good round, so a bad round is one checkout away.

Prompt skeleton:

```
<Round name>. HARD RULE: inside reusable components only Update and Insert, never Delete or Move; set enabled false instead. Verify every instance renders at the end.
1. <component change with exact values>
2. <frame>: <exact content, states, sizes>
...
Place new frames <where>. Nothing else changes.
```

## Traps

- **Deleting inside a reusable component orphans every instance.** Instances override descendants by id, so a `Delete` or `Move` inside a component silently blanks every instance and can destroy the file. Put the HARD RULE line in every prompt. If it happens anyway, `git checkout -- designs/app.pen` and rerun with the rule.
- **The app does not reload a file the CLI rewrote.** The pen.dev app holds its own copy, and `open` on the same path does not reload it. MCP edits made in the app live in memory until the app saves; prefer the CLI for edits that must persist.
- **Nested `$(...)` around a heredoc breaks the shell.** Write long prompt or issue bodies to a temp file and pass `$(cat file)` or `--body-file`.
- **The CLI cannot do everything.** No tabular-nums, no sticky positioning: state them as intent in the frame name.
- **The designer pads.** It invents figures (a derived percentage beside a count, a second review total, counts that disagree, wrong account names). Name the data explicitly in the prompt and check the export for invented numbers as carefully as layout.

## Verifying a round

1. Copy and open a fresh file: `cp designs/app.pen designs/app-rN.pen && open designs/app-rN.pen`. If the app has no document open, `execute` fails with "A file needs to be open".
2. Through the pen.dev (Pencil) MCP `execute` tool, with `filePath` pointing at the copy, list the frames and export each one:
   ```js
   Get(n => n.type==='frame' && Print(n.id, n.name), {depth:0});
   Export([...ids], 'png', dir, {scale: 1.5});
   ```
   Read the PNGs before reporting. The whole-document `--export` strip is too tall to read and the app view is stale, so trust neither. Crop a region with `sips -c H W --cropOffset Y X`.
3. Verify with visitors, not eyes: `Get(frame,(n,c)=>c.problems&&Print(n.name,c.problems))` finds clipping; count icons or text by predicate to prove a change landed.
4. Read the designer's final message. It lists deviations and judgement calls; surface them to the user.

## Consultant pass and backlog

Give a read-only reviewer subagent the PNG paths, the spec summary, and the brand lock. Ask for the three highest-leverage changes, contradictions with the spec, generated-looking elements, one idea from a shipped product, and what to leave alone. Then ask which screens the spec implies that are not designed. Owners forget auth, empty states, dialogs, emails, and the step between two screens.

Record the answer as `designs/BACKLOG.md` with every implied screen, `[v1]` markers, and a check when designed. Work it in rounds by actor.

## Small direct edits

For a one-property change, skip the designer: `execute` with `Update(id,{enabled:false})` on the component child, then verify with a visitor count. The app owns that change until the user saves (Cmd+S); say so before claiming it is committed.

## Craft rules that survived review

- Wordmark 30 px in a 56 px bar, never the tallest thing on screen. Wordmark size is a recurring complaint in both directions, so state bar height and wordmark height together. One wordmark per screen, in the interface's language; never let the model redraw it.
- Admin shell: TopNav 56 px (wordmark 30 px, search 480 px centred, language and account on the right), sidebar 200 px nav-only, 28 px rows, count badges, sentence-case group labels with chevron, neutral active fill, Settings pinned at the foot, footer hairlines aligned at 64 px.
- One shell (TopNav, SideNav) and one reusable Detail Panel (title, actions row, sectioned content) for every record; tables shrink to fit it. A new floating drawer beside an existing panel pattern reads as slop, and owners notice.
- Name the components to update so all screens change together.
- Flag alignment invariants explicitly (footer hairlines on one line, equal bar heights).
- Category row: a symmetric fixed 6-column grid of tinted discs with one object photo each, label below, no arrows, last cell "All categories". Prefer it to icon tile rows that wrap unevenly.
- Language switcher: flag plus the language name in its own script.
- Status is always a word plus a dot; one meaning per colour.
- Photos are the last generated tell: a single object on a plain background, no model portraits, crop to the product. Name each photo to replace.
