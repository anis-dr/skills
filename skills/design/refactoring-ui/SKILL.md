---
name: refactoring-ui
description: Use when designing or reviewing web UI (screens, components, spacing, type, color, shadows, images) to apply the distilled Refactoring UI rules, numeric scales and a 40-question review checklist.
---

# Refactoring UI, distilled

Refactoring UI (Adam Wathan and Steve Schoger) distilled for an agent that designs and reviews web UI. Figures are described, not reproduced.

## How to use

Apply when drawing a screen, building a component, choosing tokens (spacing, type, color, shadow), or reviewing a screenshot or a diff that changes visual output.

Designing: read the matching chapter and pick values from the scales below instead of inventing them.

Reviewing: open the screen at mobile and desktop widths, run the Review checklist top to bottom, and report each "no" as a finding: element, rule broken, concrete fix. Report rule breaks, not taste.

## Starting from Scratch

### Start with a feature, not a layout

Design a real piece of functionality before the shell around it.

- Nav, sidebar and container width cannot be decided until a few features exist.
- Start with the fields and button of one flow (the book's example: a flight search form) drawn alone on a blank page. The shell may turn out barely needed.

### Detail comes later

Decide layout and hierarchy first; typefaces, shadows and icons can wait.

- Work at low fidelity early; a thick marker on paper makes fussing over detail impossible. Sketches are disposable.
- Design in grayscale so spacing, contrast and size carry the hierarchy; add color once the gray version reads well.

### Don't design too much

Design the next feature in a simple form, build it, then design the next one.

- Edge cases are easier to solve in a working UI than in imagination.
- Never draw functionality you are not ready to build (the book's example: an attachments area that stalls the whole comment feature). Ship the smallest useful version; nice-to-haves come later.

### Choose a personality

Pick the feeling on purpose, then express it with a few concrete levers.

- Typeface: serif for elegant or classic, rounded sans for playful, neutral sans when other elements carry the personality.
- Color: blue reads safe and familiar, gold reads expensive, pink reads fun. Trust how a color feels over color psychology.
- Border radius: small is neutral, large is playful, none is formal. Never mix square and rounded corners in one interface.
- Language: formal wording feels official, casual feels friendly.

### Limit your choices

Define a small set of allowed values in advance and pick from it, never from the full range.

- Unconstrained choices (12px or 13px, 10% or 15% shadow) are agony because all of them are fine.
- Choose from 8 to 10 preset shades of a color and from a fixed type scale, not the picker.
- Decide by elimination: guess a value (16px), compare with its scale neighbors (12px and 24px). If both look wrong, done. If one wins, repeat with it in the middle.
- Systematize every value you keep re-deciding: sizes, weights, line heights, colors, spacing, shadows, radii, border widths, opacity.

## Hierarchy is Everything

### Not all elements are equal

Hierarchy, how important things look relative to each other, does more for "looks designed" than any styling.

- Figure: the same card twice, same layout, font and colors; only secondary text was quieted, and the second looks finished.

### Size isn't everything

Use weight and color for hierarchy, not only font size.

- Two or three text colors: dark for primary, gray for secondary (a date), lighter gray for tertiary (a footer notice).
- Two weights: normal (400 or 500 depending on the font) for most text, heavier (600 or 700) for emphasis.
- No weights under 400 in UI text; they only work for large headings. To de-emphasize, use lighter color or smaller size.

### Don't use grey text on colored backgrounds

On a colored background, de-emphasize text by moving it toward the background color, not by making it gray.

- White at reduced opacity looks disabled, and over an image the background shows through.
- Hand-pick a color: keep the background hue, adjust saturation and lightness until the text sits back without fading.

### Emphasize by de-emphasizing

When the main thing will not stand out, quiet its competitors instead of shouting louder.

- Figure: an active nav item in a different color still gets lost until the inactive items get a softer gray.
- At page scale: a sidebar that fights the content should lose its background color.

### Labels are a last resort

Show data in a way that explains itself; add labels only when format and context fail.

- Formats speak (an email, a price); context speaks ("Customer Support" under a name in a directory).
- Fold the label into the value: "12 left in stock", "3 bedrooms".
- When you must label (dashboards, stat grids) make the label secondary: smaller, lower contrast, lighter weight, or all three.
- On dense reference pages where users scan for the label (a spec sheet: "depth", not "7.6mm"), emphasize the label instead, but keep the value readable: darker label, slightly lighter value.

### Separate visual hierarchy from document hierarchy

Choose the HTML element for meaning and style it for the hierarchy the screen needs.

- An h1 page title is semantically right and usually too big; section titles often act as labels and should be small.

### Balance weight and contrast

Heavy elements need lower contrast; low-contrast elements can gain weight.

- Bold and solid icons are heavy because they cover more surface; soften an icon's color so it does not outweigh the text.
- The reverse: a 1px border in a soft color that is too faint gets harsh when darkened; widen it and keep the soft color.

### Semantics are secondary

Style actions by their place in the hierarchy, not only by what they mean.

- Primary: solid, high-contrast fill. Secondary: outline or low-contrast fill. Tertiary: styled like a link.
- Destructive is not primary. A delete that is not the main action gets secondary or tertiary treatment; the big red button belongs on the confirmation step where deleting is the primary action.

## Layout and Spacing

### Start with too much white space

Give elements far more room than feels necessary, then remove until it looks right.

- Dense UIs (dashboards) are fine when density is a decision, not the default.

### Establish a spacing and sizing system

Pick sizes and gaps from one predefined scale whose steps grow as values grow.

- A linear rule ("multiples of 4px") fails because 4px is 33% at 12px and 4% at 500px. Keep adjacent values at least about 25% apart.
- Base on 16px (browser default font size). The book's scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 640, 768 px.

### You don't have to fill the whole screen

Give each element the width it needs, even on a 1400px canvas.

- If content needs 600px, use 600px; margins hurt nothing. Sections need not be full width because the nav is.
- Stuck on a small interface in a big canvas? Design at about 400px first, then widen and adjust only what felt compromised.
- A narrow form unbalanced in a wide page: add a column of supporting text rather than widening the form.

### Grids are overrated

Fixed widths for things that should not scale; fluid widths only where scaling is wanted.

- A 12-column grid is widths in multiples of 8.33%. A 25% sidebar grows uselessly on wide screens and collapses on narrow ones; give it a fixed width and let the content area flex with its own internal grid.
- Do not shrink an element until you must: a login card at 6 columns on large and 8 on medium ends up wider on medium than on large. Use a max-width (say 500px) and shrink only below it.

### Relative sizing doesn't scale

Large things must shrink faster than small things, so define sizes independently, not as ratios.

- An 18px body with a 45px (2.5em) headline is fine on desktop; at 14px body on mobile 2.5em gives 35px, far too big. A good mobile headline is 20 to 24px, about 1.5 to 1.7 times the body.
- Same inside a component: a button with 16px text, 16px horizontal and 12px vertical padding should get proportionally more padding when large and tighter when small, not padding in em.

### Avoid ambiguous spacing

Put more space around a group than inside it.

- A form where the gap under the label equals the gap under the input does not show which label belongs to which field; widen the gap between groups.
- Same failure: too little space above headings, list items spaced like line height, horizontal icon-plus-text pairs with even gaps.

## Designing Text

### Establish a type scale

Use a hand-picked list of font sizes in px or rem, never em.

- Modular ratios (4:5, 2:3, 1:1.618) give fractional sizes (31.25, 39.063, 48.828px) that browsers round differently, and too few UI steps (12, 16, 21, 28 leaves gaps you will want).
- The book's scale: 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72 px. It aligns with the spacing scale.
- em is relative to the parent, so 0.875em inside 1.25em computes to 17.5px, off the scale. Use px or rem.

### Use good fonts

Pick a neutral sans with many weights, or lean on what popular lists and sites you admire already chose.

- Safe default: a neutral sans (Helvetica-like) or the system stack: -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue.
- Skip families with fewer than five weights; filtering Google Fonts to 10+ styles leaves under 50 sans-serifs.
- For body and UI text avoid condensed faces with short x-heights; those were drawn for headlines.

### Keep your line length in check

Keep paragraphs between 45 and 75 characters per line.

- In CSS that is a max-width of roughly 20 to 35em. Above 75 is risky.
- Beside wide images, keep the paragraph narrow anyway.

### Baseline, not center

Align mixed font sizes on one line by their baseline, not by vertical centering.

- Centering looks off when a big title sits close to small text (a card title beside small actions).

### Line-height is proportional

Taller lines for small text and wide columns, shorter lines for large text.

- Long lines need more spacing to find the next line: narrow columns about 1.5, wide columns up to 2.
- Small text needs more line height; big headlines can use 1.0.

### Not every link needs a color

Only links inside prose need the full link treatment.

- Where most things are links, emphasize them with weight or a darker color; ancillary links can change only on hover.

### Align with readability in mind

Left-align by default; center only short blocks; right-align numbers.

- Text longer than two or three lines should be left-aligned. If one centered block is too long, shorten the copy.
- Right-align numeric table columns so decimals line up.
- Justified text needs hyphenation on.

### Use letter-spacing effectively

Leave letter-spacing alone except to tighten headlines and to open up all-caps.

- A body face (Open Sans) used as a headline can take negative letter-spacing to mimic a headline face (Oswald). The reverse, a headline face at small sizes, does not work.
- All-caps loses the ascender and descender variety that makes words scannable; add positive letter-spacing.

## Working with Color

### Ditch hex for HSL

Write colors as HSL so related colors look related in code.

- Hue is degrees on the wheel: 0 red, 120 green, 240 blue. Saturation: 0% gray, 100% vivid. Lightness: 0% black, 50% pure hue, 100% white.
- HSL is not HSB (100% brightness is only white at 0% saturation); browsers speak HSL.

### You need more colors than you think

A five-swatch palette cannot build a product; plan greys, one or two primaries and several accents, each in many shades.

- Greys: 8 to 10 shades from a very dark gray (not true black, which looks unnatural) up to white.
- Primary: one, maybe two, with 5 to 10 shades. Light tints serve as alert backgrounds, dark shades as text.
- Accents: a highlight for new features, red destructive, yellow warning, green positive, more if you must categorize (charts, tags). Several shades each, used sparingly.

### Define your shades up front

Build each color's shades by hand once; never generate them with lighten or darken at use time.

- Pick the base (500) first: for primaries and accents, a shade that works as a button background. There is no fixed lightness rule.
- Pick the edges next: darkest (900) as text, lightest (100) as a tinted background. An alert component exercises both, so design one to choose them.
- Fill the middle: 700 and 300 as midpoints, then 800, 600, 400, 200. Nine shades divide cleanly; five is the minimum.
- Greys: darkest is your darkest text, lightest a subtle off-white background.

### Don't let lightness kill your saturation

Raise saturation as lightness moves away from 50%, and rotate hue to change brightness without losing intensity.

- Saturation reads weaker at 90% lightness than at 50%, so far shades wash out unless it rises.
- Perceived brightness: sqrt(0.299 r^2 + 0.587 g^2 + 0.114 b^2). Yellow, cyan and magenta (60, 180, 300 degrees) are bright peaks; red, green and blue (0, 120, 240) are dark troughs.
- To lighten, rotate hue toward the nearest bright hue; to darken, toward the nearest dark hue. Yellow darkened toward orange stays warm instead of turning brown.
- Keep rotation under 20 to 30 degrees or the color reads as a different color.

### Greys don't have to be grey

Saturate greys slightly to set a temperature.

- A little blue makes greys cool, a little yellow or orange makes them warm. Amount is taste.
- Raise saturation toward the ends so the whole scale reads one temperature.

### Accessible doesn't have to mean ugly

Meet WCAG contrast without letting contrast dictate hierarchy.

- Normal text (under about 18px) needs at least 4.5:1; large text at least 3:1.
- White on a colored fill must be surprisingly dark to reach 4.5:1, which makes minor elements shout. Flip it: dark colored text on a light tint of the same color passes and stays quiet.
- Colored text on a colored panel: instead of pushing toward white, rotate the hue toward a brighter hue (cyan, magenta, yellow) to gain contrast while staying colorful.

### Don't rely on color alone

Color reinforces meaning; something else must carry it.

- Red and green metric deltas fail for red-green colorblind users; add an up or down icon or a sign.
- For chart lines, use light-versus-dark contrast of one hue rather than distinct hues.

## Creating Depth

### Emulate a light source

Light comes from above and viewers look slightly down, so raised things show a lit top edge and a shadow below.

- Raised: a slightly lighter top edge (top border or inset shadow with a small positive y offset, color hand-picked, since translucent white desaturates) plus a small dark shadow below with a small y offset and a couple of pixels of blur. Figure: a door panel, lighter on top, darker below.
- Inset (well, input, checkbox): a lighter bottom edge (bottom border or inset shadow with a negative y offset) and a small dark inset shadow at the top with a positive y offset. Figure: a cabinet panel with a shadow along the top lip.

### Use shadows to convey elevation

Shadow size says how far off the page an element sits, and closer things pull focus.

- Small for buttons, medium for dropdowns, large for modals.
- Five levels is plenty. Book's elevation scale (black at 20% alpha): 0 1px 3px; 0 4px 6px; 0 5px 15px; 0 10px 24px; 0 15px 35px.
- Use shadows for interaction: add one on grab so an item looks lifted for dragging; shrink or remove one on press so a button feels pushed in.

### Shadows can have two parts

A polished shadow combines a large soft one (direct light) with a small dark one (ambient occlusion under the object).

- Book's card example, as printed: 0 4px 6px hsla(0,0%,.7) plus 0 5px 15px hsla(0,0%,.1). The caption drops the lightness argument; read it as black at .07 and .1, which matches the card shown.
- The tight shadow fades with height. Five-level two-part scale: 1) 0 1px 3px .12 and 0 1px 2px .24; 2) 0 3px 6px .15 and 0 2px 4px .12; 3) 0 10px 20px .15 and 0 3px 6px .10; 4) 0 15px 25px .15 and 0 5px 10px .05; 5) 0 20px 40px .2 alone.

