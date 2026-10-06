# Type tests

Inferred types are behaviour, so they get tests like runtime behaviour does. TanStack Router's maintainer rule (`packages/AGENTS.md`): "For public type changes, add `*.test-d.*` inference regressions and run both unit and type targets."

## Where and how

- Put type tests in `*.test-d.ts` (or `.test-d.tsx`) next to the source. Use the repo's existing runner; with Vitest, `expectTypeOf` from `vitest` and `test.typecheck.enabled` (its default include pattern already matches `*.test-d.*`). Without Vitest, `expect-type` or `tsd` do the same job.
- Run them as their own target (`test:types`) in CI next to unit tests. A type test that only runs in the editor is not a test.

### Import from the public entry

Tests import from the package name, the way consumers do, so they exercise the `exports` map and not `src/internal`. Before anything is built, point the package name at source with a custom export condition:

```jsonc
// package.json
"exports": { ".": { "source": "./src/index.ts", "types": "./dist/index.d.ts", "import": "./dist/index.js" } }
// tsconfig.json
"compilerOptions": { "customConditions": ["source"] }
// vitest.config.ts
resolve: { conditions: ["source"] }
```

The packed-output checks in [Publishing](publishing.md) then cover the built path. If the repo already uses tsconfig `paths` for this, keep that instead.

## Mistake checklist

Step 1 writes one failing line for every class here that the API can hit. Using the same list every time makes runs comparable.

| Class | Example |
|---|---|
| Unknown key or name | `track({ name: 'signin', ... })` when only `signup` exists |
| Wrong value type | `plan: 'enterprise'` where `'free' \| 'pro'` is allowed |
| Missing required field | `track({ name: 'signup' })` |
| Extra property | an unknown key inside the payload |
| A sibling variant's value | `signup` with `pageView`'s payload |
| Conflicting or incomplete options | `retry: { backoffMs }` without `maxAttempts`; `retry: true` |
| Value from another instance | an event defined on another catalog, a key from another client |
| Field read before narrowing | `result.data` or `result.retryAfterMs` before checking `status` |
| Old or positional call shape | `track('signup', payload)` |
| Wrong dependency shape | a parser that is not a function, a transport with the wrong return |

## What to assert

- **Exact types, written out.** Use `toEqualTypeOf<...>()`, not `toMatchTypeOf` or `toExtend`: a result that widens from `Group[]` to `Group[] | unknown` must fail. Write the expected type as a literal structure (`{ status: 'accepted'; eventId: string } | ...`), not as the library's own exported alias: if the alias widens, an assertion against it widens with it and still passes. `any` passes loose assertions silently; add `expectTypeOf(x).not.toBeAny()` where a widening to `any` is the likely regression.
- **Every inference path.** Inline options, extracted options through the helper (`queryOptions`), the curried factory, the `Register`-ed path and the unregistered default.
- **Narrowing.** After the discriminant check, the narrowed field has the exact type:

  ```ts
  const result = useThing({ ... })
  if (result.status === 'success') {
    expectTypeOf(result.data).toEqualTypeOf<Group[]>()
  }
  ```

- **Every mistake.** Each line from the checklist is marked `// @ts-expect-error` with a comment naming the rule it breaks. If the line ever compiles, `@ts-expect-error` itself becomes the error, so the test goes red:

  ```ts
  // @ts-expect-error: initialData must match queryFn's data type
  queryOptions({ queryKey: ['g'], queryFn: fetchGroups, initialData: 'nope' })
  ```

  Keep one mistake per `@ts-expect-error` so an unrelated error cannot satisfy it.

### Error text

`@ts-expect-error` proves a call fails, not that the message helps. Where the message is part of the design (a per-variant generic chosen over a union, a constraint written to produce a specific error), lock it with a unit test that compiles a snippet through the TypeScript compiler API (`ts.createProgram` over an in-memory host, then `getPreEmitDiagnostics`) and asserts that the diagnostic text names the wrong field. Keep these few; they pin compiler wording that can change between TypeScript versions.

## Runtime guards get runtime tests

Where the type cannot prove a fact and the library checks at runtime (a `from` hint that does not match the rendered route, a transport returning the wrong number of results, a duplicate package instance), write a unit test that calls the public API the way a consumer would and asserts the thrown error. Apply the **test-behavior-not-implementation** principle (call the Skill tool with "principles" and read its reference).

## Done when

Replacing the precise type in any changed signature with `any` or a wider union turns at least one test red. Try it on each changed signature and restore it. A widening that leaves every test green either changes nothing a consumer can observe, or is a missing test: decide which and say so.
