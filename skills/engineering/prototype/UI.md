# UI Prototype

Generate **several radically different UI variations** on a single route, switchable from a floating bottom bar. The user flips between variants in the browser, picks one (or steals bits from each), then throws the rest away.

If the question is about logic/state rather than what something looks like, this is the wrong branch. Use [LOGIC.md](LOGIC.md).

## When this is the right shape

- "What should this page look like?"
- "I want to see a few options for this dashboard before committing."
- "Try a different layout for the settings screen."
- Any time the user would otherwise spend a day picking between three vague mockups in their head.

## Two sub-shapes: strongly prefer sub-shape A

A UI prototype is much easier to judge when it's **butting up against the rest of the app**: real header, real sidebar, real data, real density. A throwaway route on its own is a vacuum: every variant looks fine in isolation. Default to sub-shape A whenever there's a plausible existing page to host the variants. Only reach for sub-shape B if the prototype genuinely has no nearby home.

### Sub-shape A: adjustment to an existing page (preferred)

The route already exists. Variants are rendered **on the same route**, gated by a `?variant=` URL search param. The existing data fetching, params, and auth all stay. Only the rendering swaps. This is the default; pick it unless there's a specific reason not to.

If the prototype is for something that doesn't yet have a page but *would naturally live inside one* (a new section of the dashboard, a new card on the settings screen, a new step in an existing flow), it's still sub-shape A. Mount the variants inside the host page.

### Sub-shape B: a new page (last resort)

Only use this when the thing being prototyped genuinely has no existing page to live inside (e.g. an entirely new top-level surface, or a flow that can't be embedded anywhere sensible).

Create a **throwaway route** following whatever routing convention the project already uses. Don't invent a new top-level structure. Name it so it's obviously a prototype (e.g. include the word `prototype` in the path or filename). Same `?variant=` pattern.

Before committing to sub-shape B, sanity-check: is there really no existing page this could be embedded in? An empty route hides design problems that a populated one would expose.

In both sub-shapes the picker is identical.

**Location.** Clickable HTML prototypes go in `.scratchpad/<task>/`. Where the variants must live in the app to be judged (sub-shape A, `?variant=` on the real page), keep that, but never import prototype code into production paths, and remove it when the chosen variant lands.

## Process

### 1. State the question and pick N

Default to **3 variants**. More than 5 stops being radically different and starts being noise, so cap there.

Write down the plan in one line, in the prototype's location or a top-of-file comment:

> "Three variants of the settings page, switchable via `?variant=`, on the existing `/settings` route."

This works whether the user is here to push back or not.

### 2. Name the variants, then generate them

Before any code, list the set: a name and an axis for each variant (layout, information hierarchy, primary affordance). No two variants share an axis position. If two drafts converge, cut one and say so; do not keep a near-duplicate to reach the count.

Draft each variant. Hold each one to:

- The page's purpose and the data it has access to.
- The project's component library / styling system (TailwindCSS, shadcn, MUI, plain CSS, whatever).
- A clear exported component name, e.g. `VariantA`, `VariantB`, `VariantC`.
- Full function: realistic copy, no lorem ipsum, no dead buttons. "Skip the polish" in the [SKILL](SKILL.md) applies to the logic branch only.

Variants must be **structurally different**: different layout, different information hierarchy, different primary affordance, not just different colours. Three slightly-tweaked card grids isn't a UI prototype, it's wallpaper. If two drafts come out too similar, redo one with explicit "do not use a card grid" guidance.

Judge each variant at full size in realistic context, never as side-by-side thumbnails: they distort spacing and scale.

### 3. Wire them together

Create a single switcher component on the route:

```tsx
// pseudo-code, adapt to the project's framework
const variant = searchParams.get('variant') ?? 'A';
return (
  <>
    {variant === 'A' && <VariantA {...data} />}
    {variant === 'B' && <VariantB {...data} />}
    {variant === 'C' && <VariantC {...data} />}
    <PrototypeSwitcher variants={['A','B','C']} current={variant} />
  </>
);
```

For sub-shape A (existing page): keep all the existing data fetching above the switcher; only the rendered subtree changes per variant.

For sub-shape B (new page): the throwaway route under `/prototype/<name>` mounts the same switcher.

### 4. Add the picker

Use the picker in [references/picker.md](references/picker.md) verbatim. It is chrome, not a design choice: do not restyle it with the project's tokens, and keep it visually distinct from the page being judged.

Hide it in production builds (gate on `process.env.NODE_ENV !== 'production'` or an equivalent check), so a stray prototype merge can't ship it to users.

Put the picker in a single shared component so both sub-shapes can reuse it, wherever shared UI lives in the project.

### 5. Verify, then hand it over

Before handing off, flip through every variant yourself, check the console is clean, and screenshot each variant when browser tooling exists. Confirm every interaction responds.

Surface the URL (and the picker keys). Hand over a table with one row per variant: its axis, when it is the right choice, and its cost. Never pre-pick a favorite; the choice belongs to the user. The interesting feedback is usually **"I want the header from B with the sidebar from C"**, which is the actual design they want.

`riff <variant>` starts another round: keep the harness and run step 2 again, diverging around the chosen direction.

### 6. Capture the answer and clean up

Once a variant has won, record the verdict and the question it answered in the implementation issue or PR, then fold the winner into the real code:

- **Sub-shape A**: fold the winner into the existing page; drop the losing variants and the switcher.
- **Sub-shape B**: promote the winning variant to a real route; drop the throwaway route and the switcher.
- **Prototype in `.scratchpad/<task>/`**: build the real thing from the winner.

Delete the prototype once the chosen change is merged: the `.scratchpad/<task>/` folder, the variant switch and the losing variants. Variant components and the switcher left behind rot fast and confuse the next reader.

## Anti-patterns

- **Variants that differ only in colour or copy.** That's a tweak, not a prototype. Real variants disagree about structure.
- **Sharing too much code between variants.** A shared `<Header>` is fine; a shared `<Layout>` defeats the point. Each variant should be free to throw out the layout.
- **Wiring variants to real mutations.** Read-only prototypes are fine. If a variant needs to mutate, point it at a stub: the question is "what should this look like", not "does the backend work".
- **Promoting the prototype directly to production.** The variant code was written under prototype constraints (no tests, minimal error handling). Rewrite it properly when you fold it in.
