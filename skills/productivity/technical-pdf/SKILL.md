---
name: technical-pdf
description: "Write and visually verify a technical PDF (report, spec, design review, runbook, proposal, investigation write-up) in Typst using the established serif Metropole report style, with evidence-backed diagrams, tables and recommendations. Use when the user wants a technical document delivered as a PDF, or a client quote, estimate or commercial proposal whose prices compute from a day rate and a module list."
---


# Technical PDFs

Create a clear technical PDF in Typst (a report, spec, design review, runbook or proposal; this skill calls all of them a report) that helps its audience understand evidence, make a decision, or take the next action. Synthesize the work instead of copying a conversation chronologically.

## Prose

Before rendering, call the Skill tool with "humanizer" on every paragraph of body text, keeping the report structure. A report is read by people; `unslop` is for text agents read.

Runbook steps, procedures, warnings and cautions are the exception: call the Skill tool with "simplified-technical-english" and write them in STE, then leave them out of the humanizer pass.

## Diagrams

Before any diagram, call the Skill tool with "diagram-rules" and apply it: whether to draw, which kind, what goes in a node, how much fits.

## Client quotes

A quote, estimate or commercial proposal is a report whose prices compute themselves: read [the client-quote branch](references/client-quote.md) for its data model, pricing tables and content checklist, then follow the workflow below.

## Visual baseline

Before authoring, read [the report style reference](references/report-style.md) and inspect [the neutral example source](references/report-example.typ) with its [compiled PDF](references/report-example.pdf). That reference owns the typography, cover, contents page, spacing, tables and diagram palette. Apply it unless the user explicitly requests another style. Do not substitute an all-sans layout or shrink the report to fit a page budget.

Keep words intact across lines with the compound-word `box` rule from the style reference. Do not turn hyphenation off, and do not add any `set par`, `set text` or heading wrapper after the template line: the template owns leading, spacing and sizes, and those rules replace them.

## Required sibling skills

Load these before starting. Call the Skill tool once for each of "show-me", "documentation-writer", "humanizer", "typst", "typst-author", "pdf" and "naming-analyzer":

- "show-me" to choose the smallest visual that makes each point clear.
- "documentation-writer" to identify the audience, goal, document type, and scope.
- "humanizer" to write prose that reads like the author, without AI tells.
- "typst" and "typst-author" for current Typst syntax, CLI use, formatting, and compilation.
- "pdf" for rendered-output inspection.
- "naming-analyzer" before finalizing report terminology and visual labels.

If one of these isn't installed, ask the user to run the matching command, then continue:

- `npx skills add github/awesome-copilot --skill documentation-writer`
- `npx skills add lucifer1004/claude-skill-typst --skill typst`
- `npx skills add apcamargo/typst-skills --skill typst-author`
- `npx skills add anthropics/skills --skill pdf`
- `npx skills add softaworks/agent-toolkit --skill naming-analyzer`

Call the Skill tool with "domain-modeling" when the report introduces domain concepts, changes their meaning, or exposes ambiguous or conflicting terminology. Reading an existing project glossary for established vocabulary does not require changing it.

Call the Skill tool with "system-design" when the report concerns distributed architecture, capacity, scaling, caching, queues, availability, database topology, or a substantial architecture change. If it isn't installed, ask the user to run `npx skills add wondelai/skills --skill system-design`, then continue. Load only the references needed for the question:

- `references/four-step-process.md` for a new architecture proposal or formal design review.
- `references/estimation-numbers.md` for capacity estimates.
- `references/building-blocks.md` for distributed components and data flow.
- `references/database-scaling.md` for persistence topology and growth.
- `references/reliability-operations.md` for failure handling, recovery, deployment, or observability.

Call the Skill tool with "d2" when the report needs a sequence, architecture, state, relationship, or data-flow diagram. If it isn't installed, ask the user to run `npx skills add benjaminwestern/google-engineer-skills --skill d2`, then continue. Load only the relevant reference from that skill:

- `references/sequence.md` for sequence diagrams.
- `references/shapes.md` for specialized shapes and styling.
- `references/database.md` for ERDs or UML.
- `references/advanced.md` for imports, variables, composition, or multi-board diagrams.
- `references/examples.md` when no established diagram shape exists.

These sibling skills own their tool-specific rules. This skill decides how their outputs fit into one report.

## Workflow

### 1. Define the report

Identify the audience, the question or decision, the approved scope, the evidence, and the next action. Separate facts, measurements, recommendations, risks, assumptions, and unknowns.

If the user has not approved a structure, propose a short outline before authoring. For a report based on an existing review, investigation, or conversation, recover its conclusions and visual explanations before drafting.

