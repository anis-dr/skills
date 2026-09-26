# Designer iteration

The `pen` CLI runs its own designer agent. Your job is the brief, the evidence, verification, and version hygiene. Do not draw by hand when the owner asked for the designer.

When the owner reviews every change or the run must touch only named frames, run each round inside the snapshot and diff gate in [gated-runs.md](gated-runs.md).

## Setup

Write `designs/brief.md`: what to design, the decided direction, the brand lock (wordmark SVG path, hex palette, type family, radii), and the component library the design must map onto (the project's component names). Pass it with `-f`, plus the wordmark SVG and direction images with more `-f` flags.

## Direction first (optional)

Generate 3 structurally different direction images with Higgsfield's `gpt_image_2` model. Call the Skill tool with "higgsfield-generate". If "higgsfield-generate" isn't installed, ask the user to run npx skills add higgsfield-ai/skills --skill higgsfield-generate, then continue.

- One prompt file per direction, in an application register rather than marketing.
- Pass the wordmark PNG as an image reference: `higgsfield generate create gpt_image_2 --prompt ... --image-references <wordmark png> --wait --json`.
- The Pro plan caps concurrent jobs at 4; rerun the rate-limited ones.
- Board the results in one HTML page, `open` it, and let the user pick or combine parts.

## Evidence before structure

When the owner should choose the references, call the Skill tool with "design-references" first and build from their picks. Before any structural decision, and before each iteration, pull Mobbin evidence with the Mobbin MCP server's `search_screens` tool: `platform` is required (`web` for web apps), `mode: "deep"`, `limit` 4 to 8, a concrete one-screen query, and the same `task_intent` on every call. Look at the images and name what 3 or more shipped products agree on. Cite the `mobbin_url` for every pattern you adopt: owners reject uncited choices as "invented".

## Running the designer

Write each prompt by the rules in the SKILL.md section "Prompting the designer".

- First build:
  ```sh
  pen --out designs/app.pen --prompt "..." -f designs/brief.md -f logo.svg -f direction.png --export designs/app.png --export-scale 2
  ```
- Iterations:
  ```sh
  pen --in designs/app.pen --out designs/app.pen --prompt "..." --export designs/app.png --export-scale 1
  ```
- Commit `designs/` (the `.pen`, exports, backlog) after every good round, so a bad round is one checkout away.
- Nested `$(...)` around a heredoc breaks the shell. Write long prompt or issue bodies to a temp file and pass `$(cat file)` or `--body-file`.

Prompt skeleton:

```
<Round name>. HARD RULE: inside reusable components only Update and Insert, never Delete or Move; set enabled false instead. Verify every instance renders at the end.
1. <component change with exact values>
2. <frame>: <exact content, states, sizes>
...
Place new frames <where>. Nothing else changes.
```

Verify each round by the SKILL.md section "Rendering and reading frames".

## Consultant pass and backlog

Give a read-only reviewer subagent the PNG paths, the spec summary, and the brand lock. Ask for the three highest-leverage changes, contradictions with the spec, generated-looking elements, one idea from a shipped product, and what to leave alone. Then ask which screens the spec implies that are not designed. Owners forget auth, empty states, dialogs, emails, and the step between two screens.

Record the answer as `designs/BACKLOG.md` with every implied screen, `[v1]` markers, and a check when designed. Work it in rounds by actor.

## Small direct edits

For a one-property change, skip the designer: `execute` with `Update(id,{enabled:false})` on the component child, then verify with a visitor count. The app owns that change until the user saves (see "Two writers, one file" in SKILL.md).

## Craft rules that survived review

- Wordmark 30 px in a 56 px bar, never the tallest thing on screen. Wordmark size is a recurring complaint in both directions, so state bar height and wordmark height together. One wordmark per screen, in the interface's language; never let the model redraw it.
- Admin shell: TopNav 56 px (wordmark 30 px, search 480 px centred, language and account on the right), sidebar 200 px nav-only, 28 px rows, count badges, sentence-case group labels with chevron, neutral active fill, Settings pinned at the foot, footer hairlines aligned at 64 px.
- One shell (TopNav, SideNav) and one reusable Detail Panel (title, actions row, sectioned content) for every record; tables shrink to fit it. A new floating drawer beside an existing panel pattern reads as slop, and owners notice.
- Category row: a symmetric fixed 6-column grid of tinted discs with one object photo each, label below, no arrows, last cell "All categories". Prefer it to icon tile rows that wrap unevenly.
- Language switcher: flag plus the language name in its own script.
- Status is always a word plus a dot; one meaning per colour.
- Photos are the last generated tell: a single object on a plain background, no model portraits, crop to the product. Name each photo to replace.
