# Details

The core rules make a screen correct. These make it look designed. Run them as their own pass, after the screen works, on screenshots rendered at 2x device scale and cropped to one region at a time (header, one row, one card, one chart). A full-page screenshot hides every problem on this page.

## Alignment

Measure it; never judge it from a screenshot. Call the Skill tool with "measure-ui" and run its alignment branch on each region at every target width. It must report no text edges 1 to 8 px apart, no control with unequal padding, and no icon off its text's centre. A section title, a form label and the rows below them share one left edge; the last chart label and the column of values share one right edge.

## Identity

- Neutrals have a temperature: tint the gray scale slightly warm or cool, and keep one temperature across the scale. Pure Tailwind gray with default blue reads as having no point of view even when every other rule passes.
- Pick the accent hue on purpose, from the product's domain or personality, not the framework default.
- The logo and wordmark are drawn, not a default icon in a colored square next to bold text.
- Give each typeface a role. A mono face suits anything the user copies or types (short links, IDs, keys, slugs, domains); the sans carries everything else. Use the fallback stack only when the intended font cannot load.

## Lines

- Keep a line budget: every border must be the only thing separating two areas. Remove a border when space, a tone change or a shadow already separates them.
- No row dividers in a list; separate rows with spacing, hover tone and group headings. No rule under a table header.
- A top bar gets a border or shadow only after the page scrolls.
- A panel edge can be a 1 px shadow ring at low alpha (about 7%) instead of a solid border.
- An invalid field turns its focus ring red, not the accent.

## Composed controls

- Fields that submit together are one control: one frame, each segment labelled inside the frame, a hairline divider between segments, the submit button inside the frame. Two neighbouring fields filled or framed differently read as two unrelated components.
- A select inside a field hugs its current value (width fits the value plus the chevron), so no gap opens before the next text.
- Inner radius = outer radius minus padding. Rows inside a padded, rounded panel are inset and rounded to match.
- Leave keyboard hints out of buttons unless the shortcut is the point; a hint box inside a primary button is clutter.

## Repeated row actions

- An action repeated on every row (copy, open, more) is an icon button, visible at rest in the quietest tone, stronger on row hover or focus, with a tooltip. A bordered labelled button repeated down a column is noise. This is the exception to "labelled button beats icon button" in the click-cost rule.
- Feedback never shifts layout: swap the icon for a check and float a short "Copied" bubble, instead of a label that changes width.

## Tables and headers

- Column headers: small (about 11 px), uppercase, letter-spaced about 0.06em, in the quietest text tone. Group headings (dates, sections): 12 to 13 px, semibold, a darker tone. Headers and group headings must look different.
- Each header aligns to its cells: right-aligned numbers get right-aligned headers. A sort arrow on a right-aligned column hangs outside the label so the text still lines up with the numbers.
- Header text fits its column on one line; shorten the wording ("30 days", not "Last 30 days").
- A group heading sits close to the first row it labels. The space above it is larger, but no more than about a quarter of a row's height.
- A group with one row merges into the next (older) group, or into the previous one when it is last.
- Rows in a data list are compact: aim for 10 or more rows above the fold on a 900 px tall window.
- Leave a gutter of at least 24 px between truncated text and the next column.
- A row's trailing icons are centred on the row's whole text block, not on its first line.
- On phones, a row that opens a detail view shows a chevron.

## Numbers and small charts

- Big numbers: tabular figures, slightly negative tracking (about -0.03em), and a change badge aligned to the number's cap height and sized to sit beside it.
- Sparklines plot a trailing average (about 7 days) or weekly bins, starting from the day the item was created. Raw daily data with a weekday rhythm turns into a zigzag at sparkline size.
- Sparklines: the accent color, a 1.5 px stroke, a faint same-hue area fill, an end dot of 2 px radius or less. A series with no activity is a dashed muted baseline, not a flat solid line that looks broken. Inactive or expired items get a muted stroke.
- Inline bars in a list: a thin track (about 3 px) under the label, with the value and the share on the right. The track starts under the row's leading icon or code, not under the label, so the icon sits on top of its bar and the row reads as one unit. Keep that icon small (about 12 px, or 10 px text for a code) so it does not outweigh the label. A full-height tinted bar behind a row reads as a selected row.
- Chart axes: two or three gridlines in the quietest tone. An area fill is a same-hue gradient strong enough to see (about 16% at the top).
- A comparison is honest about partial periods: a chart for one item starts on the day it was created, and when the previous period predates the item, show "New" instead of a percentage drop.
- A filter or setting that changes the numbers shows its state next to them (for example "bots excluded", linked to the setting), not in a settings page alone or an orphaned legend row.

## Balance and copy

- No unexplained gaps: a side panel ends near where the main column's first screen ends, a header's middle has a job (search, the page's title) or is narrower. Fill a gap with something that answers a user question, or shrink the layout.
- A line that wraps to leave one orphan word gets shorter wording.
- Labels, buttons and empty states name the thing: "Create link", "No links match 'pod'", "1 click", never "1 clicks" or "Submit".

## Platform polish

- Gate hover styles behind `@media (hover: hover) and (pointer: fine)` so taps do not leave hover stuck.
- Actions started from the keyboard do not animate; the user is already watching the result.
- Phone inputs use at least 16 px text so the page does not zoom on focus. Set a `theme-color` meta tag per color scheme.

## Where to go further

For component craft, easing and the invisible touches, call the Skill tool with "emil-design-eng". For the full scale and review checklist, call it with "refactoring-ui" and answer all 40 questions against the 2x crops. For worst-case content (very long names, 1,284,977 clicks, exactly 1 click, one-letter names), call it with "break-ui".
