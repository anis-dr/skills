# Rule ownership

Four tools can report the same problem. Each diagnostic gets exactly one owner; the others turn their copy off, with a doc comment naming the owner. Two tools reporting one mistake doubles the noise and splits the fix between two configs. The comments are `/** */` doc comments because `effect/noComments` (in the Effect preset) reports every other kind.

| Diagnostic family | Owner | Turned off in |
|---|---|---|
| Globals: `console`, `Date`, `fetch`, `JSON.parse`/`JSON.stringify`, `Math.random`, timers, `process.env`, `crypto.randomUUID`, Node built-in imports, `new Promise`, `async` functions, `throw` | `oxlint-plugin-effect` (`effect/noGlobals`, `effect/noNodeBuiltinImport`, `effect/noNewPromise`, `effect/noAsyncFunction`, `effect/noThrowStatement`) | Effect language service `diagnosticSeverity` in `base.json`; the matching `effect-shape/*` rules (`prefer-effect-*`, `prefer-schema-json`, `no-native-current-time`, `no-effect-sync-console`, `no-throw-in-effect-generator`) |
| Effect code shape: dynamic imports, `Effect.bind`, `Effect.Do`, step-by-step `Effect.all`, `try`/`catch`, `Effect.fn` | `@shekohex/oxc-effect` (`effect-shape/*`) | `effect/noDynamicImports`, `effect/noEffectBind`, `effect/noEffectDo`, `effect/noSequentialEffectAll`, `effect/noTryCatch`, `effect/preferEffectFn`; Effect language service `tryCatchInEffectGen` |
| Running Effects by hand and fixed waits in tests | `oxlint-plugin-effect` (`effect/noEffectRunInTests`, `effect/noFixedWaitInTests`): they also catch runtime `run*` methods, `ManagedRuntime.make`, `waitForTimeout` and timer-only Promises | `effect-shape/no-effect-run-in-test`, `effect-shape/no-effect-sleep-in-test` |
| Promise chains in tests | `effect/noPromiseChainsInTests` | `promise/prefer-await-to-then`, through the test-file override |
| Type-safety shapes that anti-slop also ships (table below), including `Reflect.apply`, `Reflect.get` and functions returning `unknown` | `oxlint-plugin-effect` recommended preset | the anti-slop copies are not enabled |
| Service constructor imports | anti-slop (`anti-slop-effect/no-service-constructor-imports`) | nothing else covers them |
| Type assertions | `effect/noAs` bans `as` outright | `anti-slop/require-safety-comment-for-type-assertion` stays off: with `as` banned it has nothing to check |
| Unhandled or misused promises, non-exhaustive `switch`, needless assertions | oxlint type-aware rules (`typescript/*`) through `oxlint-tsgolint` and `--type-aware` | nothing; without the package and the flag these rules silently do nothing |
| Floating Effects and other Effect type-level mistakes | Effect language service inside `tsc` (`@effect/tsgo`) | nothing |

One overlap stays on purpose. `unicorn/no-abusive-eslint-disable` and `effect/requireSuppressionReason` both report a bare `oxlint-disable-next-line`, but neither covers the other: a file-level `/* eslint-disable */` silences `requireSuppressionReason` itself, and `unicorn` never asks for a reason.

## anti-slop rules and their Effect-preset owners

anti-slop ships 15 generic rules and one Effect rule. The `oxlint-plugin-effect` recommended preset carries fourteen of the generic rules under its own names (its README, section "Anti-Slop Rules"), and `effect/noAs` leaves the fifteenth nothing to check. So in an Effect repo no generic rule is enabled and the generic `anti-slop` plugin is not registered; only `anti-slop-effect` is. In a repo without the Effect preset, enable all 15 as the `install-anti-slop` skill says.

| anti-slop rule | Owner in an Effect repo |
|---|---|
| `no-chained-type-assertions` | `effect/noChainedTypeAssertions` |
| `no-conditional-empty-object-spread` | `effect/noConditionalEmptyObjectSpread` |
| `no-known-value-widening` | `effect/noKnownValueWidening` |
| `no-module-mocking` | `effect/noModuleMocks` |
| `no-object-parameters` | `effect/noObjectParameters` |
| `no-reflect-apply` | `effect/noReflectApply` |
| `no-reflect-get` | `effect/noReflectGet` |
| `no-runtime-typeof` | `effect/noRuntimeTypeof` |
| `no-shape-in-symbol-names` | `effect/noShapeInSymbolNames` |
| `no-unknown-parameters` | `effect/noUnknownParameters` |
| `no-unknown-returns` | `effect/noUnknownReturns` |
| `no-unknown-type-aliases` | `effect/noUnknownTypeAliases` |
| `no-unsafe-dictionary-type` | `effect/noUnsafeDictionaryType` |
| `no-widen-then-assert` | `effect/noWidenThenAssert` |
| `require-safety-comment-for-type-assertion` | none needed: `effect/noAs` |
| `anti-slop-effect/no-service-constructor-imports` | anti-slop (enabled) |

Re-check these tables when either plugin changes version: list the preset with `bun -e 'import { recommended } from "oxlint-plugin-effect/presets/recommended"; console.log(Object.keys(recommended))'` and compare names, and lint a file that trips each candidate pair to see whether both report. A rule name the plugin no longer registers fails the config load (`Rule '<name>' not found in plugin 'effect'`), so a removed rule shows on the first lint run.
