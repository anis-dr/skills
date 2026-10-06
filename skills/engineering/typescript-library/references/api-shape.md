# API shape

Each rule is a check against every new or changed export. Examples are TanStack's, cited by file at the commit this skill was distilled from: Router `30fc108`, Query `d169ee8`.

## Inference

### Infer from values the caller already writes

The caller passes a function, a schema or a literal; the library reads its type. Query infers `data` from `queryFn`'s return and re-infers it through `select`:

```ts
const { data } = useQuery({
  queryKey: ['test'],
  queryFn: () => Promise.resolve(5),
  select: (n) => n.toString(),
})
// data: string | undefined
```

Put the inference source where the caller writes real code (a fetcher, a validator, a loader) and let every later option read from it through context. A callback parameter the caller has to annotate is a missed inference site.

### Get partial inference without partial type arguments

TypeScript infers all type parameters or none. Query's guide shows the cost: `useQuery<Group[], string>(...)` fixes the error type and loses inference for every other generic. When one type cannot come from a value, use one of these instead:

- **Curried factory.** The first call takes the explicit type, the second infers the rest. Router: `createRootRouteWithContext<RouterContext>()({ component })`. Document that it is called twice.
- **`Register` interface.** For a type that is the same across the whole app (the router, the default error, the meta shape), export an empty `interface Register {}` and let consumers fill it by declaration merging. Read it with a conditional type that falls back to a default:

  ```ts
  export interface Register {}
  export type RegisteredRouter = Register extends { router: infer R } ? R : AnyRouter
  ```

  Router (`router-core/src/router.ts`, `Register` and `RegisteredRouter`) and Query (`query-core/src/types.ts`, `Register` with `defaultError`, `queryMeta`, `queryKey`) both do this. One registration line types every top-level export.
- **Derive from a value the caller owns.** `typeof router`, a schema's output type, a generated file (`routeTree.gen.ts`), or the value itself passed into a factory (`createClient({ events })`).

Choose between the last two by who needs the type: when every export that needs it already receives the value, derive from the value. Use `Register` only when exports that never receive the value (Router's top-level `Link` and `useNavigate`, Query's `error` field everywhere) still need its type.

### Keep literals literal

Use a `const` type parameter where a literal in a list or object the caller writes matters downstream (column keys, tuple shapes, a list of allowed names), so callers never write `as const`. A plain `T extends string` already infers string literals; `const` is for arrays and objects:

```ts
function defineColumns<const C extends readonly { key: string }[]>(columns: C): Table<C[number]['key']>
```

`const` makes arrays `readonly` and freezes every nested literal, so keep it off parameters that carry consumer data (payloads, records), where `tags: ['home']` must stay `string[]`. Constraints on a `const` parameter must accept readonly arrays.

### Choose which argument decides a type

When a type parameter appears in several positions, mark the positions that must not drive inference with `NoInfer` so the right argument wins and the others are checked against it. Router uses `ResolveRelativePath<TFrom, NoInfer<TTo>>`; Query uses `NoInfer<TQueryKey>` in `persister`. Typical case: a default value or fallback must match the type inferred from the main input, not widen it.

### Keep types when options are extracted

Inline options infer; options moved into a variable or function lose their context. Ship an identity helper that captures the type at the definition site, the way `queryOptions` and `mutationOptions` do. The helper's input must be typed by the same source the later call uses, so the definition gets the same checks (excess properties, literal unions) and the error lands where the object is defined:

```ts
function groupOptions() {
  return queryOptions({ queryKey: ['groups'], queryFn: fetchGroups })
}
useQuery(groupOptions())
queryClient.getQueryData(groupOptions().queryKey) // Group[] | undefined
```

`queryOptions` can be a free function because the type comes from a value inside the options (`queryFn`). When the type comes from a registry or catalog, bind the helper to it: a method on the catalog (`events.event({ name, payload })`), a curried factory, or a `Register`-ed type. A catalog-agnostic `event<const T>(e: T)` loses excess-property checks and reports mistakes only at the later call.

For consumers who build typed wrappers around your components, export a validation helper type that checks an inferred object at its use site (`ValidateLinkOptions<TRouter, TOptions>`) instead of asking them to annotate with your widest type.

### Carry types across calls with phantom tags

