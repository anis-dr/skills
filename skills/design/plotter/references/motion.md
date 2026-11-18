# Animate a Plotter drawing

Motion should reveal a relationship over time: what joins, what causes the next event, what stays constant, or where a transfer ends. Keep the shared [direction](direction.md), [grammar](visual-grammar.md), and [drafting standard](drafting-standard.md). Read [motion examples](motion-examples.md) for the nearest behavior; borrow its reasoning, not its choreography or duration.

## 1. Choose what time reveals

For a new subject, resolve a readable [still](drawing.md) first. For an existing drawing, inspect its source and render; preserve the composition unless a redesign was requested. Select a meaningful fallback, which need not be frame zero.

Complete this sentence before implementing: “The viewer sees [change], which explains [relationship].” Choose the moving subject and the fixed reference that makes the change legible. A dimension, grid, or hatch does not need its own entrance merely because it exists.

- **Assembly:** preserve the identity of the parts while their relationship changes. Move related marks together; let the completed arrangement register.
- **Transfer:** establish the source and destination, then follow one event through them. Avoid simultaneous competing signals unless concurrency is the subject.
- **Geometric change:** identify the changing parameter and the invariant. Derive outlines, witnesses, and labels from the same geometry throughout the transition.
- **Continuous mechanism:** show the constraint through repeated motion. Keep the support, pivot, or locus stable so the viewer can read the movement against it.

A line-reveal effect is useful when the order of construction is the subject. Otherwise, moving the actual part or signal usually explains more. Do not add unrelated rotation, pulsing, or label entrances to make a quiet drawing feel animated.

## 2. Stage the significant events

Sketch the start, the decisive event, and the readable result before interpolating. Name what the eye should follow in each state. Keep unrelated marks still; move explanatory guides only when their witnesses move. A hatch travels with its bounded region, never as a separate effect.

For a sequence, establish cause before response: a part seats before its carrier advances; a request arrives before an output reacts. Overlap events when the relationship warrants it, not simply to make every part move at once. For continuous mechanisms, the handoff can be immediate; adding a pause at a pendulum collision changes the behavior.

Choose the ending deliberately:

- **Once:** the result persists. Use this when the story is completion.
- **Reverse:** the return describes a release, adjustment, recurring attempt, or comparison between exploded and assembled states. Reversing a construction study can clarify its parts; reversing a completed operation can imply that its result is undone. Choose based on what the drawing claims.
- **Repeat:** the next cycle follows from the previous one. An indexing conveyor can supply a new part; a periodic mechanism can return to the same phase. A reset hidden at a real aperture is useful only when that aperture belongs to the drawing.

Keep the repeat within the established construction when possible. Do not introduce a whole-scene slide, replacement carrier, or new mechanism solely to avoid a simple, meaningful reversal; those additions can become the dominant motion.

Keep fixed guides outside swept regions where they would obscure moving parts. At contact, specify the owner of each coincident edge before, during, and after joining. Transfer ownership or trim the duplicate segment; transparent forms must remain transparent.

## 3. Give the events a rhythm

Write a compact beat list with approximate times, moving groups, and the reason for each hold or overlap. Use it to implement and revise the sequence; it need not become user-facing documentation.

Choose speed from the behavior:

| Behavior                           | Timing decision                                                                                            | What to inspect                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Controlled placement or adjustment | Ease into the target so alignment can be read; use overshoot only if the mechanism has a reason to settle. | Does it arrive decisively, or drift indefinitely?             |
| Free travel or a steady signal     | Preserve the intended speed through uninterrupted travel; do not ease to a stop at every path segment.     | Does a corner accidentally look like a new event?             |
| Swing or orbital motion            | Derive motion from the stated construction; distinguish a stylized timing accent from a physical claim.    | Are pivots fixed and speed changes consistent with the story? |
| A new readable configuration       | Give it enough time to recognize at the intended size before the next change.                              | Can the result be understood without pausing?                 |

Do not apply one easing curve to the whole drawing. A carrier’s index, a falling core, and the hold after contact have different jobs. Duration follows travel, reading time, and context; interface-transition timing is not automatically appropriate for an explanatory loop. Lengthen a hold when a result is missed; shorten empty waiting when attention wanders. Do not add dead stops to a continuous mechanism to satisfy a hold rule.

## 4. Build, watch, revise

Keep geometry, timeline, and host playback separable. The [foundation](foundation.md) supplies styles and geometry, not a clock. Use native SVG animation, the host’s existing system, or a small script. Preserve the still’s opacity grouping, line hierarchy, rigid sizes, pivots, and attached hatching. State only the geometric or physical behavior the drawing actually supports.

Within the permitted review scope, watch a complete cycle at normal speed and intended size. Then inspect the decisive event and the return boundary more closely. Ask:

- Can the main change be described without reading the implementation?
- Does attention move in the intended order? Remove competing motion before adding more emphasis.
- Is the result readable? Adjust the move/hold balance rather than slowing everything uniformly.
- Does the return preserve meaning and continuity? Compare position **and speed**, except at an intentional impact or reversal.
- At approach, contact, and separation, do edges remain single, hatches attached, labels clear, and dimensions truthful?

Revise the weakest observed issue and replay the affected sequence. Review the chosen still independently. Sampled frames can establish poses and clearances; they do not establish rhythm. `python3 scripts/render.py page.html` captures a page as it loads, so give a review file a way to open at a chosen time when you need a later pose. If playback inspection is unavailable, name that gap rather than calling motion visually verified. Respect a request to skip automated checks.

## Delivery and host behavior

The brief determines the artifact. A request to animate a site component is not a request for a standalone HTML player. Preserve the host’s existing controls and playback conventions.

- **Embedded illustration:** integrate the timeline with the host’s playback. Plotter’s website loops have no visible controls; they pause off-screen or while the page is hidden.
- **Standalone animation or review file:** include the editable timeline and its actual resources. A player with pause/resume, replay, and a way to inspect the selected still is useful here. For one-file HTML, inline the generated role stylesheet and, when the page should not depend on an installed font, the bundled Cal Sans as a data-URI `@font-face`; for a folder, preserve all relative dependencies.
- **Still export:** export the selected static composition with the packaged exporter. Active animation is outside that exporter’s contract.

Respect reduced motion, including preference changes while the page is open, by showing the selected still. Keep it readable before JavaScript runs and when animation is unavailable. A paused intermediate frame is not the same as that deliberately chosen fallback.

Deliver the requested source and a concise account of the movement and checks actually performed. Playback controls and packaging support the work; they do not establish that the animation communicates well.

## Implementation example

[Assembly motion](../assets/examples/assembly-motion.html) is a small portable wiring example: a core seats and withdraws, its hatching stays attached, and the base owns the contact edge. Keep its relative `../foundation/roles.css` dependency, or inline that generated CSS for one-file delivery. It has no build or server dependency.

Its player demonstrates fallback and visibility handling. It is not an approved motion reference, the exact MEC-05 timeline, or a physics simulation. Use the [annotated studies](motion-examples.md) to reason about choreography and rhythm.