### Even flat designs can have depth

Flat UIs convey depth with color and hard shadows instead of blur.

- Lighter than the background feels raised; darker feels inset.
- A short, vertically offset shadow with zero blur lifts a card or button without breaking the flat look.

### Overlap elements to create layers

Let elements cross boundaries to create layers.

- Offset a card so it straddles two backgrounds, or make it taller than its parent.
- Overlapping images clash; give each an "invisible border" in the page background color so a gap always separates them.

## Working with Images

### Use good photos

Bad photography sinks a good layout.

- Hire a photographer or use quality stock (Unsplash is free). Never plan to swap placeholders for phone snapshots.

### Text needs consistent contrast

Fix the image, not the text, when a headline over a photo is unreadable.

- Overlay: translucent black tames bright areas for light text; translucent white tames dark areas for dark text.
- Or lower the image contrast and correct brightness.
- Colorize: lower contrast, desaturate, then a solid fill with multiply blend.
- Text shadow as a glow: large blur, no offset, plus a milder contrast reduction.

### Everything has an intended size

Icons, screenshots and logos only look right near the size they were drawn for.

- Icons drawn at 16 to 24px look chunky at 3x or 4x; keep them near their size inside a colored shape.
- A full screenshot shrunk 70% turns 16px text into 4px. Capture at a smaller layout (tablet), crop to a partial screenshot, or draw a simplified UI with text as lines.
- A 128px logo shrunk to a 16px favicon turns to mush; redraw a simplified mark at 16px.

