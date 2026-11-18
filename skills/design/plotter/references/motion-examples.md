# Motion examples: what to observe

Open [the portable motion studies](../assets/examples/motion-studies.html) to compare these three existing website animations. Each includes its still and a timeline scrubber for close inspection. They demonstrate different timing decisions; their durations are local choices, not defaults for new work. The gallery is generated from the current component sources by `scripts/build-plotter-motion-examples.tsx` in the website checkout; an installed copy needs only the resulting HTML.

These are teaching examples, not additions to the [approved static reference set](approved-references.md). Website inclusion and the user's choice of Newton’s cradle for the homepage do not establish a general motion-reference approval. Assess them critically, including the limitations below.

## Seating followed by indexing — MEC-05

**Idea:** a loose core becomes an assembly, then the line makes room for the next one.

**Staging:** the carrier is a fixed reference while the core descends. The seated core and carrier then travel together by one pitch. A new core arrives for the next cycle. Hatching preserves the core’s identity; changing edge ownership keeps the contact from becoming a dark seam.

**Rhythm:** the current 1.8-second cycle gives descent and indexing different motion profiles. Contact is the causal hinge between them. Inspect the source’s small settling accent as a specific choice; a new mechanism need not bounce. Check whether seating is readable at the intended display size before reusing this cadence.

**Borrow:** separate the move that changes the relationship from the move that prepares the next cycle. Let the next cycle arise from the mechanism.

**Failure to avoid:** moving the conveyor before contact makes the core look as if it is chasing its carrier. Reversing the completed assembly would tell a different story. The transparent mechanism is conceptual; it does not certify manufacturing behavior.

## A swing handed from end to end — OBJ-05

**Idea:** one end approaches, contact transfers the motion, and the other end swings away.

**Staging:** fixed supports and equal pendulum lengths make the moving bobs legible. The end bobs carry the large motion; the middle group has only a small shared response. Quiet reference marks stay outside the swept envelope.

**Rhythm:** the current 2-second cycle slows around the turnarounds and transfers motion at contact without a hold. The source uses a pendulum-derived curve with an explicit timing accent near the turns. This is an illustration, not a collision or damping simulation.

**Borrow:** preserve speed through a causal handoff and concentrate attention in the active part. A slow turnaround can give the eye breathing room without a frozen pose.

**Failure to avoid:** applying an ease-in-out independently to every quarter swing would stop at the contact point. Giving every bob the same amplitude would obscure the transfer. Do not generalize the chosen cycle length to other mechanisms.

## Different rates, one recurring alignment — orbits

**Idea:** three objects share a center but return to alignment at different rates.

**Staging:** each planet remains on its own fixed circular locus. The stable center and paths explain the moving points without animated labels or decorative trails.

**Rhythm:** the current periods are 3, 6, and 12 seconds. Constant angular travel carries the story; the shared alignment is an event within the flow, not a reason to stop. The radius/period relationship is a construction used by this study, not a full orbital simulation.

**Borrow:** a relative rate can communicate the idea without entrances, exits, or holds. Inspect the whole common period rather than judging a loop from the fastest part alone.

**Failure to avoid:** easing each revolution makes every planet slow at an arbitrary seam. Showing only the first quarter of the outer orbit can hide a discontinuity or miss the relationship entirely.

## Use a reference as a decision aid

Choose the closest behavior, state what it helps decide, and keep the new subject’s invariants. A routed request may borrow continuous travel from the orbit study while needing an explicit arrival; it should not inherit an orbital path. A geometric morph may need holds to compare its endpoints even though the cradle does not.

Before promoting a new animation to an approved reference, retain the reviewed revision and the user's explicit selection. Do not infer approval from a technically successful preview or from these annotations.
