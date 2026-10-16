---
name: technical-html
description: "Write a technical document in Markdown and build it into one self-contained HTML page in the house style: status report, design doc, how-to or reference, with stat cards, callouts, status pills, step cards, a table of contents and D2 diagrams laid out with TALA. Use when the user wants a document or report as HTML, a shareable page, a nicer view of a Markdown file, or 'a document like the last one'. For a PDF use technical-pdf instead."
---

# Technical HTML

You write Markdown. `scripts/build.ts` turns it into one `.html` file: no network, no JavaScript, house CSS inlined, diagrams rendered with TALA and inlined as SVG. The look lives in [assets/style.css](assets/style.css). Do not restyle it per document.

## Files

- [assets/examples/](assets/examples/): one real document per type, as `.md` source and built `.html`. Copy the closest one; do not start from a blank page.
  - [status.md](assets/examples/status.md): status report, roadmap or any living document. Stat cards, summary with a warning, status table with pills, roadmap steps, open decisions, risks.
  - [design.md](assets/examples/design.md): design doc or explanation. Context, one diagram, trade-offs, with a table of contents.
  - [how-to.md](assets/examples/how-to.md): how-to or runbook. Prerequisites, numbered step cards with commands, troubleshooting table.
  - [reference.md](assets/examples/reference.md): reference. Tables and code. It is also the full syntax reference for this skill: read it before you write.
- [assets/house.d2](assets/house.d2): D2 variables and classes. The build adds it to every diagram, so diagrams never declare them.
- [scripts/build.ts](scripts/build.ts): the builder. Bun only, plus the `d2` CLI with TALA.

## Syntax in one screen

Full details and every build failure are in [reference.md](assets/examples/reference.md).

- Frontmatter: `type` (`status`, `design`, `how-to`, `reference`), `eyebrow`, `lede`, `meta`, `stats` (2 to 4 cards, `tone`: `good`, `gap`, `wait`, `none`), `toc` (`auto`, `true`, `false`).
- The first `#` heading is the page title.
- ` ```d2 ` fenced block: a diagram. The paragraph right after it, entirely in italics, is its caption. A diagram without a caption fails the build.
- `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`: callouts.
- Inline code `status:built`, `status:gap`, `status:partly`, `status:none`, `status:done`, `status:here`, optionally followed by a label: pills.
- `::: steps` around an ordered list: numbered step cards. Bold first line is the step title. A `status:done` pill marks a finished step, one `status:here` pill marks the current one.
- `::: card` and `::: footer`: a bordered card, and the sources block at the end. Divs do not nest.

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
2. **Ground and plan.** Collect evidence first: code on the main branch, tickets, notes, measurements. Write each number with what it counts and when, and mark inference. Then plan visuals with show-me: one question per diagram, at most about nine nodes, comparisons as tables, sequences as step cards. Roadmaps, status and decisions are tables and steps, never diagrams.
3. **Write.** Copy the closest example to `.scratchpad/<slug>/<slug>.md` (folder per the scratchpad skill; if the repo has no gitignored scratchpad, ask where). Replace all of its content; keep the structure that fits. Write the prose with technical-writing.
4. **Build.** `bun <skill-dir>/scripts/build.ts .scratchpad/<slug>/<slug>.md` writes `<slug>.html` beside it. It fails with `build: <message>` and a line number on bad syntax, a D2 error, an uncaptioned diagram or any external resource. Fix the source and rebuild.
5. **Verify.** Run the checklist below. Fix, rebuild, look again.
6. **Deliver.** Tell the user the path to the `.html`. The `.md` source stays beside it.

**Living documents.** A status page or roadmap is updated, not rewritten. When the work moves, edit the same `.md`: re-ground every number and claim, move `status:here` to the new current step and mark finished steps `status:done`, retire risks and decisions that are settled, change the meta line to "Updated <date>" with the commit or source it was counted at, then rebuild. The lede says it is a living document.

## Diagram rules

- D2 with TALA. No Mermaid in these documents. Diagrams are landscape: `house.d2` sets `direction: right`. Override it only when the content is a true top-down hierarchy.
- Plain string labels with `\n` for line breaks. Never `|md ... |` labels: the build rejects them.
- Use the house classes: `person`, `part`, `store`, `provider`, `replace`, `group`, and `class: back` for dashed replies and optional paths. Red dashed (`replace`) marks the thing being replaced. Add a class only when a new role repeats.
- The caption says how to read the arrows and names every dashed or red path.
- Diagrams sit at natural width. Below 720 px they keep at least 600 px and scroll sideways like tables, so a phone reader scrolls a wide one. If a diagram needs more than one sideways scroll to read, split it.

## Verification checklist

Render headless and read the screenshots. Never `open` the file or a screenshot on the user's screen.

```bash
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"   # or chromium on Linux
tmp="$(mktemp -d)"
page="file://$PWD/.scratchpad/<slug>/<slug>.html"
"$chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1280,6000 --screenshot="$tmp/desktop.png" "$page"
"$chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=520,9000 --screenshot="$tmp/narrow.png" "$page"
magick "$tmp/desktop.png" -trim +repage -crop 1280x1500 +repage "$tmp/desktop-%d.png"
magick "$tmp/narrow.png" -trim +repage -crop 520x1500 +repage "$tmp/narrow-%d.png"
```

A tall screenshot is shrunk when you read it, so read every slice, then `rm -rf "$tmp"`. Check:

- Every diagram is legible at both widths, with no clipped label and no unexplained dashed or red edge.
- Nothing overflows the page at 520 px. Tables scroll inside their frame.
- Every pill matches its row's evidence. "Built" means proven by the stated basis, and the basis is on the page.
- Every number has its unit and scope. Inferences are marked.
- The prose passes ran. No em dashes.
