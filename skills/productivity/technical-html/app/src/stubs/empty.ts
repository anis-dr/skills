// Client-only stand-in for Shiki's Oniguruma engine / wasm and Pierre's Highlights backend: the island uses the JS regex engine.
// Also stands in for the pseudo grammar when no island uses it.
export const createOnigurumaEngine = () => { throw new Error("oniguruma is not bundled"); };
export const themes = { getTheme: () => undefined };
export default {};