When one call creates a value and a later call reads data by it, tag the value's type with the data type so the later call infers it. Query brands the returned `queryKey` with `DataTag` (a `unique symbol` key holding the data and error types, `query-core/src/types.ts`), which is how `getQueryData(options.queryKey)` returns `Group[] | undefined` instead of `unknown`. A tag costs nothing at runtime and replaces a generic argument at every read site.

## Misuse resistance

### One options object

Public functions take one object. Positional parameters force callers to remember order, make optional middle arguments awkward, and need overloads plus runtime type sniffing to evolve. Query v5's migration guide ("Supports a single signature, one object") removed them for exactly that maintenance and runtime-check cost. A single required, self-evident argument (`getRouteApi('/posts')`) is the exception, and so is a single argument that is itself the domain value (`track({ name, payload })`).

### Make illegal states unrepresentable in options

If two options conflict, or one requires another, encode it in the type, not a runtime throw alone. Model variants as a discriminated union on a literal key, or as overloads selected by which options are present. Query's `queryOptions` has separate overloads for "with `initialData`" (result `data` is never `undefined`) and "without", so the result type is as precise as the input allows. Apply the **type-system-discipline** principle (call the Skill tool with "principles" and read its reference) for the general patterns.

### Use typed sentinels instead of boolean switches

A boolean that changes which other options are valid (`enabled: false` next to a `queryFn` that needs a non-null argument) cannot narrow anything. Query's `skipToken` replaces `queryFn` itself to disable the query, so the real `queryFn` only exists when its inputs do.

### Results are discriminated unions

A result with states is a union discriminated by `status`, and any convenience booleans (`isSuccess`, `isError`) narrow the same way. Checking a state makes the fields valid in that state defined; fields that are not are absent or `undefined` in the type.

### Narrowing hints with a matching runtime check

When a value's type depends on where it is used and the compiler cannot see that place (component context, a registry), take an optional hint (`from: '/posts/$postId'`) that narrows the type, and verify the hint at runtime: Router throws when `from` does not match the rendered route. Offer an explicit escape hatch for shared code (`strict: false`) that returns the honest wide type instead of a lie.

### Precise return types

Return the narrowest true type. `unknown` or a wide union on a return pushes a cast onto every caller (TanStack DB `AGENTS.md`, "Return Type Precision").

### Public generic signature, loose implementation signature

When the precise public signature makes the implementation need casts, declare the public generic signature as an overload and implement against a looser signature, as Router's type-utilities guide does for `HeadingLink`:

```ts
export function HeadingLink<TRouter extends RegisteredRouter, TOptions>(
  props: HeaderLinkProps<TRouter, TOptions>,
): React.ReactNode
export function HeadingLink(props: HeaderLinkProps): React.ReactNode {
  return <Link {...props.linkOptions} />
}
```

The compiler checks the implementation only against the loose signature, so the precise one is guarded by type tests and runtime tests, not by the compiler. The same gap opens silently when a class or object implements a public interface declared with method syntax (`track(e: ...): ...`): methods are checked bivariantly, so a too-loose implementation is accepted. Declare members the library implements as function-typed properties (`track: <N extends ...>(e: ...) => ...`) to get the strict check, or cover them with the same tests.

### Injected dependencies are a boundary

A transport, storage adapter or callback the consumer supplies is outside the library's types: its return value is checked only by the consumer's compiler, if at all. Validate what it returns before relying on it (a transport that returns fewer results than events sent must throw a clear error, not leave holes), per the **boundary-discipline** principle (call the Skill tool with "principles" and read its reference).

### A small, named public type surface

Router's type-utilities guide: "Most types exposed by TanStack Router are internal, subject to breaking changes". Export the few helper types consumers need by name, document them, and treat them as API. Keep internal types out of the entry point (or under an explicitly internal path) so they can change.

### Readable failures

A misuse error should point at the wrong argument and say what was expected. Constrain the parameter where the caller writes it (so the red squiggle lands on their value, not deep inside a conditional type), and prefer a union of the valid literals over a computed type when the set is small.

A parameter typed as a union of every variant (`EventOf<E>` over all events) rejects the same bad calls as a per-variant generic, but reports "not assignable to union" instead of naming the wrong field. Use a type parameter for the discriminant (`track<N extends keyof E>(e: EventOf<E, N>)`) and map tuples per element (`{ [I in keyof N]: EventOf<E, N[I]> }`) so each error names the one variant the caller meant. Type tests cannot see the difference; read the messages (step 2) and lock the ones that matter with an error-text test (see [Type tests](type-tests.md#error-text)).
