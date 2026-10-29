---
name: technical-html
description: "Write a technical document in Markdown, or Markdown with Svelte components, and build it into one self-contained HTML page in the house style: status report, design doc, how-to or reference, with stat cards, callouts, status pills, step cards, a table of contents, D2 diagrams laid out with TALA, highlighted code and diffs, and light and dark modes. Use when the user wants a document or report as HTML, a shareable page, a nicer view of a Markdown file, or 'a document like the last one'. For a PDF use technical-pdf instead."
---

# Technical HTML

You write Markdown (`.md`), or Markdown with Svelte components (`.svx`). `scripts/build.ts` prerenders it with SvelteKit into one `.html` file: no network, house CSS inlined, diagrams rendered with TALA and inlined as SVG, code and diffs highlighted at build time. The page reads with JavaScript off. It follows the reader's light or dark setting, and a small button at the top right switches it. In a `.md` page that toggle is the only JavaScript; a page with a multi-file diff, a `::: files` block, a diagram key or read steps, or Svelte components also hydrates those. The look lives in [assets/style.css](assets/style.css). Do not restyle it per document.

## Files

- [assets/examples/](assets/examples/): one real document per type, as `.md` source, a `.bib` of its sources when it cites any, and built `.html`. Copy the closest one; do not start from a blank page.
  - [status.md](assets/examples/status.md): status report, roadmap or any living document. Stat cards, summary with a warning, status table with pills, roadmap steps, open decisions, risks.
  - [design.md](assets/examples/design.md): design doc or explanation. Context, one diagram, trade-offs, with a table of contents.
  - [how-to.md](assets/examples/how-to.md): how-to or runbook. Prerequisites, numbered step cards with commands, troubleshooting table.
  - [reference.md](assets/examples/reference.md): reference. Tables and code. It is also the full syntax reference for this skill: read it before you write.
  - [interactive.svx](assets/examples/interactive.svx): a `.svx` document. State in its one `<script>`, a scoped `<style>`, a component imported from [Backoff.svelte](assets/examples/Backoff.svelte) beside it, and a multi-file diff with a unified and split switch. Copy it only when the document needs something a reader changes.
- [assets/house.d2](assets/house.d2): D2 variables and classes. The build adds it to every diagram, so diagrams never declare them; a diagram's only `vars` is its key, `d2-legend`.
- [scripts/build.ts](scripts/build.ts): the builder. Needs Bun and the `d2` CLI with TALA. The first run installs the SvelteKit app in [app/](app/).
- [app/](app/): the SvelteKit app that prerenders the one page. The Markdown dialect lives in `app/plugins/`, one remark plugin per concern.

## Syntax in one screen

Full details and every build failure are in [reference.md](assets/examples/reference.md).

