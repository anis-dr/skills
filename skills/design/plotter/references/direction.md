# Current visual direction

Shared by drawing and animation. This is the active art direction. Numerical roles belong to the [drafting standard](drafting-standard.md) and its generated source, not this file.

## Composition

Build one readable construction relationship with a focal form and generous quiet space. Borrow the organizing relationship and hierarchy from a relevant [approved reference](approved-references.md), then adapt the subject. Recognizable objects and UI fragments are welcome when their geometry carries the idea. Technical annotations alone do not turn a pictogram or full screen mockup into a construction study.

Use a flat plan, elevation, or conceptual plane. Keep represented forms free of perspective, isometric depth, skew, gradients, and lighting effects. Diagonal construction lines, hatch lines, and leaders remain useful; a diagonal mark does not imply a tilted object.

Make the main form read first, supporting construction second, and sparse dimensions/labels third. Use short integrated labels for information geometry cannot establish: the people sharing availability, the day of a week, or the meaning of an absent connection. Preserve recognition before adding secondary measurements.

## Surface and marks

Use monochrome ink adapted to the host’s foreground and background. Apply the [fill and line-clearance rules](drafting-standard.md#fills-and-line-clearance): ordinary forms are transparent, a region highlight identifies a named selection or intersection, and each supporting line has a clear purpose. Keep text legible by resolving the geometry around it.

Choose supporting marks through the [visual grammar](visual-grammar.md). A background grid earns its place when it reveals a shared coordinate or module system; geometric subject matter alone is insufficient. Calendar cells may be the subject rather than a background grid. Hatching identifies a declared bounded region or section and stays attached to that region through motion. It does not supply generic texture or lighting.

Preserve the original grouping level of opacity during role adoption. At the shared defaults, opacity establishes hierarchy and dash patterns communicate meaning; widths remain separately adjustable. Nested opacity groups can unintentionally multiply emphasis. Keep arrowheads solid and joined to their shafts. Separate movement, dimensions, callouts, and proposed/hidden states by meaning rather than appearance alone.

## Typography and presentation

Use the host font or `Cal Sans, sans-serif`. Use automatic optical sizing, no added letter-spacing, no synthesized bold/italic, and one GEOM value per text role where the font supports it: 25 for ordinary illustration text, 0 for identifiers. Use typeset punctuation. Editable text with a sans-serif fallback is portable; exact Cal Sans metrics require that font to be available. The package bundles [Cal Sans](../assets/fonts/CalSansVF.woff2): previews render with it, and `export-svg.py --embed-font` carries it inside a standalone SVG for a host that will not load the font.

Bundled references use a `560 × 440` viewBox. Inspect at the intended output size and as a thumbnail; preserve essential labels when adapting a composition. The website displays drawings at native size when space permits and scales them proportionally to fit narrower containers.

## Revisions and interpretation

An implementation-only refactor preserves composition, timing, text, transparency, shared edges, and intentional legacy exceptions. A requested redesign may change those decisions within its brief. Current explicit user direction takes precedence over the packaged defaults.

Study-specific decisions stay local. MEC-05's hatch marks identify only its core faces; that preference does not require cubes or hatching in other drawings. A rejected drawing does not ban its subject category. Instructional examples and later liked revisions do not automatically join the approved reference set.
