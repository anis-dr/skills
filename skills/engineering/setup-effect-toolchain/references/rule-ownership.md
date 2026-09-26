# Rule ownership

Four tools can report the same problem. Each diagnostic gets exactly one owner; the others turn their copy off, with a comment naming the owner. Two tools reporting one mistake doubles the noise and splits the fix between two configs.

| Diagnostic family | Owner | Turned off in |
|---|---|---|
| Globals: `console`, `Date`, `fetch`, `Math.random`, timers, `process.env`, `crypto.randomUUID`, Node built-in imports, `new Promise`, `async` functions, `throw` | `oxlint-plugin-effect` (`effect/noGlobals`, `effect/noNodeBuiltinImport`, `effect/noNewPromise`, `effect/noAsyncFunction`, `effect/noThrowStatement`) | Effect language service `diagnosticSeverity` in `base.json`; the matching `effect-shape/prefer-effect-*` and `effect-shape/no-throw-in-effect-generator` rules |
| Effect code shape: dynamic imports, `Effect.bind`, `Effect.Do`, step-by-step `Effect.all`, `try`/`catch`, `Effect.fn` | `@shekohex/oxc-effect` (`effect-shape/*`) | `effect/noDynamicImports`, `effect/noEffectBind`, `effect/noEffectDo`, `effect/noSequentialEffectAll`, `effect/noTryCatch`, `effect/preferEffectFn`; Effect language service `tryCatchInEffectGen` |
| Type-safety shapes that anti-slop also ships (table below) | `oxlint-plugin-effect` recommended preset | the anti-slop copies are not enabled |
| `Reflect.apply`, `Reflect.get`, functions returning `unknown`, service constructor imports | anti-slop (`anti-slop/no-reflect-apply`, `anti-slop/no-reflect-get`, `anti-slop/no-unknown-returns`, `anti-slop-effect/no-service-constructor-imports`) | nothing else covers them |
| Type assertions | `effect/noAs` bans `as` outright | `anti-slop/require-safety-comment-for-type-assertion` stays off: with `as` banned it has nothing to check |
| Unhandled or misused promises, non-exhaustive `switch`, needless assertions | oxlint type-aware rules (`typescript/*`) through `oxlint-tsgolint` and `--type-aware` | nothing; without the package and the flag these rules silently do nothing |
| Floating Effects and other Effect type-level mistakes | Effect language service inside `tsc` (`@effect/tsgo`) | nothing |

## anti-slop rules and their Effect-preset owners

anti-slop ships 15 generic rules. Eleven have an equivalent in the `oxlint-plugin-effect` recommended preset, which already runs, so only the rest are enabled. In a repo without the Effect preset, enable all 15 as the `install-anti-slop` skill says.

| anti-slop rule | Owner in an Effect repo |
|---|---|
| `no-chained-type-assertions` | `effect/noChainedTypeAssertions` |
| `no-conditional-empty-object-spread` | `effect/noConditionalEmptyObjectSpread` |
| `no-known-value-widening` | `effect/noKnownValueWidening` |
| `no-module-mocking` | `effect/noModuleMocks` |
| `no-object-parameters` | `effect/noObjectParameters` |
| `no-runtime-typeof` | `effect/noRuntimeTypeof` |
| `no-shape-in-symbol-names` | `effect/noShapeInSymbolNames` |
| `no-unknown-parameters` | `effect/noUnknownParameters` |
| `no-unknown-type-aliases` | `effect/noUnknownTypeAliases` |
| `no-unsafe-dictionary-type` | `effect/noUnsafeDictionaryType` |
| `no-widen-then-assert` | `effect/noWidenThenAssert` |
| `no-reflect-apply` | anti-slop (enabled) |
| `no-reflect-get` | anti-slop (enabled) |
| `no-unknown-returns` | anti-slop (enabled) |
| `require-safety-comment-for-type-assertion` | none needed: `effect/noAs` |

Re-check this table when either plugin changes version: list the preset with `bun -e 'import { recommended } from "oxlint-plugin-effect/presets/recommended"; console.log(Object.keys(recommended))'` and compare names.
