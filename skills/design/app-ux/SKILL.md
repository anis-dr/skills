---
name: app-ux
description: "Use when building or reviewing application UI (SaaS screens, dashboards, tables, forms, settings, modals, mobile or desktop app screens, AI chat features), or when a screen looks agent-generated: actions buried in menus, missing empty/loading/error states, confirm modals everywhere, decorative KPI cards, nested cards, rainbow accents, emoji icons. Gives click-cost and state rules, the tells of generated UI with their replacements, and per-surface references for navigation, data display, color and type, mobile and desktop, and AI features."
---

# App UX

Rules for the screens of an application, distilled from Kole Jain's UI/UX videos (YouTube, @kolejain). They target what coding agents get wrong most: a screen that looks finished in one screenshot and falls apart once someone uses it. This skill decides what goes on a screen, where it sits and how it responds. For spacing, type and shadow scales, call the Skill tool with "refactoring-ui".

## Steps

1. **Name the job.** Write one sentence: who uses this screen and what they came to do. List the three to five actions they take most often, ordered by frequency. Every later decision is measured against this sentence and list.
2. **Open the matching references** from the table below. Open every one whose trigger fits the screen.
3. **Build or review** against the core rules and the opened references.
4. **Render and look.** Screenshot the running screen at its target width with realistic data, then with no data, then in its loading and error states. Reach each state the way the app does (empty fixture, delayed or failing request stub); if the app has no way into a state, that missing state is a finding. For worst-case data (long names, huge counts), call the Skill tool with "break-ui". Judge the screenshots for layout and hierarchy; read the code for behaviour a screenshot cannot show (what a click does, undo, autosave, hover and focus styles).
5. **Details pass.** A correct screen is not yet a designed one. Open [details.md](references/details.md) and run it on 2x screenshots cropped to one region at a time, until no crop shows a stray line, a misaligned header, a default-looking color, or a control that looks like two components.
6. **Report.** Reviewing: one row per broken rule with the element, the rule and the concrete fix. Building: list the states you implemented and the click cost of each frequent action. In both, list the rules you could not check from what you had (product-wide repetition, timing, real network rollback) instead of passing them silently.

Done when every core rule and every rule in the opened references has been checked against the rendered screen and the code, or listed as uncheckable, and each failure is fixed (building) or reported with its fix (reviewing).

| Reference | Open when the screen has |
| --- | --- |
| [states-and-feedback.md](references/states-and-feedback.md) | async actions, deletes, saves, forms, onboarding or multi-step flows |
| [layout-and-navigation.md](references/layout-and-navigation.md) | navigation, menus, modals, drawers, popovers, cards, search |
| [data-display.md](references/data-display.md) | tables, lists, charts, KPI or stat cards, a dashboard |
| [color-and-type.md](references/color-and-type.md) | color or font choices, dark mode, chart colors, gradients, shadows |
| [mobile-and-desktop.md](references/mobile-and-desktop.md) | phone layouts, gestures, sheets, native or Electron windows, keyboard shortcuts, motion |
| [ai-features.md](references/ai-features.md) | a prompt input, chat, generation, history or memory |

## Core rules

### Click cost

An action's visibility matches how often it is used. From most to least visible: labelled button, icon button, overflow menu or hover reveal, another page.

- The screen's frequent actions (step 1) are visible and one click from the default state. They are never only in an overflow menu, on hover, or on another page.
- An action repeated on every row of a list is the exception: a quiet icon button with a tooltip, stronger on row hover. A labelled button repeated down a column is noise.
- Rare actions move down the scale. Collapsing into a menu is the last fix for crowding: first cut actions and re-lay out.
- A small task happens in place (popover, inline edit, sheet) rather than on a new page.
- Check: count clicks from the default state to each frequent action. More than one fails unless the step-1 sentence justifies it.

### Every state exists

- **Empty**: one short message and one primary action that creates the first item. Filters, sorting and toolbars stay hidden until there is content to act on.
- **Loading**: a skeleton shaped like the content, or streamed output. Never a blank area.
- **Error**: what failed and a retry. Warnings and errors use toasts or inline messages the user cannot miss.
- **Success**: a toast or a visible change in place.
- Buttons have hover, pressed, disabled, loading and focus-visible styles. Inputs have focus and error (red border plus message) styles. Every click changes something on screen immediately.

### Reversible beats confirmed

- A reversible action (delete a row, archive, move) happens at once and shows a toast with Undo, or moves the item to a trash it can be restored from.
- A confirm dialog is only for irreversible or external actions (send money, email a list), and it states the scale: "Email 10,000 recipients".
- Settings save on change and show a saved indicator. Simple toggles and fields have no Save or Cancel buttons.
- The UI updates before the request returns (optimistic UI) and rolls back with an error toast on failure.

### One container level

- Never put a card in a card or a border inside a border. Group with space, section headings and shared edges.
- Align elements to a few shared left and right edges: text hard left, values and prices hard right. Center only text that is not read (badges, icons).

### Color carries meaning

- Neutral surfaces carry the structure; one accent hue marks the primary action and the active item.
- Default states are gray. Color goes only to what differs from the default, is active, or needs action.
- Status colors are fixed regardless of brand: red destructive, green success, amber warning. Icons are neutral unless they show status or the active item.

### Data shapes the component

- Pick the component from the data: a fixed set of values is a chip, a number is right-aligned, a time sequence is a timeline or chart, part-to-whole is a donut, in versus out is a diverging bar.
- Every widget answers a question the user has. Delete cards and buttons that neither act nor inform. Show each metric on one screen only.

### Hierarchy by rank

- Rank a card's or screen's elements by importance before styling them. Exactly one element is most prominent; the rest step down by weight and color, not only size.
- Say each thing once. Drop a title, label or caption that repeats what the screen already makes clear (a "Links" heading over the only list of links, "Dashboard" on the dashboard). Repeat information only when the user would be confused without it.
- Drop "Label: value" rows when the value explains itself (a price, a date, a name). Keep labels where two values could be confused (check-in and check-out).

## Tells of generated UI

Each tell on the left gives a screen away as generated. Replace it with the right column.

| Tell | Replacement |
| --- | --- |
| Emoji as icons | One icon library with one stroke width |
| Each card or icon in its own bright hue; saturated or gradient page background | Neutral surfaces, one accent hue |
| The same KPI tiles on several screens; a KPI tile whose only extra is an icon | Each metric on one screen, as a value plus a trend sparkline |
| Cards and buttons that do nothing | Delete them |
| Gradient circle avatar with an initial, account links loose in the sidebar | An account card that opens a popover with settings, billing and sign-out |
| Smooth curved chart line, faded latest data, no axis | Straight segments, gridlines, axis labels, latest point at full opacity |
| Confirm modal on every delete | Immediate delete with an Undo toast |
| Save and Cancel on a settings page | Autosave with a saved indicator |
| Placeholder used as the label | A persistent label above; the placeholder shows an example value |
| A modal explaining the whole product on first login | One hint pointing at the first action, or a small checklist |
| Filters and toolbars shown over an empty list | An empty state with one action |
| Every action collapsed into a "⋯" menu | Frequent actions visible; the menu holds only rare ones |
| Cards nested in cards, three stacked corner radii | One container level |
| Pure black text on white, secondary text in the same color | Three text tones (see color-and-type.md) |
| Dark mode made by inverting the light palette | A separately tuned dark palette (see color-and-type.md) |
| Linear easing | Ease-out or a spring |
| A desktop layout squeezed onto a phone: shrunk text, two-axis grids | See mobile-and-desktop.md |
