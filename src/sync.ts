import { Effect, Path } from "effect";

import type { SourceEntry } from "./SkillTree.ts";
import { SkillTree } from "./SkillTree.ts";
import { Upstream } from "./Upstream.ts";

// Writes every entry's skill folder from its upstream at the pinned commit.
export const sync = Effect.fn("sync")(function* (
  entries: ReadonlyArray<SourceEntry>
) {
  const upstream = yield* Upstream;
  const tree = yield* SkillTree;
  const path = yield* Path.Path;
  for (const entry of entries) {
    const checkout = yield* upstream.fetchPinned(entry.source, entry.commit);
    yield* tree.writeSkill(entry, path.join(checkout, entry.path));
  }
});
