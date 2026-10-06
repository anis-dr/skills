# Type performance

Every consumer pays your type-check cost in their editor, on every keystroke. Inference-heavy libraries are where that cost lives. Measure it; do not guess.

## Measure

1. Use a realistic consumer fixture, not a three-line example: as many registered entries (routes, keys, events, tables) as a large app has. Generate it with a script if needed.
2. Run `tsc --noEmit --extendedDiagnostics` on the fixture for a baseline and for the candidate, three runs each. The baseline is the previous release, or for a new API the simplest signature that passes the type tests (often the wide-union version). Record `Instantiations`, `Types`, `Check time` and `Memory used`.
3. Judge by check time first: it is what consumers feel. Instantiations and types explain why check time moved; they can rise while check time falls (a per-variant generic instantiates more but compares against smaller types). A check-time regression needs a stated reason, such as better errors.
4. When a number moves a lot, run `tsc --generateTrace <dir>` and `npx @typescript/analyze-trace <dir>` to find the expression that pays for it.
5. Put the baseline and candidate numbers in the PR. Router notes that its runtime `test:perf` target measures runtime, not compiler cost, so a compiler check needs its own measurement.

## Design rules (TanStack Router's type-safety guide and the TypeScript performance wiki)

- **Narrow early.** Offer a hint (`from`, `to`) that narrows a union over all registered entries to the few relevant ones. Checking a value against a union of every route's search params grows with the app; checking against one route's does not.
- **Only infer what someone reads.** A callback whose return value nobody consumes still gets its full type inferred into your structures. Router's guide: return `Promise<void>` from a prefetching loader so query data never enters the route tree.
- **Never make consumers use your widest type.** A type with no type arguments that spans every entry (`LinkProps`) is expensive to check against. Provide `as const satisfies` patterns and narrowed helper types for consumers to use instead.
- **Prefer objects over large tuples** for collections of typed entries; Router's `addChildren` accepts an object for this reason.
- **Prefer `interface ... extends` over intersections** for composed object types: interface relationships are cached and display better, intersections are re-checked member by member.
- **Name complex types.** A named type alias or interface is cached and emitted by name; the same type written inline is recomputed and expanded into every `.d.ts` that uses it.
- **Annotate return types of exported functions** whose inferred return is large, so the compiler and declaration emit do not re-derive it at every use.
- **Bound recursion.** Recursive conditional types over paths or deep objects need a depth limit or a tail-recursive form, and a type test at the deepest supported depth.

Sources: `docs/router/guide/type-safety.md` (Performance Recommendations), microsoft/TypeScript wiki "Performance".
