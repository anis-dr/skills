/** anti-slop-effect/no-service-constructor-imports: the import need not resolve. */
import { makeStore } from "./store.ts";

/** effect/noGlobals */
export const logs = () => console.log("x");

/** effect-shape/no-try-catch */
export const guarded = () => {
  try {
    return makeStore;
  } catch {
    return 2;
  }
};

/** typescript/no-floating-promises, only with --type-aware: on the statement after this declaration. */
declare const pending: Promise<number>;
pending;