### Beware user-uploaded content

Constrain shape and size, and separate uploads from the page without borders.

- Center images in fixed containers and crop (object-fit: cover).
- Against background bleed use a subtle inner box shadow, not a border, which clashes with the photo.

## Finishing Touches

### Supercharge the defaults

Upgrade elements that already exist before adding new ones.

- Bullets become icons (checkmarks, arrows, or something topical like a padlock for security features).
- Links get a color and weight change, or a thick colored underline that overlaps the text.
- Checkboxes and radios in a brand color for the checked state already look designed.

### Add color with accent borders

A colored rectangle in the right place adds flair without graphic design skill.

- Across the top of a card, under an active nav item, along the side of an alert, as a short bar under a headline, or across the very top of the layout.

### Decorate your backgrounds

Break monotony with background color, gradients, patterns or a small graphic, all at low contrast.

- Change a panel or section color; a gradient should use two hues no more than about 30 degrees apart.
- A geometric shape, a fragment of pattern, or a simplified map in a corner. Keep pattern-to-background contrast low.

### Don't overlook empty states

Design the empty state as a priority when content is user-generated.

- Replace the blank list with an illustration and an emphasized call to action.
- Hide tabs, filters and other supporting UI until there is content for them to act on.

### Use fewer borders

Separate with shadows, background color or space before reaching for a border.

