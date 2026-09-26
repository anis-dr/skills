# Report visual baseline

Read this before selecting fonts or changing layout. Inspect `report-example.typ` and its compiled `report-example.pdf` for a neutral example of the required treatment. The example demonstrates presentation only; its illustrative scenario is not evidence about the current project.

## Typography and front matter

Use `@preview/metropole-report:0.1.0` with this configuration, replacing only report metadata:

```typst
#import "@preview/metropole-report:0.1.0": *
#import "@preview/lovelace:0.3.1" as lovelace
#import "@preview/zebraw:0.6.3" as zebra

#show: metropole.with(
  title: "Delivery review",
  subtitle: "Observed behavior, remaining risk, and the next decision",
  author: "Engineering",
  date: datetime(year: 2026, month: 1, day: 1),
  language: "en",
  cover-page: true,
  accent-color: metro-blue,
  body-font: "Source Serif Pro",
  heading-font: "Source Sans Pro",
  raw-font: "JetBrains Mono",
)

#set text(hyphenate: false)
#show regex("[\\p{L}\\p{N}]+(?:[-‐][\\p{L}\\p{N}]+)+"): it => box(it)
#show bibliography: set par(justify: false)

#outline(depth: 2)
#pagebreak()
```

Keep the template defaults for font size, leading, margins, heading hierarchy, header and footer. In this template the body is 11 pt, the leading ratio is 1.75, and spacing/margins follow its baseline grid. The generous spacing is intentional. Page count follows content rather than determining font size.

Use `typst fonts` before compiling. Confirm all three families are available. If any is missing, obtain the font or ask for an explicit alternative; do not silently substitute Inter, Arial, another all-sans pairing, or unavailable default font names. When supported, verify final embedded fonts with `pdffonts`.

An explicit user-selected style overrides this baseline. Otherwise keep it consistent between reports, even when the report is short.

### Keep words intact

Always disable automatic hyphenation with `#set text(hyphenate: false)` after the template setup and before the outline or body. This overrides the hyphenation that justified paragraphs otherwise enable. Words such as “examined” must move whole to the next line, never appear as “exam-” followed by “ined”.

The show rule in the setup keeps authored hyphenated compounds such as “durable-state” together in an inline box without changing their spelling. Apply both rules to every report, including headings, prose, table cells and captions. Avoid manual soft hyphens and forced breaks inside words.

Keep the existing type size and spacing. Resolve overflow by changing available width or layout, not by restoring hyphenation or shrinking the text. Long URLs and code may wrap at meaningful separators when needed; do not box an entire long URL or path. Inspect the PDF for both split words and any new overflow after these rules are applied.

Keep bibliographies ragged-right with `#show bibliography: set par(justify: false)` so long URLs do not create stretched word spacing when hyphenation is disabled. The report body keeps the template's paragraph treatment.

## Prose, headings and conclusions

- Use serif text for prose and table bodies, sans-serif text for headings, and monospace only for technical text.
- Keep the full cover and depth-two contents page. Put the substantive conclusion at the start of the body.
- Use ordinary prose or a short native `quote` for the conclusion. Do not replace the report with dashboard cards, decorative badges or an all-sans presentation deck.
- Let sections flow naturally. Use deliberate page breaks for large diagrams or major transitions, not for every small heading.
- Use the template's heading spacing and contrast. Avoid custom heading replacements or paragraph rules merely to pack more on a page.

## Tables and technical blocks

Use native Typst tables with the template's blue header and light alternating rows. Keep table text at the body size; disable justification locally inside tables so narrow cells do not stretch words:

```typst
#[
  #set par(justify: false)
  #table(
    columns: (8em, 1fr, 1.4fr),
    table.header([*Behavior*], [*Evidence*], [*Next action*]),
    [Request accepted], [Recorded response], [Verify durable outcome],
  )
]
```

Split a crowded table into related groups or additional pages. Do not reduce it to tiny type to meet an arbitrary page budget. Keep rows together when practical and repeat headers across pages.

Use Zebraw for code, call trees and structural diffs, with line numbers off unless referenced. Use Lovelace for procedural logic. Do not flatten either into screenshots or redraw text trees as diagrams.

Use native pagination controls rather than changing type size. `#set table.cell(breakable: false)` keeps short table rows intact; wrap a short Zebraw block in `#block(breakable: false)[...]` so a call tree does not split between pages. If a heading is stranded at a page bottom, `#show heading: it => block(sticky: true)[#it]` preserves the template treatment while keeping it with following content. Inspect the result; a block taller than one page must still be split.

## Diagrams

D2 diagrams use short labels and a restrained palette compatible with the report:

| Role | Fill | Stroke |
| --- | --- | --- |
| Application work | `#eaf2f8` | `#005f9e` |
| Stored state | `#fdf2f0` | `#c53a2f` |
| External or successful outcome | `#eef7f1` | `#1f7a4f` |
| Risk | `#fdecea` | `#c0392b` |

Start with 20–24 px diagram labels and inspect at final page size. Increase label sizes or split the diagram before scaling the entire figure down. Use ELK for graphs and D2's native sequence layout for sequences. Give a large diagram its own page. Crop excess PDF page whitespace before embedding, preserving vector content.

## Visual acceptance

Inspect the cover, contents, a prose/table page, every diagram and every remaining page. Confirm the serif/sans hierarchy matches the profile, words and hyphenated compounds remain intact, text is comfortably readable, tables are not compressed, page transitions are intentional, and sources fit without overflow. Compilation alone is not a visual check.
