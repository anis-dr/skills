// Typecheck control from setup-effect-toolchain: copy into a typechecked src/, run typecheck, delete.
// tsc must report effect(floatingEffect) on the marked line.
import { Effect } from "effect";

export const program = Effect.gen(function* () {
  Effect.succeed(1); // Effect LS floatingEffect
  yield* Effect.void;
});