Use one canonical name for each concept across prose, diagrams, tables, captions, and recommendations. Apply Naming Analyzer to titles, headings, actors, nodes, connections, states, table headings, and technical labels. Prefer the shortest unambiguous name:

- Node labels usually need one to four words.
- Connection labels use short verb phrases.
- One concept keeps one label throughout the report.
- Established abbreviations are acceptable.
- Captions and nearby prose carry detail that would crowd a visual.
- Introduce a required long official name once, then use its established short form.

Use Domain Modeling when a term is new, overloaded, changing, or inconsistent with the project glossary. Distinguish entities, states, events, commands, and derived values when the distinction affects the report. Surface unresolved contradictions. Changes to a project glossary, `CONTEXT.md`, or ADR require separate user approval.

Use System Design only for a substantial architecture decision. Start with functional and non-functional requirements. Capture known scale, workload, latency, storage, availability, current and proposed architecture, component responsibilities, data flow, bottlenecks, failure modes, recovery, ownership, important tradeoffs, and rejected options. Use measured or supplied inputs for capacity calculations. Mark assumptions and leave unknown scale unknown.

System Design supplies analysis, not the report format. Calculate its review score when that skill requires one, but include the score in the PDF only when the user asks for a scored system-design review. Architecture proposals and explanations state gaps and tradeoffs directly.

Completion check: the audience, purpose, scope, sources, terminology, assumptions, unknowns, outline, and existing visuals are clear. When System Design applies, every component follows from a stated requirement.

### 2. Plan visuals with Show Me

Place each visual beside the text it explains. Give it one question and one abstraction level.

Preserve useful visuals already shown to the user. Keep their actors, order, branches, labels, and conclusion. Recreate existing Mermaid flows and sequences faithfully in D2. New visuals are welcome when they explain something the existing material does not.

Choose the output by meaning:

| Show Me form | Report output |
|---|---|
| Algorithm or procedural logic | Lovelace `pseudocode-list` |
| Call tree or request tree | Zebraw `text` block |
| Component tree | Zebraw `tsx` or `text` block |
| File tree | Zebraw `text` block |
| State, control-flow, or structural diff | Zebraw `diff` block: Typst colours removed lines red and added lines green, so the diff carries the before/after without prose. Pad the name and the explanation into two aligned columns so the block reads as a table, and keep a context line for what does not change. |
| Source, shell, SQL, configuration, or logs | Zebraw with the correct language |
| Existing Mermaid sequence or flow | Faithful D2 recreation |
| New sequence, architecture, state, relationship, or data flow | D2 |
| Structured comparison or measurements | Native Typst table |
| Dense visual UI or HTML artifact | Rendered high-resolution image |

Every report keeps both imports and uses them: procedural logic, steps and rules are a Lovelace `pseudocode-list` (numbered, indented, `*if*`/`*then*`/`*else*` in italics), never a bare code fence; code, trees and diffs are Zebraw blocks, never a bare fence either. A bare ```` ``` ```` fence in the body is a defect. Textual trees, pseudocode, code, diffs, and tables keep their native forms. Use several forms only when each answers a different question.

Completion check: every planned visual has a claim, source, report location, and output format.

### 3. Initialize the Typst project

Create a new report from the established template:

```bash
typst init @preview/metropole-report:0.1.0 <report-dir>
```

Inspect the generated project and apply the setup in the style reference to its entrypoint. Reuse an existing report project instead of initializing over it. Confirm the required font families with `typst fonts`; obtain missing fonts or ask before substituting. Keep the template defaults for type size, leading, margins and heading treatment.

A report may contain:

```text
<report-dir>/
├── main.typ
├── main.pdf
├── sources.bib       # when the report cites sources
├── diagrams/         # when the report contains D2 diagrams
│   ├── <diagram>.d2
│   └── <diagram>.pdf
└── images/            # when the report contains image evidence
    └── <report-assets>
```

Use the filenames generated by the template when they differ from this example.

Completion check: the Typst CLI created the project, and every referenced asset has a place in it.

### 4. Write the report

Keep the `metropole-report` setup and the visual baseline. Use ordinary prose or a native quote for the leading conclusion. Let longer content use more pages rather than reducing the type or table spacing. Add the packages needed for pseudocode and technical text blocks:

```typst
#import "@preview/lovelace:0.3.1" as lovelace
#import "@preview/zebraw:0.6.3" as zebra
```

Use Lovelace for pseudocode:

```typst
#block(breakable: false)[
  #lovelace.pseudocode-list[
    + receive the request
    + *if* the cached value is current *then*
      + return it
    + *else*
      + fetch and store a fresh value
    + *end*
  ]
]
```

Use Zebraw for code and text-shaped technical visuals. For a structural diff, keep the `diff` language so lines colour, pass `lang: false` to drop the tag, and align the columns:

```typst
#block(breakable: false)[#zebra.zebraw(numbering: false, lang: false, ```diff
 analyze-report, per grid point
