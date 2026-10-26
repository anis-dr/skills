---
type: reference
eyebrow: "technical-html · Reference"
lede: "Every piece of syntax that `scripts/build.ts` reads in a `.md` or `.svx` document, what it renders to, and every condition that stops a build."
meta: "21 Oct 2026 · matches `scripts/build.ts`, `app/plugins/` and `assets/style.css` in the technical-html skill"
toc: true
---

# technical-html document reference

## Command

```bash
bun skills/productivity/technical-html/scripts/build.ts path/to/doc.md
```

The build writes `path/to/doc.html` beside the source and prints `wrote <path> (<bytes> bytes, <n> of them script)`. A `.svx` document builds the same way. On any problem it prints `build: <file>:<line>: <message>` to stderr and exits with code 1 [@build]. It needs Bun and the `d2` CLI with the TALA layout plugin. The first run installs the dependencies of the SvelteKit app in `app/`. [@fig:build] shows how the source becomes the page.

```d2 #fig:build
doc: "doc.md or doc.svx" {class: part}
plugins: "app/plugins" {class: part}
d2: "d2 with TALA" {class: provider}
pierre: "Pierre" {class: provider}
kit: "SvelteKit prerender" {class: part}
html: "doc.html" {class: part}

doc -> plugins: "one source\npass, then mdsvex"
plugins -> d2: "each d2 fence"
plugins -> pierre: "each diff and\ncode fence"
plugins -> kit: "one Svelte page"
kit -> html: "one file, CSS\nand scripts inlined"
```

*From source file to page*