- A box shadow outlines like a border with less noise; best when the element's color differs from the background.
- Two slightly different background colors are usually enough; if you already have both a color change and a border, drop the border.

### Think outside the box

Components are not locked to their stereotype.

- A dropdown is a floating box: sections, columns, supporting text, colored icons are all allowed.
- Tables can merge related columns and hold images and color; important radio groups can become selectable cards.

## Review checklist

Starting from Scratch
1. One border radius style throughout (all square, all small, or all large)?
2. Personality (typeface, color, radius, wording) consistent with the rest of the product?
3. Every size, gap, color and shadow taken from the defined scales?
4. No implied functionality that is not built?

Hierarchy is Everything
5. Exactly one obvious primary action, secondary as outline or low contrast, tertiary as links?
6. Text colors limited to about three levels (dark, gray, lighter gray)?
7. Only two font weights, none below 400 for UI text?
8. On colored backgrounds, de-emphasized text is a same-hue tint, not gray or translucent white?
9. Where something must stand out, were its competitors quieted rather than it made louder?
10. Label: value pairs avoided where format or context explains the data, and remaining labels visually secondary?
11. Titles sized for their role, not for their heading tag?
12. Icons next to text softened in color so they do not outweigh the words?
13. Destructive actions styled by hierarchy, with red only on the confirmation?

