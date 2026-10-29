# Color and type

Values that coding agents get wrong in app UI. For the general scales (spacing, type sizes, shadow elevations), call the Skill tool with "refactoring-ui".

## Neutrals first

Define the neutral set before any accent. A product UI needs about:

- 4 background layers (page, sidebar or shell, card, raised or hover)
- 1 or 2 border colors
- 3 text tones

In light mode:

- Pure white is a valid page background. White cards on a white page are not: pick one pairing and keep it (gray page with white cards, or white page with slightly darker cards).
- The shell (sidebar) differs from the content by only about 2% lightness, or a faint tint.
- Card edges are a light gray border (about 85% lightness), not near-black and not a faint shadow alone.
- Text: headings very dark gray (about 11% lightness, not #000), body 15 to 20%, secondary 30 to 40%. Secondary text can also be the body color at about 55% opacity at the same size.

## Accent

- One accent hue, built as a 50 to 950 ramp. Light mode: main 500 or 600, hover 700, links 400 or 500. A neutral-only product with no accent is valid.
- Hover is a neighbouring step of the same hue (darker in light mode, lighter in dark mode). Pressed is one step further. Disabled is desaturated: light gray fill with white text works in both themes.
- Hover and pressed fills on neutral controls (menu items, ghost buttons, row actions, rows) are translucent overlays, not opaque grays: black at about 5% and 8% in light mode, white at about 6% and 10% in dark mode. An overlay follows whatever it sits on, so the same state reads right on the page, inside a raised menu and on a selected (tinted) row. An opaque gray tuned for the page turns darker than a raised menu in dark mode and looks like a gray patch on a tinted row.
- Button fill darkness follows importance: ghost lightest, secondary between, primary darkest. Secondary plan or action buttons use an outline so the primary keeps its weight.
- Cards that take the brand color use a light tint with dark text, not the saturated color.
- A background tinted toward the accent (Tailwind: background 50 with accent 500 in light mode; background 950 with accent 300 in dark mode) is fine when the accent was chosen on purpose. A saturated default blue or purple page is the generated look.
- Status colors stay fixed even off-brand: red destructive, green success, amber warning. Notification badges may use the brand color.
- Check contrast on every colored surface: 4.5:1 for normal text.

## Gradients and shadows

- Default to no gradient. If one is needed, use two tones of the same hue.
- Shadows are low opacity with a large blur. Popovers and menus get a stronger shadow than cards. A shadow you notice first is too strong.
- In dark mode, shadows do not read: show elevation with lighter surfaces.

## Dark mode

Tune it separately; never invert the light palette.

- Spread surface layers about twice as far apart as in light mode (4 to 6% lightness steps instead of about 2%), because dark values look alike.
- Raised surfaces (cards, popovers, menus) are lighter than the page below them, each layer slightly lighter and less saturated.
- Dim body text and lower border contrast. Keep pure white for the few most important items.
- Use lighter accent steps (primary 300 or 400, hover one step lighter: 200 or 300) and desaturate the accent and chips slightly.
- Follow the system theme setting by default.

## Chart colors

Series colors share one perceived lightness and chroma in OKLCH and step the hue by about 25 to 30 degrees per series. Equal HSL values do not work: bright green looks far louder than bright blue at the same numbers.

## Theming a neutral palette

To tint neutrals toward a theme hue: convert each neutral to OKLCH, lower lightness by about 0.03, raise chroma by about 0.02, and set the hue to the theme's hue.

## Type

- One sans-serif family for the interface. A second family (a display face or a mono) only for a clear role; never a display or handwritten face for small text.
- Rank text elements first (title, subheading, body, caption), then style by rank with weight and color as well as size. Subheadings are bolder than body; body stays at full contrast; weights stay between about 300 and 800.
- Headings above about 32 px get negative tracking (about -2 to -3%) and line height of 110 to 120%. Body line height about 150%.
- Derive sizes from a ratio: base 16 px with a ratio of about 1.27 for general UI, about 1.17 for dense UI (dashboards, mobile).
- Small text (labels, captions) gets no negative tracking.
- Chips are thin: vertical padding a half or a quarter of the horizontal padding (20 px horizontal gives 10 or 5 px vertical). A chip as tall as a button reads as a button.
