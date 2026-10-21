---
type: reference
eyebrow: "technical-html · Reference"
lede: "Every piece of Markdown syntax that `scripts/build.ts` reads, what it renders to, and every condition that stops a build."
meta: "16 Oct 2026 · matches `scripts/build.ts` and `assets/style.css` in the technical-html skill"
toc: true
---

# technical-html Markdown reference

## Command

```bash
bun skills/productivity/technical-html/scripts/build.ts path/to/doc.md
```

The build writes `path/to/doc.html` beside the source and prints `wrote <path> (<n> diagram(s), <bytes> bytes)`. On any problem it prints `build: <message>` to stderr and exits with code 1. It uses Bun built-ins only and needs the `d2` CLI with the TALA layout plugin.

```d2
md: "doc.md" {class: part}
d2: "d2 with TALA" {class: provider}
markdown: "Bun.markdown" {class: part}
html: "doc.html" {class: part}
house: "house.d2" {class: store}
css: "style.css" {class: store}

md -> d2: "each d2 fence"
md -> markdown: "everything\nelse"
house -> d2: "prepended"
d2 -> html: "inline SVG"
markdown -> html: "HTML body"
css -> html: "inlined"
```

*Arrows follow the content from the source file to the page. The build lifts each `d2` fence out of the Markdown before `Bun.markdown` runs, so diagrams never pass through the Markdown renderer.*

## Frontmatter

Frontmatter is optional YAML between two `---` lines at the very top of the file. A file without it builds a page whose header holds only the title.

```yaml
---
type: status
eyebrow: "acme-api · Status report"
lede: "Where the v2 migration stands and what blocks the cutover."
meta: "16 Oct 2026 · checked against `main` · [runbook](https://example.com/runbook)"
stats:
  - { value: "7 of 9", label: "endpoints on v2", tone: good }
  - { value: "2", label: "endpoints still on v1", tone: gap }
toc: auto
---
```

| Field | Value | Default | Renders as |
|---|---|---|---|
| `type` | `status`, `design`, `how-to` or `reference` | None: `<body>` has no class | `<body class="doc-status">` and so on |
| `eyebrow` | Plain text | None | `<p class="eyebrow">` above the title |
| `lede` | Inline Markdown | None | `<p class="lede">` under the title |
| `meta` | Inline Markdown | None | `<p class="meta">` under the lede |
| `stats` | List of 2 to 4 cards | No cards | `<div class="stats">` with one `<div class="stat">` per card |
| `stats[].value` | Plain text or a number | Required | `<b>` in the card |
| `stats[].label` | Inline Markdown | Required | `<span>` in the card |
| `stats[].tone` | `good`, `gap`, `wait` or `none` | `none` | Card class: green, red, amber or neutral |
| `toc` | `auto`, `true` or `false` | `auto` | `<nav class="toc">` listing every `##` heading. `auto` shows it when the page has 4 or more. |

## Title and headings

The first `#` heading is the page title. The build moves it into `<header class="doc-header">` together with the eyebrow, lede, meta and stats, and copies its text into `<title>`. A file with no `#` heading does not build.

Every heading gets an `id` made from its text. The table of contents links to the `##` headings only, so `###` headings never appear in it.

## Diagrams

A fenced block with the language `d2` becomes a diagram. The paragraph after the closing fence must be entirely italic: it becomes the caption.

````markdown
```d2
direction: right
api: "acme-api" {class: part}
db: "Orders" {class: store}
api -> db: "writes the order"
db -> api: "confirms" {class: back}
```

*Arrows follow the request. The dashed arrow is the reply.*
````

Renders as `<figure class="diagram">`, holding the inline SVG and a `<figcaption>`. The SVG shows at its natural width and shrinks to fit the page. Below 720 px wide it keeps at least 600 px and scrolls sideways, so labels stay legible.

The build prepends `assets/house.d2` to every block, so a block must not declare `vars` or `classes`. The house file sets `direction: right`, so diagrams read left to right unless a block sets its own `direction`. It defines these classes:

| Class | Use it for | Look |
|---|---|---|
| `person` | A human role | Person shape, blue |
| `part` | A component, step or file | White box |
| `store` | A database, file store or folder | Cylinder, red outline |
| `provider` | An outside service or tool | Grey box |
| `replace` | The thing being replaced | Red dashed box |
| `group` | A container that groups nodes | Light box with a bold label |
| `back` | A reply or optional edge | Dashed line |

Labels are plain strings. Write a line break as `\n`. A `|md` label fails the build.

## Code blocks

Every other fenced block renders as `<pre data-lang="<lang>"><code>`. The language shows as a small label on the block. There is no syntax highlighting and no script.

A `diff` block is the one exception: each line is tinted by its first character. Lines starting with `+` are green, `-` red and `@@` blue; other lines stay plain. Keep the marker in the first column.

```diff
 defineAgent({
-  output: { schema: Cards },
+  output: { toolId: "mcp__sapio__present" },
 })
```

## Callouts

A blockquote whose first line is a GitHub alert marker becomes a callout.

```markdown
> [!WARNING]
> The v1 endpoints stop answering on 1 Dec.
```

