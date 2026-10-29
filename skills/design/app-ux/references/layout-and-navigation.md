# Layout and navigation

## App shell

- The standard layout: a top bar with global actions, a sidebar with navigation, the content in the center. Users already know it. Skip the sidebar when navigation is only browse and search, and give the space to content.
- Information flows top to bottom and left to right. The most important content sits top left and is visible without scrolling. A tall decorative header that pushes content below the fold fails.
- Drop headers and labels that announce the obvious ("Dashboard", "Welcome to your financial overview").

## Sidebar

- Holds persistent, global items: navigation, account, often search.
- Each link has an icon and a short label, so it can collapse to icons and carry badges. Links are ghost buttons that get a background on hover.
- Group links by relevance. Settings and Help sit at the bottom. Exactly one item shows the active state.
- Secondary destinations (team settings, domains, billing, usage) do not get top-level links. They go in the account popover or as tabs on one settings page.
- Before adding a sidebar link for content related to an existing page, use tabs on that page instead.

## Choosing a container

| Container | Use for | Must have |
| --- | --- | --- |
| Popover | Light, non-blocking options (display settings, account menu, filters) | Its primary action first; closes on outside click with no consequence |
| Modal | A short task tied to the current screen (create an item) | Explicit confirm and cancel; a toast after it saves |
| Drawer or slide-out panel | Detail or preview of a selected item while the list stays visible | A close control; does not block the list |
| Toast | Telling the user something without asking anything | Undo or retry when relevant |
| Page | Large or permanent context (an item's full detail) | A back button or breadcrumb |
| Bottom sheet (mobile) | A choice in the middle of a task | A title, search if the list is long, confirm and close, swipe down to dismiss |

## Actions on items

- Actions shown on an item fit that item. A credit card offers "lock card", not "receive money". List each widget's actions and check every one applies to the object.
- On a dense row or card, show the one or two frequent actions and put rare ones in an overflow menu. Secondary row actions may appear on hover only if they also have a keyboard path and a tooltip.
- Visible item actions on a selected item (copy, share, delete) sit in a floating bar next to it rather than in a menu.
- Repeated cards that lead to the same kind of page make the whole card the link and show an arrow on hover. An identical "Learn more" button on every card fails.
- Selecting rows reveals a bulk action bar; it is hidden when nothing is selected.

## Icons

- One icon library, one stroke width, one fill style per region.
- An icon with no label is allowed only for universally known meanings (home, search, close, settings, user, bookmark). Every other icon-only button has a tooltip and an `aria-label`.
- Icon size matches the line height of the text beside it.

## Search

- Search is visible wherever there is more content than one screen holds.
- An active search shows the query, the result count, a clear (X) control and a way back to the full list.
- A no-results state repeats the query, suggests corrections and offers a way out.

## Spacing and edges

- Space between related items is smaller than space between groups: a heading sits close to its subtext and farther from the buttons below.
- Lists separate rows with one method, usually space plus a hover tone; group headings (by date or status) replace dividers. Use a subtle alternating background for dense tables. If dividers are unavoidable, they span the content column, not the full window.
- A setting that changes numbers on screen (exclude bots, currency, time zone) is shown and linked next to those numbers, as well as living on the settings page.
- A long uniform list gets differentiation (grouping by date or status, avatars for people, chips for categories) instead of more padding.
- A dashboard uses a strict grid; leave no unexplained empty cell.
- Lists with content below them (a footer, more sections) use "Load more" or pagination instead of infinite scroll. Feeds with nothing below may scroll infinitely.