- Frontmatter: `type` (`status`, `design`, `how-to`, `reference`), `eyebrow`, `lede`, `meta`, `stats` (2 to 4 cards, `tone`: `good`, `gap`, `wait`, `none`), `toc` (`auto`, `true`, `false`), `bibliography` (a `.bib` path, when it is not `<doc>.bib`).
- The first `#` heading is the page title.
- ` ```d2 #fig:<name> ` fenced block: a diagram, numbered Figure 1, 2, ... in document order. The paragraph right after it, entirely in italics, is its caption: the figure's name, at most 10 words and no full stop. Refer to it in the prose with `[@fig:<name>]`, which renders as a link reading "Figure N". Never type a figure number. The build fails on a diagram without a label or caption, a sentence as a caption, a duplicate label, an unknown `[@fig:...]`, a figure nothing refers to, and "Figure 2" typed in prose.
- Key: inside the `d2` block, d2's own `vars: { d2-legend: { ... } }` with one entry per symbol to explain, each named in 1 to 4 words (`s: "Service" {class: part}`, `s -> t: "Reply" {class: back}`). It is the only `vars` a block may declare. The reader opens it from a Key button, and pointing at an entry lights every part drawn the same way. An entry that matches nothing in the diagram, or a name that is a sentence, fails the build.
- ` ```read #fig:<name> ` fenced block, anywhere in the document: a walkthrough of that figure. Each line is one step, `api, api -> db, db: One short sentence.`, naming the d2 nodes and edges it lights. An id not in the figure, a line without `: `, a step longer than one sentence of 20 words, an unknown figure or a second `read` fence for one figure fails the build.
- `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`: callouts.
- Inline code `status:built`, `status:gap`, `status:partly`, `status:none`, `status:done`, `status:here`, optionally followed by a label: pills.
- `::: steps` around an ordered list: numbered step cards. Bold first line is the step title. A `status:done` pill marks a finished step, one `status:here` pill marks the current one.
- A fenced block in a language Shiki knows (`ts`, `bash`, `yaml`, `json`, ...): highlighted at build time. Other languages stay plain.
- ` ```pseudo ` for logic and algorithms: pseudocode with its keywords, calls, strings and comments highlighted. ` ```text ` for file trees and call trees: no highlighting.
- ` ```diff ` fenced block: a highlighted diff. Without git file headers it names a language or a path (` ```diff ts `, ` ```diff pseudo `, ` ```diff text `, ` ```diff apps/x.ts `), or the build fails. `split` after it shows two columns. A pasted `git diff` of two or more files gets a unified and split switch.
- In a diff, a changed line is a `-` line and a `+` line, each one whole. Pierre parses every diff line as real code, so never wrap a long `+` line onto a second `+` line by hand.
- `::: files` around two or more code fences, each with a file path after its language (` ```ts src/agent.ts `): several files as one block, a file tree of the paths beside the selected file's code, the first file open. Clicking a file in the tree shows it. Like an editor, the block keeps one height, its longest file's, up to `min(640px, 75vh)`; past that the code scrolls inside it. Without JavaScript every file shows, stacked under its path. A fence without a path, a path used twice, anything but code fences inside, or fewer than two files fails the build.
- `::: card`: a bordered card. Divs do not nest.
- Sources: write them in `<doc>.bib` beside the document (or point frontmatter `bibliography:` at one), and cite each where its claim is made with `[@key]`, or `[@a; @b]` for several. The build numbers them in first-citation order and adds a Sources section at the end. An unknown key, an entry nothing cites, or citations without a `.bib` file fail the build. Use `@online` for a web page and `@software` for code:

  ```bibtex
  @online{step,
    author = {{Trigger.dev}},
    title = {Step class},
    url = {https://example.com/docs/step},
    urldate = {2026-10-21},
    note = {The retry options a step accepts.},
  }

  @software{sync,
    title = {Sync pipeline},
    organization = {anis-dr/skills},
    path = {src/sync.ts},
    version = {af49a3a},
    urldate = {2026-10-16},
    note = {The stages, in order.},
  }
  ```

- `::: footer`: a colophon only, muted and smaller: how the page was made, or a caveat. Sources never go here.
- `.svx` only: one `<script>`, Svelte markup, components imported by a path relative to the document, one scoped `<style>` with the house variables. `{` in prose starts an expression, so write `&#123;`. In `.md`, braces are text.

## Skills to load

Call the Skill tool once for each, at the step named. Skip one only when the document has nothing for it.

| Skill | When | Why |
|---|---|---|
| "principles" | Before writing. Read `references/prove-it-works.md` and `references/explain-the-number.md`. | Every claim is grounded. Every number says what it counts. |
| "scratchpad" | Before creating files | Decides the output folder. |
| "technical-writing" | Step 1 and step 3 | Picks the document mode (Diátaxis) and owns the sentence rules. It calls the prose passes itself. |
| "show-me" | Step 2 | Picks the smallest view per point: table, list, code sketch, call tree, diff or diagram. Here, diagrams are D2, not Mermaid, and nothing is opened on the user's screen. |
| "diagram-rules" | Before any diagram | Whether to draw, which kind, what goes in a node. |
| "d2" | Before writing a `d2` block | Syntax. If "d2" isn't installed, ask the user to run `npx skills add benjaminwestern/google-engineer-skills --skill d2`, then continue. |
| "verify-this" | When a claim about running behaviour is not yet checked | Turns it into a fresh check or marks it unverified. |
| "craft-design-engineering", "apple-design", "emil-design-eng" | Only when you change `assets/style.css` | The look was designed with these. If "craft-design-engineering" isn't installed, ask the user to run `npx skills add gustavo-fior/craft --skill craft-design-engineering`, then continue. |

## Workflow

