---
name: pragmatic-effect
description: "Use when the user asks to use Effect, write or refactor Effect code, simplify overcomplicated Effect abstractions, or keep Effect code pragmatic. Trigger on Effect, effect-smol, Effect.gen, Context.Service, Layer, Schema, runtime bridges, services, scoped state, or comments like 'we are complicating this'. Focuses on practical Effect v4 patterns that keep synchronous/domain logic plain while preserving typed effects, lifecycle, resource safety, and testable dependency boundaries."
---

# Pragmatic Effect

Use this as a simplification lens alongside the other Effect skills. Pragmatic Effect code is not "avoid Effect"; it is "use Effect where it buys typed effects, dependency boundaries, lifecycle, resource safety, retries, concurrency, or schemas; keep everything else plain."

## Source check

Before implementing Effect-heavy code:

1. Inspect nearby code in the target repo.
2. Read project rules such as `AGENTS.md`, `CLAUDE.md`, package rules, or local Effect skills when present.
3. Prefer current Effect v4/effect-smol APIs and checked-in examples over old Effect v2/v3 memory. Call the Skill tool with "effect-v4" for the API reference and migration notes.
4. If a source file referenced by instructions is missing, say so and continue with available local examples.

## Simplification rule

Ask these before adding machinery:

- Is this helper actually effectful? If not, keep it synchronous.
- Is this a real dependency/lifecycle boundary? If not, avoid `Context.Service`.
- Is this a public service method or important workflow? If yes, use `Effect.fn("Domain.method")`.
- Is this a private helper/hot path? Use a plain function if synchronous, or `Effect.fnUntraced` if effectful.
- Is this wrapping a library just to make it "ours"? Prefer the library's Effect-native surface directly.
- Are dependencies being provided at one layer/runtime boundary? Avoid scattered `Effect.provide(...)` in business logic.

## Module shape

Prefer flat modules with a self re-export:

```ts
export interface Interface {
  readonly get: (id: ID) => Effect.Effect<Info | undefined>
}

export class Service extends Context.Service<Service, Interface>()("@app/Thing") {}

export const layer = Layer.effect(Service, make)
export const defaultLayer = layer.pipe(Layer.provide(Dependency.defaultLayer))

export * as Thing from "./thing"
```

Do not create `export namespace Foo { ... }`. Keep private helpers as normal non-exported top-level functions.

## Plain helpers first

Keep synchronous logic outside Effect:

- string/path formatting
- option building
- type guards
- JSONC patch calculation
- command argument construction
- domain equality/coalescing functions
- simple filtering, sorting, or mapping

Examples of helpers that should usually stay plain: `buildArgs(...)`, `patchJsonc(...)`, `isWritable(...)`, `sameRegistration(...)`, `coalesceEvents(...)`, `sortByRecency(...)`.

Only return `Effect` when the helper performs I/O, uses services, interacts with scope/fibers, decodes untrusted input effectfully, or composes other effects.

## Services and layers

Use `Context.Service` for dependency injection, test layers, shared platform services, runtime entrypoints, or lifecycle-owned state. Keep interfaces narrow and method-oriented.

```ts
export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const fs = yield* FSUtil.Service

    const get = Effect.fn("Thing.get")(function* (id: ID) {
      return yield* fs.readFileStringSafe(pathFor(id))
    })

    return Service.of({ get })
  }),
)
```

Layer guidance:

- `Layer.succeed` for config/static/no-op implementations.
- `Layer.effect` for effectful construction.
- `Layer.mergeAll` for a visible app/location graph.
- `Layer.provideMerge` when incrementally adding requirements while keeping composition flat.
- `Layer.fresh` when each lookup must own a fresh service graph.
- `Layer.orDie` only when construction failure should be a defect at that boundary.

A `defaultLayer` that wires dependencies explicitly at the bottom of the module is useful. Consumers can use `layer` for tests and `defaultLayer` for production.

## Runtime boundaries

Use managed runtime bridges at external boundaries only: CLI handlers, UI callbacks, SDK/framework callbacks, native plugin callbacks, or places non-Effect code must call Effect services.

A pragmatic runtime bridge usually has:

- one lazily-created `ManagedRuntime`
- shared `memoMap`
- observability/logging provided once
- methods like `runPromise`, `runFork`, `runCallback`
- optional context attachment for app/workspace/request refs

Do not introduce a runtime bridge inside ordinary service-to-service code. Yield the service or call `Service.use(...)` there.

## Accessor helpers

A tiny accessor helper like `serviceUse(Service)` is acceptable when it removes repeated `Service.use((svc) => svc.method(...))` boilerplate. Keep it as a single dynamic boundary and expose only Effect-returning methods.

