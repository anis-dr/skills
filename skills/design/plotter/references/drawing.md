# Drawing workflow

Use for a new static illustration, a visual refinement, or critique. Complete the shared reference loading in [SKILL.md](../SKILL.md#load-the-shared-references). For critique, apply the same criteria to the supplied source/render and return findings; implement corrections only within the requested scope.

## Establish the relationship

Identify the subject, intended placement/size, deliverable, and the one relationship that should survive at a glance. For an existing drawing, inspect its current source and render before deciding what changes. Resolve missing details from the brief and host; ask only when the answer changes the meaning or deliverable.

Choose the nearest bundled construction reference. Write a short mapping in the working notes: what supplies the focal form, how parts relate, and what its guides explain. Borrow those decisions, rather than its subject alone. For service concepts, state the limited metaphor; verify any actual product-behavior claim against current primary evidence.

## Offer options for an open brief

When the brief names an idea but no form, such as “agent handoff” or “collaboration”, and the user can be asked, let the user choose between options before you finish one. Drawings vary a lot from attempt to attempt, and picking from real options beats describing taste in words.

Make three nearly finished options at `560 × 440`, each a different relationship rather than a variation of one, ideally each from a different reference. Each option carries its main forms, its essential labels, and the key construction and dimension that make the relationship exact, so the user judges what they would actually get; final polish and secondary marks wait for the chosen one. Place the three side by side on one sheet, numbered, with a one-line description under each, render it, and show it. Ask the user to pick one, combine two, or ask for new options. Finish only the chosen option, through the rest of this workflow.

Skip this step for a specific brief, a refinement of an existing drawing, or when the user asks you to proceed; then choose the relationship yourself and name it in the handoff.

**Complete when:** the user has chosen an option or the step was skipped, and the intended relationship, reference, output format/size, and scope of any factual claims are explicit. A generic subject such as “agents” is not yet a composition.

## Compose the static drawing

Arrange the main forms and essential labels before adding supporting marks. Relate actual boundaries, centers, intervals, or repeated parts. Give absence a structural consequence. For assembly, make the connection between fragments and result visible through consistent geometry or allocation.

Add guides only where they explain that arrangement. Choose each arrow, hatch, grid, or dimension through the shared grammar. Derive numeric labels and their witnesses from the same geometry and local unit. Keep descriptive labels distinct from measurements.

For a collection, establish this reference comparison on one representative composition before expanding. Continue through the requested subjects in manageable groups, revising weak compositions before multiplying them. This is a refinement order, not an extra permission gate.

**Complete when:** the forms and essential labels carry the idea, every supporting mark has a named purpose, and removing decorative detail does not destroy the subject.

## Shape and object studies

When the brief is a shape or an object, the drawing explains how that form is built. An outline with a width and a height is sparse: it shows what the object looks like, which the reader already knew. Catalogue studies such as [Anatomy of a letter](catalogue/TYP-01.svg), [The corner rule](catalogue/GEO-03.svg), and [An unbuilt arch](catalogue/EMP-04.svg) carry these layers, and a study needs most of them:

- **Axes.** A centerline through every center and along each axis of symmetry, extended past the form.
- **Generating geometry.** For each curve, its center mark and a radius leader labelled `R…` or `r`. Where the outline uses part of a circle, draw the rest of that circle, or its continuation, in guide weight.
- **Construction points.** Small node marks where construction meets the outline: tangent points, anchors, and the ends of arcs.
- **A module.** Level guides or a quiet grid that the form’s key edges sit on, with one dimension naming the unit `u`.
- **Two or three dimensions** in that unit, relating the parts to each other. Never a chain along every edge.
- **One or two callouts** naming parts the shape cannot name itself, each on a leader.
- **One selected region**, hatched or highlighted, when a part needs singling out.

Each layer still has to explain the construction. Do not add one the form does not have.

## Small placements

A display width under about 400 px shrinks 11-unit labels below 8 px, and the full drawing stops reading. Never answer that by redrawing the idea on a small canvas: the result is an icon. Finish the `560 × 440` drawing first, then derive a compact version from the same geometry, as the Plotter website does for its empty states.

- Keep the main forms and the one mark that carries the idea. Remove the labels, dimensions, grids, and guides that cannot be read at the target size. Text is removed, never shrunk.
- Crop the `viewBox` to the kept forms with a margin of about 16 units, still in the drawing’s own units. Do not rescale or redraw coordinates, and let no kept form touch or cross the crop edge.
- Set `vector-effect="non-scaling-stroke"` on every stroked element, so each stroke stays one pixel wide at any size. Dash patterns then measure in screen pixels: use `2 2` where the full drawing used a longer dash.
- Run `scripts/check.py --compact` on it, then render it at the target width and check that each kept form is still distinct.

Deliver both files and say which is which. The compact version is a view of the drawing, not a second composition.

## Implement the editable source

Read [foundation.md](foundation.md) for shared roles, helpers, and export. Use native SVG for the composition and for unsupported constructions such as curved arrows or curved hatch regions. The helper API covers straight arrows, axis-aligned dimensions, and rectangular H1/H2 hatching; it does not choose the composition.

Separate geometry from presentation and file writing. Derive paths from named parameters; retain calculation precision until serialization. Preserve opacity grouping, solid arrowheads, transparent forms, and single ownership of shared strokes. Keep IDs local and unique when drawings repeat in one document.

When the deliverable is a component or other host code, compose and inspect the drawing as SVG first, then translate it, and say that the inspected render was the SVG.

Use an accessible title and description for meaningful standalone output. In a host where adjacent copy supplies all meaning, decorative SVG may be hidden from accessibility APIs. Typography follows [current direction](direction.md#typography-and-presentation).

**Complete when:** the source remains editable, every dimension agrees with its witnesses, and role adoption has preserved the intended hierarchy and exceptions.

## Inspect and deliver

Render the candidate beside the selected reference at a common intended size, then inspect the thumbnail. For a revision, also compare with its own previous render. Inspect both themes when the host uses them and the actual narrow layout when embedding it.

First run the checker, resolved from the skill directory, and fix every error. It catches what a glance at a render misses: stroked, bold, or full-ink text, a label outside 10 to 12 units or turned upside down, a stroke that is not 1 unit, a gradient, a skew, or the wrong canvas. A “sparse” warning means the drawing has fewer marks than nine in ten catalogue drawings. For a shape or object study it is an error: add the missing layers. For any other drawing, add the missing construction or say in the report why it is complete.

```sh
python3 scripts/check.py drawing.svg
python3 scripts/check.py compact.svg --compact   # for a compact version
```

Then render with the packaged script and open the PNG it names:

```sh
python3 scripts/render.py drawing.svg                        # native size, light surface
python3 scripts/render.py drawing.svg --theme both           # when the host has a dark theme
python3 scripts/render.py drawing.svg small.png --width 240  # the width it will be shown at
```

The script uses an installed Chromium-based browser and falls back to other SVG renderers. A dark render recolors a themeable source that draws in `currentColor`; a resolved export keeps the ink it was exported with. When a sandbox blocks the renderer, ask to run this one command outside it. Render again after the last edit: a drawing changed since its render has not been inspected. Previews use the bundled Cal Sans, so say when the delivered file will fall back to another font on its host.

Resolve these concrete questions:

- Does one focal relationship survive at a glance, with recognizable subject cues?
- Do construction marks explain exact relationships and remain subordinate?
- Are essential labels readable, with clear gaps and no accidental clipping?
- Do fills and line crossings follow the [fill and line-clearance rules](drafting-standard.md#fills-and-line-clearance), with readable text and one owner for each shared edge?
- Does each numeric or behavioral claim have evidence appropriate to the drawing's stated scope?

Improve arrangement or recognition before adding detail. If rendering is unavailable, deliver the source with the visual review explicitly pending; a source reading cannot establish visual quality.

For standalone SVG, use the packaged static exporter. Resolve ink and tokens, retain editable labels, and disclose font fallback differences. A themeable source that references packaged CSS and a resolved standalone SVG are different deliverables.

**Complete when:** the requested source and export/preview exist; the applicable visual questions have an observed answer or a named limitation; and the handoff states the relationship, intentional exceptions, and inspections actually performed. Source generation is not visual approval.

## Portable starting example

[`registration.mjs`](../assets/examples/registration.mjs) reads the adjacent editable [registration.svg](../assets/examples/registration.svg) and writes the result to standard output without changing the template. Its drawing-specific [renderRegistration recipe](../assets/examples/render-registration.mjs) fills the marked arrow/dimension fragments and generated styles using the shared foundation. Edit that recipe to change placement or label clearance. The example uses only Node's standard library and this package's foundation. It is an implementation example, not an additional approved anchor or a template for every agent concept.

From the copied `plotter` directory, with Node.js and Python 3 available:

```sh
node assets/examples/registration.mjs > registration.svg
python3 scripts/export-svg.py registration.svg registration-export.svg --id-prefix registration
python3 scripts/render.py registration-export.svg
```

The first file is editable, themeable SVG with embedded generated role CSS. The second has resolved appearance and no host application, JavaScript, or external CSS dependency. Opening it does not require Node or Python. The third command writes `registration-export.png` for inspection. Adapt the example's parameters and labels to a new brief; preserve the relationship only if it fits that brief. The width witnesses come from the record rectangle; the label clearance and surrounding composition are authored explicitly and need adjustment when text or layout changes.