1. **Pick the type.** Use the technical-writing modes: `status` for where work stands (status reports, roadmaps, living documents), `design` for why and how something works, `how-to` for steps to a goal, `reference` for lookup. One document, one type. If the user brings an existing Markdown file, keep its content and fit it to the type.
2. **Ground and plan.** Collect evidence first: code on the main branch, tickets, notes, measurements. Write each number with what it counts and when, and mark inference. Record each source as you read it: file, commit, URL, date and what it supports. Then plan visuals with show-me: one question per diagram, at most about nine nodes, comparisons as tables, sequences as step cards. Roadmaps, status and decisions are tables and steps, never diagrams.
3. **Write.** Copy the closest example to `.scratchpad/<slug>/<slug>.md` (folder per the scratchpad skill; if the repo has no gitignored scratchpad, ask where). Replace all of its content; keep the structure that fits. Write the prose with technical-writing. Write the sources in `.scratchpad/<slug>/<slug>.bib`, one entry per source, and cite each one with `[@key]` in the sentence that makes its claim.
4. **Build.** `bun <skill-dir>/scripts/build.ts .scratchpad/<slug>/<slug>.md` writes `<slug>.html` beside it and leaves nothing else. It fails with `build: <file>:<line>: <message>` on bad syntax, a D2 error, a diagram without a label or short caption, a figure reference that is unknown or missing, a figure number typed by hand, a key entry or read step that names nothing in its diagram, a diff without a language, a `::: files` fence without a path, a citation without a `.bib` entry, a `.bib` entry nothing cites, invalid Svelte or any external resource. Fix the source and rebuild. Write `.md` unless the reader must change something on the page; then write `.svx`.
5. **Verify.** Run the checklist below. Fix, rebuild, look again.
6. **Deliver.** Tell the user the path to the `.html`. The `.md` source and its `.bib` stay beside it.

**Living documents.** A status page or roadmap is updated, not rewritten. When the work moves, edit the same `.md`: re-ground every number and claim and update the `.bib` entries behind them (commit, `urldate`), move `status:here` to the new current step and mark finished steps `status:done`, retire risks and decisions that are settled, change the meta line to "Updated <date>" with the commit or source it was counted at, then rebuild. The lede says it is a living document.

## Diagram rules

- D2 with TALA. No Mermaid in these documents. Diagrams are landscape: `house.d2` sets `direction: right`. Override it only when the content is a true top-down hierarchy.
- Plain string labels with `\n` for line breaks. Never `|md ... |` labels: the build rejects them.
- Use the house classes: `person`, `part`, `store`, `provider`, `replace`, `group`, and `class: back` for dashed replies and optional paths. Red dashed (`replace`) marks the thing being replaced. Add a class only when a new role repeats.
- The caption names the figure, like a title: *From working tree to installed agent*. If the diagram needs help to read, say so in the prose around it, not in the caption.
- The prose refers to every figure by its reference, `[@fig:<name>]`, in the sentence that needs it: "[@fig:sync] shows the five stages."
- Key: optional. Add it when the reader needs a symbol explained: what a box style or an arrow style means. List only those symbols, each named in 1 to 4 words ("Data we keep", "Refused"), not every class the diagram uses. Never name colours in the prose: name a box by its label (the box "Server already knows"), and leave what a style means to the key.
- Read steps: optional. Add them when the diagram tells a story in order. One short sentence per step, in the order of the story, each naming the nodes and edges it is about.
- Diagrams sit at natural width. Below 720 px they keep at least 600 px and scroll sideways like tables, so a phone reader scrolls a wide one. If a diagram needs more than one sideways scroll to read, split it.

## Verification checklist

Render headless and read the screenshots. Never `open` the file or a screenshot on the user's screen.

```bash
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"   # or chromium on Linux
tmp="$(mktemp -d)"
page="file://$PWD/.scratchpad/<slug>/<slug>.html"
"$chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1280,6000 --screenshot="$tmp/desktop.png" "$page"
"$chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=520,9000 --screenshot="$tmp/narrow.png" "$page"
"$chrome" --headless=new --disable-gpu --hide-scrollbars --blink-settings=preferredColorScheme=0 --window-size=1280,6000 --screenshot="$tmp/dark.png" "$page"
"$chrome" --headless=new --disable-gpu --hide-scrollbars --blink-settings=scriptEnabled=false --window-size=1280,6000 --screenshot="$tmp/nojs.png" "$page"   # .svx, multi-file diffs and ::: files
for shot in desktop narrow dark nojs; do w=1280; [ $shot = narrow ] && w=520; magick "$tmp/$shot.png" -trim +repage -crop ${w}x1500 +repage "$tmp/$shot-%d.png"; done
```

A tall screenshot is shrunk when you read it, so read every slice, then `rm -rf "$tmp"`. Check:

- Every diagram is legible at both widths and in dark mode, with no clipped label.
- With JavaScript off, every interactive part shows a sensible first state. With it on, each one reacts.
- Nothing overflows the page at 520 px. Tables scroll inside their frame.
- Every pill matches its row's evidence. "Built" means proven by the stated basis, and the basis is on the page.
- Every number has its unit and scope. Inferences are marked.
- Every claim that rests on a source cites it, and each Sources entry says what it supports.
- The prose passes ran. No em dashes.