Layout and Spacing
14. More space around each group than inside it (labels to inputs, headings, list items)?
15. Spacing from the scale (4, 8, 12, 16, 24, 32, 48, 64 ...) with no near-duplicates?
16. Fixed-width parts (sidebars, cards, forms) fixed with a max-width, not scaling with the viewport?
17. Large elements shrunk more aggressively than small ones on narrow screens?
18. White space generous by default, with any dense region a deliberate choice?

Designing Text
19. Font sizes from the type scale (12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72) in px or rem?
20. Paragraphs 45 to 75 characters wide (about 20 to 35em)?
21. Line height about 1.5 for body, higher for wide columns, near 1.0 for large headlines?
22. Mixed font sizes on one line aligned by baseline?
23. Long text left-aligned, centered text at most three lines, numeric columns right-aligned?
24. All-caps given extra letter-spacing, body faces used as headlines tightened?
25. In link-heavy UI, links emphasized quietly rather than with prose-link styling?

Working with Color
26. Every color a predefined shade (100 to 900), never a runtime lighten or darken?
27. Light and dark shades keep enough saturation, hue rotation within 20 to 30 degrees?
28. Normal text at 4.5:1 and large text at 3:1 against its background?
29. Where white-on-color failed or shouted, flipped to dark text on a light tint?
30. Every meaning carried by color also carried by an icon, text, or light-dark contrast?
31. Greys share one temperature across the scale?

Creating Depth
32. Shadows from the five-level elevation scale, sized to how far the element sits above the page?
33. Raised and inset elements follow light-from-above (lit top edge, shadow below; shadow at the top of wells)?
34. Interactive states change elevation (lift on drag, flatten on press)?

Working with Images
35. Text over photos readable everywhere via overlay, reduced contrast, colorizing, or a glow shadow?
36. Icons, screenshots and logos shown near their drawn size, big icons enclosed in a shape?
37. User-uploaded images cropped into fixed containers with an inner shadow against bleed?

Finishing Touches
38. A designed empty state, with supporting UI hidden until content exists?
39. No border that a shadow, a background shift, or more space could replace?
40. Defaults upgraded (icon bullets, brand-colored checks, accent borders, low-contrast background decoration)?
