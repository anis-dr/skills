---
name: typescript-library
description: "Design and ship the public TypeScript surface of a library or SDK so types infer end to end and misuse fails to compile, the way TanStack libraries do. Use when adding or changing a published package's exported functions, types or options, writing its type tests, reviewing a library PR, or preparing a release."
---

# TypeScript library

A library's types are its API. The caller writes plain values and the library infers everything else, so the call site carries no generic arguments, casts or annotations, and every wrong call is a compile error at the line that is wrong. TanStack Router and Query are the bar: types "flow through the entire routing experience" and "you write less types as a developer".

This skill covers the published surface: what consumers import and call. For types inside the implementation, call the Skill tool with "typescript-best-practices". For the module's shape (what it hides, where the seam goes), call the Skill tool with "codebase-design".

## Steps

1. **Write the call sites first.** Before any signature, write the code a consumer will write, in a type test file next to the source (`src/<feature>.test-d.ts`), importing from the package's public entry (set that up before the first build per [Type tests](references/type-tests.md#import-from-the-public-entry)). Cover the common case, the advanced case, and every mistake class in [the mistake checklist](references/type-tests.md#mistake-checklist) that applies. Done when every call site reads as plain values with no generic arguments, casts or annotations, and each applicable mistake class has a line that must fail.
2. **Shape the signatures** so those call sites compile, applying every rule in [API shape](references/api-shape.md). Then remove the `@ts-expect-error` from each mistake line one at a time, compile, and read the message. Done when the implementation contains no cast that a looser implementation signature could remove, each rule in that file has been checked against every new or changed export, and every mistake's error lands on the caller's wrong value and names what it expected.
3. **Turn the call sites into type tests** per [Type tests](references/type-tests.md): exact-type assertions for what infers, `@ts-expect-error` for every mistake from step 1, an error-text test where the message is the contract, plus runtime tests for runtime guards. Done when the type test target runs red if any inferred type widens to `any`, `unknown` or a broader union, and every mistake has a failing-compile line.
4. **Check what you publish** per [Publishing](references/publishing.md): lint the package, pack it, run `attw` on that tarball, and compile a consumer fixture against it under each supported module resolution and TypeScript version. Done when all of them pass on the packed output, not on the source tree.
5. **Measure type cost** when the change adds recursion, a union over registered entries (routes, keys, events), or inference across more than one call. Follow [Type performance](references/type-performance.md). Done when you have baseline and candidate numbers from `tsc --extendedDiagnostics` on a realistic consumer fixture and check time does not regress without a stated reason.
6. **Classify the change for semver** with the table in [Publishing](references/publishing.md#semver-for-types), and write the classification in the changeset or PR body.

## Rules that apply to every export

These are the rules a reviewer checks first. [API shape](references/api-shape.md) holds the full set with TanStack examples.

- **Zero-annotation call sites.** If a consumer has to write `<T>`, `as`, or a type annotation for something the library could know, the signature is wrong.
- **Never ask for one type argument out of several.** TypeScript has no partial inference: an explicit `<A, B>` turns off inference for every other parameter (Query documents this for `useQuery<Group[], string>`). Infer from a value, use a curried factory (`createRootRouteWithContext<Ctx>()({...})`), or a `Register` interface.
- **One options object.** Public functions take a single object whose keys name each input. Query v5 removed its positional overloads for this reason. When the single argument is itself the domain value (`track({ name, payload })`), that object is the options object; do not wrap it again.
- **Illegal calls do not compile.** Every combination of options the runtime would reject is a type error, modelled with discriminated unions, overloads selected by option presence, typed sentinels and branded keys rather than runtime checks alone.
- **Results narrow.** A result with states is a discriminated union, so checking `status` or `isSuccess` makes `data` defined.
- **Public types are few and named.** Export a small set of stable helper types for consumers (`ValidateLinkOptions`, `queryOptions`); everything else stays internal and can change.