-  ranking call          GPT picks IDs, copies addresses; 13 to 41 s
-  recoverBrandIds       rules repair empty output
+  string search         finds brand-list names, with offsets
+  askJev                one request; question per name, per address
   persist               unchanged: rankings, mentions, metrics
```)]
```


````typst
#zebra.zebraw(
  numbering: false,
  ```text
  request
    authenticate
    load configuration
    render response
  ```,
)
````

Use native Typst figures, tables, quotes, headings, bibliography support, and page breaks. Keep code line numbers off unless the discussion refers to them. Give every diagram and evidence image a useful caption.

Lead with the conclusion or decision. Follow with the evidence, mechanics, consequences, and actions needed to understand it.

- State measurements with their source and time window.
- Label unknown or unverified state directly.
- Separate current behavior from proposed behavior.
- Give each recommendation an owner, change, expected result, and important tradeoff when known.
- Cite repository evidence, external sources, and supplied artifacts near the supported claim.
- If the report contains any citation, use `sources.bib`.
- Apply Unslop to the full draft before adjusting layout.

Completion check: every important claim is cited, marked as inference, or labeled unknown; every section helps answer the report's question.

### 5. Build D2 diagrams

Store editable `.d2` files in `diagrams/` and compile them to PDF.

Use ELK for architecture, state, relationship, ERD, and data-flow diagrams. ELK produces orthogonal links with 90-degree elbows and handles containers. Persist the choice in each `.d2` source:

```d2
vars: {
  d2-config: {
    layout-engine: elk
  }
}
```

Compile the source normally because it carries its layout choice:

```bash
d2 <report-dir>/diagrams/<diagram>.d2 <report-dir>/diagrams/<diagram>.pdf
```

Use D2's native layout for `shape: sequence_diagram`. Its participant and message structure already provides horizontal and vertical geometry.

Use TALA when an installed ELK layout cannot express a non-hierarchical architecture clearly. TALA fits diagrams that need explicit `top` or `left` positions, per-container direction, or stronger symmetry. Record `layout-engine: tala` in that source. ELK remains the default because TALA is a separate proprietary installation.

Match the palette to the report and reuse D2 classes for repeated roles. Keep participant order deliberate. Prefer orthogonal links, clear labels, and routes without avoidable crossings.

Design for the final page:

- Give a large diagram its own page.
- Size wide diagrams by width.
- Check the rightmost and bottommost labels.
- Increase diagram font size before enlarging the figure.
- When the exported PDF has excess whitespace or edge rules, rewrite its page geometry to the content bounds before embedding it. Typst sizes the PDF from its page box.
- Split a crowded diagram by question before its labels become too small.

Completion check: each compiled diagram is readable at final PDF size, uses the intended layout engine, and has no avoidable crossings or obscured labels.

### 6. Compile and inspect

Compile from the report project:

```bash
typst compile main.typ main.pdf
```

If `typstyle` is available, follow the formatting checks from the "typst-author" skill before the final compile.

Render every page for inspection:

```bash
mkdir -p .render-check
typst compile main.typ .render-check/page-{p}.png -f png
```

Use the PDF skill's renderer when direct Typst PNG output is unsuitable. Inspect:

- cover, outline, headings, page numbers, and section transitions;
- the required serif body, sans-serif headings and monospace technical text against the neutral reference; verify embedded fonts with `pdffonts` when available;
- terminology across prose and visuals;
- system boundaries, responsibilities, and data-flow direction when System Design applies;
- every diagram edge and label, including orthogonal routing and crossings;
- whole words and hyphenated compounds staying intact across lines;
- the template's own line height and the gap above and below every heading (compare a page against `report-example.pdf`: if lines sit tighter or headings sit closer to the body, a preamble rule replaced the template's);
- inline code slightly smaller than body text, in its grey box;
- code and pseudocode wrapping;
- no bare code fence: every logic block renders as a Lovelace numbered list, every code block with the Zebraw frame (grep the `.typ` for a fence not wrapped in `zebra.zebraw`);
- table widths and row breaks;
- image resolution, captions, and attribution;
- citations and bibliography output;
- clipping, overlap, excess whitespace, blank pages, and unreadable type.

Fix defects, recompile, and inspect the affected pages plus adjacent transitions. Remove `.render-check` after the final inspection.

Completion check: the latest PDF has no split words, clipped, overlapping, collapsed, missing, or unreadable content.

## Delivery

Return the report project location and name the entrypoint, final PDF, diagrams, images, and bibliography that exist. State exactly what was compiled and visually inspected. Report missing evidence or unchecked content plainly.
