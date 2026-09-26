// Lint controls from setup-effect-toolchain: copy into a linted source folder, run lint, delete.
// Each commented line must report the named rule; the last one only with --type-aware.
export const logs = () => console.log("x"); // effect/noGlobals
export const reads = (items: string[]) => Reflect.get(items, 0); // anti-slop/no-reflect-get
export function passes(v: string): unknown {
  return v;
} // anti-slop/no-unknown-returns
export const guarded = () => {
  try {
    return 1;
  } catch {
    return 2;
  }
}; // effect-shape/no-try-catch
declare const pending: Promise<number>;
pending; // typescript/no-floating-promises (type-aware only)