| Marker | Renders as | Label colour |
|---|---|---|
| `[!NOTE]` | `<aside class="callout callout-note">` | Blue |
| `[!TIP]` | `<aside class="callout callout-tip">` | Green |
| `[!IMPORTANT]` | `<aside class="callout callout-important">` | Amber |
| `[!WARNING]` | `<aside class="callout callout-warning">` | Amber |
| `[!CAUTION]` | `<aside class="callout callout-caution">` | Red |

Each callout starts with `<p class="callout-label">` holding the kind as a word. A blockquote without a marker stays a plain `<blockquote>`.

## Status pills

An inline code span that holds the word `status`, a colon and a kind becomes a pill. Text after the kind, separated by a space, replaces the default label.

```markdown
| Check | Status |
|---|---|
| Name matches the folder | `status:built` |
| Runs on every push | `status:partly Weekly only` |
```

| Kind | Default label | Colour | Rendered |
|---|---|---|---|
| `built` | Built | Green | `status:built` |
| `gap` | Gap | Red | `status:gap` |
| `partly` | Partly | Amber | `status:partly` |
| `none` | Not started | Grey | `status:none` |
| `done` | Done | Green | `status:done` |
| `here` | We are here | Blue | `status:here` |
| `partly` with a custom label | The text after the kind | Amber | `status:partly Weekly only` |

Renders as `<span class="pill built">Built</span>`. Pills work in paragraphs, list items and table cells. Inside a fenced code block the text stays literal. An unknown kind fails the build.

## Fenced divs

A line `::: <kind>` opens a div and a line holding only `:::` closes it. Divs do not nest.

````markdown
::: steps
1. **Write the migration** `status:done`
   The orders table has the new column.
2. **Backfill the column** `status:here`
   The job runs at night.
3. **Drop the old column**
   After one week without errors.
:::
````

| Kind | Renders as | Content |
|---|---|---|
| `steps` | `<div class="steps">` | A numbered list. Each item is a step card. |
| `card` | `<div class="card">` | Any Markdown, in a white bordered card. |
| `footer` | `<footer class="doc-footer">` | Sources and colophon, muted and smaller. |

In a `steps` div, a bold first line becomes `<p class="step-title">`, together with the rest of that line. An item with a `done` pill gets `<li class="done">`. An item with a `here` pill gets `<li class="here">`, the current step. A `steps` div holds at most one `here` pill.

## Tables

GitHub tables render inside `<div class="table-wrap">`, which scrolls sideways when the table is wider than the page. Column alignment from the separator row is kept. A right-aligned column (`--:`) also uses tabular numbers.

## Raw HTML

Raw HTML in the Markdown passes through unchanged. It is allowed and discouraged: the class names above are the styling contract, and raw HTML can step outside it.

## Light and dark

Every page supports both schemes. There is no syntax for it.

| Part | Behaviour |
|---|---|
| Default | The page follows the reader's system setting, through `<meta name="color-scheme" content="light dark">` and `light-dark()` colour tokens in `style.css`. |
| Toggle | A button at the top right switches to the scheme not on screen. A choice that differs from the system setting is stored in `localStorage` under `color-scheme`. Switching back to the system scheme removes it. |
| Scripts | One line in `<head>` applies the stored choice before the page paints, and one short script at the end of `<body>` handles the button. They are the only JavaScript in the page. |
| Without JavaScript | The page still follows the system setting. The toggle has no effect. |
| Diagrams | `style.css` recolours the `house.d2` palette and the D2 default colours, so diagrams follow the scheme. A colour outside that palette keeps its light value. |
| Print | Always light. The button is hidden. |

## Build failures

Each failure prints `build: <message>` and exits with code 1. Where the source has a line, the message names it.

| Condition | Message contains |
|---|---|
| No path given, or a file that cannot be read | `usage:` or `cannot read` |
| No `#` heading | `no H1` |
| Frontmatter that is not a YAML mapping | `frontmatter must be a YAML mapping` or `frontmatter is not valid YAML` |
| `type` outside the four values | `frontmatter type` |
| 1 card, or more than 4, in `stats` | `frontmatter stats must be a list of 2 to 4 cards` |
| A card without `value` or `label`, or with an unknown `tone` | `frontmatter stats[n]` |
| `toc` outside `auto`, `true` and `false` | `frontmatter toc must be auto, true or false` |
| A pill with an unknown kind | `unknown status kind` |
| An unknown fenced div kind | `unknown fenced div kind` |
| A div inside a div | `fenced divs do not nest` |
| A `:::` with no open div, or an open div at the end of the file | `":::" closes nothing` or `unclosed` |
| A `steps` div without a numbered list | `"::: steps" needs a numbered list` |
| Two or more `here` pills in one `steps` div | `"::: steps" has n "here" pills` |
| A `\|md` label in a `d2` block | `d2 uses a \|md label` |
| A diagram without an italic caption | `diagram has no caption` |
| A `d2` block that does not compile, or no `d2` on the path | `d2 failed for the diagram` or `cannot find the` |
| A `script`, `link`, `img`, `iframe`, `source`, `video` or `audio` tag that loads an `http(s)` URL, a CSS `url()` with one, or an `@import` | `external resource` |

A normal link to a web page is not an external resource and builds fine.

::: footer
**Source.** `scripts/build.ts`, `assets/house.d2` and `assets/style.css` in `skills/productivity/technical-html/`. The example documents in `assets/examples/` use every feature on this page.
:::