Use it sparingly. If the call site is already inside a generator and the service is used several times, `const svc = yield* Service` is clearer.

## Schemas and errors

Use Schema as a contract, not as decoration.

- `Schema.Class` for exported multi-field domain records.
- `Schema.Struct` for local/lightweight shapes, tool parameters, request/response bodies.
- `Schema.Union(...).pipe(Schema.toTaggedUnion("type"))` or tagged classes for variants.
- `Schema.String.pipe(Schema.brand("Domain.ID"))` for IDs and domain primitives.
- `Schema.TaggedErrorClass` for typed errors.
- `Schema.Defect` for captured defect-like causes instead of `unknown`.
- `Schema.decodeUnknownOption` for tolerant config/metadata parsing.
- `Schema.decodeUnknownEffect(Schema.fromJsonString(...))` for untrusted JSON strings.

In `Effect.gen` / `Effect.fn`, yield tagged errors directly:

```ts
if (!item) return yield* new NotFoundError({ id })
```

Avoid `yield* Effect.fail(new NotFoundError(...))` for direct early failure branches.

## Platform boundaries

When already inside Effect code, prefer Effect-aware platform services if the surrounding code does:

- `FileSystem.FileSystem` / project filesystem service for file I/O.
- `ChildProcessSpawner` and `ChildProcess.make(...)` for process work.
- `HttpClient.HttpClient` for HTTP clients.
- `Config`, `Clock`, `DateTime`, `Path`, `Scope`, and `Stream` when they fit the module.
- `Effect.callback` for callback APIs.
- `Effect.acquireRelease`, `Effect.addFinalizer`, and `Effect.scoped` for cleanup.

It is still fine to use Bun/Node APIs in narrow synchronous helpers or when the module is intentionally outside Effect.

## Scoped state

For per-project/per-directory/per-instance state, use an explicit scoped cache/state helper rather than global singletons.

A pragmatic scoped-state pattern:

- cache by the real ownership key, such as project root, workspace id, instance id, or request scope
- initialize in the `make`/lookup closure
- invalidate on reload/dispose
- use finalizers for cleanup
- use `forkScoped` for background consumers tied to that owner
- fork non-blocking init at the call site, not inside the state constructor

Do not add extra `started` flags, `ensure()` callbacks, manual promise caches, or stored fibers when scoped cache semantics already solve it.

## Concurrency and lifecycle

Use advanced Effect concurrency only for real ownership semantics:

- `Deferred` for waiters, completion, and handoff.
- `SynchronizedRef` for atomic state transitions.
- `FiberSet` or scoped forks for owned background work.
- `Scope.fork` for cancellable per-job/per-session ownership.
- `Effect.uninterruptibleMask` when a state transition and fiber start must be atomic.
- `Effect.cached` / `Effect.cachedInvalidateWithTTL` for shared in-flight or TTL computations.

Keep this machinery localized inside modules such as job registries, run coordinators, event systems, or process/session ownership. Expose a simple service API to callers.

## Database and library wrappers

Do not invent extra abstractions over an Effect-native library unless the wrapper has a concrete job.

Good wrappers usually:

- expose the Effect-native `db`, client, adapter, or driver shape directly
- apply app setup such as migrations, pragmas, logging, tracing, or resource ownership
- keep transactions as Effect values, for example `db.transaction(() => Effect.gen(...))`
- let query builders remain yieldable directly
- avoid domain tables, migrations, post-commit hooks, and app language in generic packages

If a package is meant to be generic, keep project-specific domain concepts out of it.

## HTTP and tool handlers

Keep handlers thin:

- decode payload/query/body with Schema
- read request/session/location context
- call services
- map transport errors
- stream responses when needed

Business rules belong in services, not route handlers. Tool definitions should define Schema parameters and delegate execution to services or focused helpers.

## Testing

Use existing Effect test helpers when present:

- service/layer/runtime helpers such as `testEffect(layer)`
- live/integration helpers for filesystem, git, child processes, locks, HTTP servers, sockets, timing, or real platform behavior
- scoped fixtures such as temporary directories, finalizers, and test layers for cleanup
- explicit layers in each test file, often with small fake services via `Layer.succeed` or local mocks

Avoid mocks when a small live integration test is practical. Do not duplicate production logic in tests.

## Sources to re-check

When working in a target repo, inspect local examples before adding patterns:

- project-level Effect skills and agent rules
- runtime bridge files
- service helper/accessor files
- scoped state/cache files
- job/run coordinator files
- location/app layer composition
- event/PubSub modules
- process/filesystem/database modules
- representative tests near the target module
