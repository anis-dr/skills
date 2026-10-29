# Mobile, desktop and motion

## Phone screens

- An app with one or two destinations has no bottom bar; give the space to content and the primary action.
- Primary navigation is a bottom bar of 3 to 5 destinations, 3 or 4 ideally. Spread the items across the full width so each tap area spans its cell (at least 44 px). Every tab has an active (filled) state. Use the user's photo for the profile tab when they have one.
- Do not give "add" a large center button unless creating is the user's main daily action.
- Add captions under tab icons when any icon is ambiguous, and keep inactive icons and captions legible.
- With too many destinations for a bottom bar, make navigation a home page that lists sections with counts or recent items.
- Do not shrink type or spacing for mobile. Keep the desktop scale or go larger (iOS body text is 17 px), and show less content instead.
- Each section scrolls on one axis: a vertical stack, or a horizontal row that runs off the edge. Never a grid that needs both.
- One screen does one thing. Home may combine; settings is only settings and an editor is only an editor. A new need gets a new screen or a sheet.
- Controls change with context: opening an item hides the tab bar and shows that item's actions at the top.
- Mid-task choices open in a bottom sheet with a title, search when the list is long, confirm and close, and swipe-down to dismiss.
- Design two empty states: first use (points at the create action) and no results (repeats the query, suggests alternatives, offers a way out).
- Mobile has no hover: give pressed states a darker fill so a tap feels registered.

## Gestures

- A gesture is a shortcut, never the only path. Each swipe or long-press action also has a visible button or menu item.
- Teach gestures the first time they matter (a hint or a short animation).
- Long-press opens a context menu: blur the rest, scale the pressed item slightly, list its actions.
- Carousels show their position (dots or "3 of 8") on a plate that stays legible over any image.

## Desktop windows (native, Electron, Tauri)

- Keep about the top 50 px of a frameless window free for dragging. Fit the window controls into the top bar or sidebar.
- A new install opens on an empty state that invites the first action, with filters and toolbars hidden until content exists. Item detail appears when an item is selected.
- The window is a frame for the user's content: content gets most of the area and chrome stays plain.
- Show keyboard shortcuts next to the buttons and menu items they trigger, and list them all on one shortcuts page.
- Support drag and drop both ways: drop files into the app, drag items out to other apps. Offer a share button too.

## Motion

- Every animation explains a change or saves space: a panel sliding out from where it was triggered, a search field expanding on focus, a card growing into the detail page. Remove animation that explains nothing. Never hijack scrolling.
- No linear easing except for progress bars and loops. Use ease-out for entering, or a spring for things the user drags or flicks.
- Keep the shared element continuous across a navigation: the tapped image becomes the hero of the next screen instead of a blank page sliding in.
- On mobile back navigation, the page underneath moves at a fraction of the top page's speed (about 35%). A sheet that rises scales the page behind it down slightly, and reverses on dismiss.
- Buttons scale down slightly on press.
- Looping decorative animation has a pause control and respects reduced-motion settings.

For motion values and craft beyond these rules, call the Skill tool with "emil-design-eng"; for gestures, sheets and springs, call it with "apple-design"; for web apps on phones, call it with "mobile-native".