The plugins render every diagram and code block at build time, so the page that SvelteKit prerenders already holds their HTML. The build is one `vite build` of the app in `app/`, with the document as its only page. It runs where the document lives, so a `.svx` document can import a component next to it. It leaves nothing beside the document except the `.html`.

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
| `bibliography` | A path to a BibTeX file, relative to the document | `<doc>.bib` beside the document, if it exists | The Sources section; see [Citations](#citations) |
| `toc` | `auto`, `true` or `false` | `auto` | `<nav class="toc">` listing every `##` heading. `auto` shows it when the page has 4 or more. |

## Title and headings

The first `#` heading is the page title. The build moves it into `<header class="doc-header">` together with the eyebrow, lede, meta and stats, and copies its text into `<title>`. A file with no `#` heading does not build.

Every other heading gets an `id` made from its text. The table of contents links to the `##` headings only, so `###` headings never appear in it.

## Diagrams

A fenced block with the language `d2` becomes a diagram. After the language it carries a label, `#fig:<name>`, made of letters, digits, `-` and `_`. The paragraph after the closing fence must be entirely italic: it becomes the caption. The caption names the figure, like a title: at most 10 words and no full stop. If the reader needs help with the arrows, explain them in a normal paragraph before or after the diagram.

The build numbers diagrams from 1 in document order. The prose refers to each one with `[@fig:<name>]`, written like a citation, and the build replaces it with a link reading "Figure N". A reference may come before its figure. Every figure needs at least one reference, and a figure number typed by hand fails the build, so adding a figure never leaves a stale number.

````markdown
[@fig:order] shows the write and its confirmation.

```d2 #fig:order
direction: right
api: "acme-api" {class: part}
db: "Orders" {class: store}
api -> db: "writes the order"
db -> api: "confirms" {class: back}
```

*How acme-api stores an order*
````

Renders as `<figure class="diagram" id="fig-order">`, holding the inline SVG and a `<figcaption>` that starts with `<span class="fig-num">Figure 1</span>`. The reference renders as `<a class="xref" href="#fig-order">Figure 1</a>`. The SVG shows at its natural width and shrinks to fit the page. Below 720 px wide it keeps at least 600 px and scrolls sideways, so labels stay legible.

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

A fenced block in a language that Shiki knows, such as `ts`, `bash`, `yaml`, `json` or `markdown`, is highlighted at build time by Pierre. It renders as a `<diffs-container>` with the highlighted code in a declarative shadow root, so it needs no script. Long lines wrap.

Two more fence names render the same way, for content that is not code in a real language:

| Fence | Use it for | Highlighting |
|---|---|---|
| ` ```pseudo ` | Logic and algorithms written as pseudocode | Keywords, constants, calls, strings, numbers, comments and operators. Other words stay plain. |
| ` ```text ` | File trees and call trees | None |

The `pseudo` grammar is part of this skill, in `app/src/lib/pseudo.ts`. Its keywords are `if`, `else`, `elif`, `then`, `for`, `each`, `in`, `while`, `until`, `return`, `break`, `continue`, `on`, `when`, `await`, `async`, `try`, `catch`, `finally`, `throw`, `and`, `or`, `not`, `is`, `new`, `emit`, `call`, `let`, `set`, `match`, `case` and `end`. Its constants are `true`, `false`, `null`, `none` and `nil`. A word directly before `(` is a call. A comment starts with `#` or `//`.

```pseudo
on(save)
  if content is unchanged
    return cached result
  write new content
  invalidate cache
```

Any other block, including one with no language, renders as `<pre data-lang="<lang>"><code>`. The language shows as a small label on the block.

## Diffs

A `diff` fenced block renders with Pierre too, as added and removed rows with line numbers and syntax highlighting. Five rules decide what it shows.

- **A bare hunk names its language.** A block without git file headers (`diff --git` or `---`) must name a language or a file path after `diff`. With a language, the block has no file header. With a path, the path is the header and its extension picks the language.
- **`pseudo` and `text` work after `diff` too.** ` ```diff pseudo ` highlights a change to pseudocode. ` ```diff text ` shows a change to a file tree or a call tree with no highlighting. A path that ends in `.pseudo` picks `pseudo`.
- **A changed line is a pair of whole lines.** Pierre parses every diff line as real code. Write the old line whole after `-` and the new line whole after `+`. Do not wrap a long `+` line onto a second `+` line by hand: Pierre reads the second line as a new line of code.
- **`split` shows two columns.** Add the word `split` after the language or path. Without it the diff is unified.
- **Two or more files become a switch.** Paste the output of `git diff`. When it holds two or more files, the block becomes one framed diff with a unified and split switch above it. The switch needs JavaScript; without it the diff stays unified. This is the only built-in part that hydrates.

```diff ts
 defineAgent({
   tools: [question, find_projects, document_status, find_budget_lines, propose_change_order, present],
-  output: { schema: Cards },
+  output: { toolId: "mcp__sapio__present" },
 })
```

The block above starts with ` ```diff ts `. The same lines with ` ```diff apps/sapio/agent.ts split ` show the path as a header, in two columns:

```diff apps/sapio/agent.ts split
 defineAgent({
   tools: [question, find_projects, document_status, find_budget_lines, propose_change_order, present],
-  output: { schema: Cards },
+  output: { toolId: "mcp__sapio__present" },
 })
```

A ` ```diff pseudo ` block shows the same kind of change in pseudocode:

```diff pseudo
 on(save)
+  if content is unchanged
+    return cached result
   write new content
+  invalidate cache
```

The page ships only the grammars its switches use. A page with no switch ships no highlighter at all.

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

Renders as `<span class="pill built">Built</span>`. Pills work in paragraphs, list items, table cells and the frontmatter `lede`, `meta` and stat labels. Inside a fenced code block the text stays literal. An unknown kind fails the build.

## Fenced divs

A line `::: <kind>` opens a div and a line holding only `:::` closes it. Both lines start in the first column. Divs do not nest [@plugins].

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
| `footer` | `<footer class="doc-footer">` | A colophon, muted and smaller: how the page was made, or a caveat. Sources go in the `.bib` file; see [Citations](#citations). |

In a `steps` div, a bold first line becomes `<p class="step-title">`, together with the rest of that line. An item with a `done` pill gets `<li class="done">`. An item with a `here` pill gets `<li class="here">`, the current step. A `steps` div holds at most one `here` pill.

## Citations

Sources live in a BibTeX file beside the document, and the prose cites them where a claim is made. The build numbers the sources in the order they are first cited and adds a Sources section at the end of the page, before any `::: footer`.

```bibtex
@online{step,
  author = {{Trigger.dev}},
  title = {Step class},
  url = {https://example.com/docs/step},
  urldate = {2026-10-21},
  note = {The retry options a step accepts.},
}

@software{retry,
  title = {Retry helper},
  organization = {acme/payments},
  path = {src/retry.ts},
  version = {4f2c9a1},
  urldate = {2026-10-21},
  note = {The wait doubles on each attempt.},
}
```

````markdown
A step retries up to three times [@step], and each wait is twice the last [@retry].
Both limits can change per call [@step; @retry].
````

| Part | Rule |
|---|---|
| File | `<doc>.bib` beside the document, with the same name: `design.bib` for `design.md`. Frontmatter `bibliography: <path>` points elsewhere, relative to the document. |
| Citation | `[@key]` for one source, `[@a; @b]` for several. In inline code or a fenced block it stays text. |
| Numbers | Each source gets the next number when it is first cited. `[@a]` renders as `[1]`; `[@a; @b]` renders as `[1][2]`, each marker its own link, in number order. |
| Every entry is cited | An entry that nothing cites fails the build. A `.bib` file in a document without citations must be empty. |
| No section | A document without citations gets no Sources section. |

Entry types are `@online` for a web page, `@software` for code, `@misc`, `@article` and `@book`. Any other type renders like `@misc`. Every type uses the same format, so pick the one that names the source best.

| Field | Renders as |
|---|---|
| `title` | The title in `<strong>`, linked when `url` is set |
| `author` | The names after the title. Write an organisation in double braces: `{{Trigger.dev}}`. |
| `organization`, `publisher`, `howpublished` | After the title, when there is no `author` |
| `date` or `year` | After the author |
| `path` | A repo-relative code path in `<code>` |
| `version` | The commit or release the source was read at: "at `4f2c9a1`" |
| `url` | The link on the title |
| `urldate` | The day you read it, written `2026-10-21`: "Read 21 Oct 2026." |
| `note` | What the source supports, as a short sentence |

A missing field is left out. Field text is TeX: `\texttt{x}` renders as code, `--` as a dash and `~` as a space, so write `\textasciitilde{}` for a tilde in a note. `path`, `version` and `url` are read as typed.

Under a `## Retries` heading, the two entries above render as:

```html
<a class="cite" href="#ref-step" id="cite-step-1">[1]</a>
<a class="cite" href="#ref-retry" id="cite-retry-1">[2]</a>
<a class="cite" href="#ref-step" id="cite-step-2">[1]</a><a class="cite" href="#ref-retry" id="cite-retry-2">[2]</a>

<section class="doc-sources" aria-labelledby="sources">
  <h2 id="sources">Sources</h2>
  <ol>
    <li id="ref-step"><strong><a href="https://example.com/docs/step">Step class</a></strong>, Trigger.dev. Read 21 Oct 2026. The retry options a step accepts.<span class="cited-in">Cited in: <a class="backref" href="#cite-step-1" aria-label="Back to citation 1 of 2, in Retries">Retries</a><a class="backref backref-n" href="#cite-step-2" aria-label="Back to citation 2 of 2, in Retries">2</a></span></li>
    <li id="ref-retry"><strong>Retry helper</strong>, acme/payments, <code>src/retry.ts</code> at <code>4f2c9a1</code>. Read 21 Oct 2026. The wait doubles on each attempt.<span class="cited-in">Cited in: <a class="backref" href="#cite-retry-1" aria-label="Back to citation 1 of 2, in Retries">Retries</a><a class="backref backref-n" href="#cite-retry-2" aria-label="Back to citation 2 of 2, in Retries">2</a></span></li>
  </ol>
</section>
```

The Sources heading is in the table of contents like any other `##` heading. Each entry ends with a `Cited in:` line that links back to each citation: a name is the nearest `##` heading above that citation, and further citations under the same heading appear as small numerals.

## Tables

GitHub tables render inside `<div class="table-wrap">`, which scrolls sideways when the table is wider than the page. Column alignment from the separator row is kept. A right-aligned column (`--:`) also uses tabular numbers.

## Svelte in .svx documents

A `.svx` document is the same Markdown with Svelte allowed in it: every rule above applies. [interactive.svx](interactive.svx) uses each part below [@examples].

| Part | Rule |
|---|---|
| `<script>` | At most one instance `<script lang="ts">`, anywhere at the top level. It holds imports and state for the whole document. A second one fails the build. |
| Components | Write them inline as Svelte markup, or import a `.svelte` file with a path relative to the document, such as `import Backoff from "./Backoff.svelte"`. Leave a blank line around Markdown inside a component. |
| `<style>` | One `<style>`, scoped to the markup in this document. Use the house variables, such as `var(--line)`, `var(--paper)`, `var(--radius)` and `var(--blue)`, so the part follows light and dark. |
| Braces | `{` and `}` in prose start a Svelte expression. Write a literal brace as `&#123;` and `&#125;`. Braces in code spans and fenced blocks stay literal. |
| Frontmatter | The frontmatter keys are constants in the document, so `{lede}` prints the lede. Do not declare a variable with the name of a key. |
| No JavaScript | The page is prerendered: it shows each component in its first state. |

A `.svx` document with a `<script>` or a component hydrates the whole page; one without them ships no more script than a `.md` document. In a `.md` document, braces and `$` are always literal text.

## Raw HTML

Raw HTML in the Markdown passes through unchanged. It is allowed and discouraged: the class names above are the styling contract, and raw HTML can step outside it. In a `.md` document, a capitalised tag such as `<Card>` is read as a Svelte component and fails, so keep raw HTML to lowercase tags.

## Light and dark

Every page supports both schemes. There is no syntax for it.

| Part | Behaviour |
|---|---|
| Default | The page follows the reader's system setting, through `<meta name="color-scheme" content="light dark">` and `light-dark()` colour tokens in `style.css`. |
| Toggle | A button at the top right switches to the scheme not on screen. A choice that differs from the system setting is stored in `localStorage` under `color-scheme`. Switching back to the system scheme removes it. |
| Scripts | One line in `<head>` applies the stored choice before the page paints, and one short script at the end of `<body>` handles the button. In a page without a diff switch or Svelte, they are the only JavaScript, about 860 bytes. |
| Without JavaScript | The page still follows the system setting. The toggle has no effect. |
| Diagrams and code | `style.css` recolours the `house.d2` palette and the D2 default colours, and Pierre's code follows the page scheme [@style; @housed2]. A diagram colour outside that palette keeps its light value. |
| Print | Always light. The button is hidden. |

## Build failures

Each failure prints `build: <message>` and exits with code 1. Where the source has a line, the message starts with `<file>:<line>:`.

| Condition | Message contains |
|---|---|
| No path given, a file that is not `.md` or `.svx`, or a file that cannot be read | `usage:`, `must be a .md or .svx file` or `cannot read` |
| No `#` heading | `no H1` |
| Frontmatter that is not a YAML mapping | `frontmatter must be a YAML mapping` or `frontmatter is not valid YAML` |
| `eyebrow`, `lede`, `meta` or `type` that is not a string | `frontmatter "<key>" must be a string` |
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
| A `[@key]` citation with no bibliography | `citations need a bibliography: add <doc>.bib` |
| A citation whose key is not in the `.bib` file | `unknown citation "@key"` |
| A `.bib` entry that nothing cites, at its line in the `.bib` file | `source "key" is never cited` |
| A `.bib` file that does not parse | `bibliography does not parse:` and the parser's message |
| `bibliography` that is not a string, or names a file that does not exist | `frontmatter "bibliography" must be a string` or `cannot read bibliography` |
| A `diff` block without file headers, language or path | `needs a language or a file path` |
| A `diff` block whose hunks do not match their `@@` line counts | `diff does not parse` |
| A `\|md` label in a `d2` block | `d2 uses a \|md label` |
| A diagram without an italic caption | `diagram has no caption` |
| A diagram caption over 10 words or with a full stop | `diagram caption is a sentence` |
| A `d2` block without a `#fig:<name>` label | `diagram has no label` |
| A label that is not `#fig:<name>` | `is not #fig:<name>` |
| Two diagrams with the same label | `is already used at line` |
| A `[@fig:<name>]` with no diagram of that label | `unknown figure "@fig:<name>"` |
| A diagram that nothing refers to | `is never referenced` |
| A figure number typed in prose, such as `Figure 2` | `is a figure number typed by hand` |
| A `d2` block that is never closed | `unclosed d2 code fence` |
| A `d2` block that does not compile, or no `d2` on the path | `d2 failed for the diagram` or `cannot find the` |
| A `.svx` document that is not valid Svelte, such as one with two `<script>` blocks | The Svelte message, such as `A component can have a single top-level <script>`, at its file, line and column |
| A `.svx` component that throws while the page prerenders, such as an undefined variable | `the page threw while prerendering`, with the error. It has no line. |
| A `script`, `link`, `img`, `iframe`, `source`, `video` or `audio` tag that loads an `http(s)` URL, a CSS `url()` with one, or an `@import` | `external resource` |

A normal link to a web page is not an external resource and builds fine. If the first run cannot install the app's dependencies, the build prints `bun install failed` with the app's folder.
