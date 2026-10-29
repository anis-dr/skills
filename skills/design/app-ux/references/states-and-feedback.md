# States, feedback and flows

## Feedback

- A click changes the screen in the same frame: pressed style at once, then a disabled or loading state if the result takes time. A slow transition with no feedback reads as a click that did nothing.
- After a success, show it where the user will look: a filled icon, a count or dot on the tab where the item went, a toast.
- Copy buttons swap their icon or label to a check for about two seconds, or show a toast.
- Every keyboard shortcut causes a visible change. A shortcut with no visible effect reads as broken.
- A toast that follows an async action can move from loading to success in place.

## Destructive and irreversible actions

Choose by reversibility, not by the word "delete".

| Action | Pattern |
| --- | --- |
| Reversible (delete a row, archive, move, edit) | Act at once; toast with Undo, long enough to reach (5 s or more), or a trash that purges after a set time such as 30 days |
| Irreversible or external (send money, email a list, delete an account) | Confirm dialog that states the scale and names the action on its button ("Delete 3 projects", not "OK") |
| Irreversible and frequent on mobile (pay, send) | Slide-to-confirm control |

In a confirm dialog, the destructive button is red and labelled with the action; the cancel button is the neutral default.

## Saving

- Fields and toggles save on change, with a saved indicator. Editors autosave and offer undo or version history.
- A form that creates something (not a settings page) keeps an explicit submit button whose label names the result ("Create link").

## Pointer intent

- Action buttons fire on release (`click`, `pointerup`), never on press, so dragging away cancels. Menu triggers may open on press so press, drag and release on an item works in one motion.
- Hover submenus stay open while the pointer moves diagonally toward them. Headless menu libraries do this; hand-rolled hover menus usually do not, so prefer the library.
- Tooltips wait before the first one shows (about 500 ms); once one is open, neighbouring tooltips show at once.
- An element with both single click and double click delays the single click to wait for the second. Only pay that delay when the two actions conflict; otherwise give the second action its own control.
- Drag to reorder shows where the item will land, and auto-scroll speeds up the closer the pointer is to the edge.

## Flows

- Draw the screens as a sequence before building one. Ask how the user got here and what they need next.
- After a create, offer the dependent next step inline (created a workspace, now invite members) with a Skip.
- Every choice screen has an escape: a way to enter an option that is not listed, and a skip or "none" for users it does not apply to.
- Branch onboarding on answers that change later steps: a solo user never sees "invite your team".
- A signup screen links to login, and the reverse. Decide whether an unverified email blocks the user or only reminds them.
- Onboarding shows one hint on the most important action, then the next, or a small corner checklist. It never opens with a modal of bullet points.

## Forms

- Labels sit above inputs and stay visible while typing. Placeholders show an example value.
- Errors appear next to the field, in red with a message saying how to fix it, and keep the user's input.
- Collapse advanced options by default.
- A multi-step form shows progress and which step the user is on.
- Choose the container by the form: a modal for a short create form tied to the current screen; a page for a long one. A drawer or flyout with three fields and a lot of empty space looks unfinished.
