# Plotter

Editable flat monochrome construction illustrations, with drawing and animation workflows.

## Install and invoke

Copy this **complete `plotter` directory** into the agent’s personal skills directory, keeping its name and relative paths:

| Agent       | Destination                | Invocation |
| ----------- | -------------------------- | ---------- |
| Codex       | `~/.codex/skills/plotter`  | `$plotter` |
| Claude Code | `~/.claude/skills/plotter` | `/plotter` |

The canonical source is `skills/plotter` in the public [`pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter) repository. Download the complete skill from the Plotter website, or copy that folder from a checkout. Update installed copies as complete folders. Standalone work needs no website checkout, conversation history, package manager, or external font download.

Example briefs for Codex:

- “Use $plotter to show a 20-minute appointment between two 5-minute buffers as a standalone 560 × 440 SVG.”
- “Use $plotter to illustrate agent registration as fragments becoming one record. Keep the forms transparent and use a grid only if it explains the construction.”
- “Use $plotter to animate this SVG for a homepage: a core seats in its carrier, then the line advances for the next assembly. Keep the composition quiet and the handoff easy to follow.”
- “Use $plotter to critique this loop’s contact and hatch behavior without editing it.”

In Claude Code, start the same request with `/plotter`. One entrypoint routes to the [drawing workflow](references/drawing.md) or [animation workflow](references/motion.md); both share direction, grammar, tokens, and references.

## What is portable

Seven bundled SVG anchors support construction-reference selection, and the [catalogue](references/catalogue/index.md) bundles every website drawing by code, so a brief can say “like TIM-06”. The [visual grammar](references/visual-grammar.md) includes teaching SVGs; the [foundation](references/foundation.md) contains dependency-free geometry helpers and generated role styles.

| Example                                                       | Open or generate it from the copied skill directory                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Static registration, using the shared arrow/dimension helpers | `node assets/examples/registration.mjs > registration.svg`                                                    |
| Resolved static SVG with editable labels                      | `python3 scripts/export-svg.py registration.svg registration-export.svg --id-prefix registration`             |
| PNG preview for inspection, light and dark                    | `python3 scripts/render.py registration-export.svg --theme both`                                              |
| Rule check: text, strokes, canvas, and sparseness             | `python3 scripts/check.py registration-export.svg`                                                            |
| Animation and static fallback, with shared role CSS           | Open `assets/examples/assembly-motion.html` in a modern browser; keep `assets/foundation/roles.css` in place. |

Node.js is needed for the authoring example; Python 3 is needed for the static exporter and the preview renderer. The renderer uses an installed Chromium-based browser such as Chrome, Edge, or Brave, and falls back to `rsvg-convert`, `resvg`, Inkscape, ImageMagick, or macOS Quick Look. Recipients opening a resolved SVG need neither. The motion example uses browser SVG animation and a small player without a build or server. Keep its local stylesheet alongside it, or inline that generated stylesheet when delivering one HTML file. Cal Sans is bundled under the SIL Open Font License at `assets/fonts/`: previews render with it, and `export-svg.py --embed-font` carries it inside a standalone SVG. Without it on the host, labels fall back to sans-serif.

The [annotated motion studies](references/motion-examples.md) explain staging and timing using three existing animations; open `assets/examples/motion-studies.html` to inspect them. The examples are teaching material, not additional approved style references. The static exporter handles the selected still, not active animation.

## Licenses

See [NOTICE.md](NOTICE.md) and [LICENSE](LICENSE) for the preserved source and licensing record.
