---
name: anti-slop-migration
description: Migrate an existing TypeScript codebase to zero anti-slop Oxlint findings without type laundering or behavior regressions. Use after installing the anti-slop plugin into a repo with findings, when fixing one rule category, or when migrating no-unknown-parameters and unsafe dictionary findings at dynamic boundaries.
---

# Anti-slop TypeScript migration

Use after the anti-slop Oxlint plugin is installed and the repo has existing findings. Completion means zero configured lint diagnostics, reached by fixing contracts at their root. A finding is never fixed by a semantic loophole, an unsafe cast, `any`, a suppression, or a weaker severity.

## Order of categories

Fix categories in dependency order. Later categories shrink as earlier contracts improve:

1. `no-object-parameters`
2. `no-reflect-get` / `no-reflect-apply`
3. `no-chained-type-assertions`
4. `no-shape-in-symbol-names`
5. `no-unknown-returns`
6. `no-known-value-widening`
7. `no-conditional-empty-object-spread`
8. `no-unknown-parameters`
9. `no-unsafe-dictionary-type`
10. `no-runtime-typeof`
11. `require-safety-comment-for-type-assertion`

Leave safety comments for last. Schema and owner-contract migrations remove many assertions first.

When the user asks for one category only, pick it (normally the smallest remaining set) and leave the other categories alone unless they approve more.

## One category at a time

1. Count categories:
   ```bash
   bunx oxlint --format json | jq -r '.. | objects | .code? // empty' | sort | uniq -c
   ```
2. List the exact locations of the chosen category, grouped by file:
   ```bash
   bunx oxlint --format json | jq -r '.. | objects | select(.code? == "anti-slop(RULE)") | [.filename, (.labels[0].span.line|tostring), .message] | @tsv'
   ```
3. Read the rule implementation under `tools/oxlint/anti-slop/rules/`, so the fix honors the rule's intent instead of dodging its syntax check.
4. Trace exported symbols with LSP references before changing their contracts. Use LSP rename for symbol renames.
5. Fix root contracts:
   - parse external or persisted data at boundaries;
   - derive types from schemas and owners;
   - use named contracts for mutable or public objects;
   - use inference or `satisfies` for known literals;
   - use Shoehorn only for deliberately partial test fixtures.
6. Confirm the category count is exactly zero with the JSON query from step 2.
7. Run the application TypeScript project, the test TypeScript project when fixtures changed, and focused behavioral tests for touched paths.

Report the category count before and after, plus the remaining full-lint baseline.

## Rule-specific patterns

- Broad return annotations: prefer inference; keep named owner contracts at public or mutable boundaries.
- Conditional empty spreads: build the result, then assign optional fields explicitly. A logical-or or `undefined` spread is the same loophole in another form.
- Test fixture casts: use `@total-typescript/shoehorn` (`fromPartial` or `fromAny`).
- Unsafe dictionaries: replace unowned `Record<string, unknown>` with schema-derived input records or explicit domain interfaces (see the next section).
- Type assertions: remove or parse first. Add a `SAFETY:` comment only where TypeScript cannot express a checked invariant.

## Boundaries: no-unknown-parameters and unsafe dictionaries

The goal is to remove boundary `unknown` parameters and unsafe dictionary contracts while keeping runtime behavior and useful type evidence.

1. Separate true boundaries from owned domain data. Boundary and parser inputs may accept every JavaScript value. Internal and domain interfaces expose explicit fields and no catch-all index signature.
2. Create one schema-derived owner for boundary types:

   ```ts
   import { z } from "zod";

   export type RuntimeValue =
     | string
     | number
     | boolean
     | bigint
     | symbol
     | object
     | null
     | undefined;

   export const RuntimeValueSchema = z.unknown().transform((value) => {
     // SAFETY: RuntimeValue enumerates every ECMAScript runtime value category.
     return value as RuntimeValue;
   });

   export type RuntimeInput = z.input<typeof RuntimeValueSchema>;
   export type RuntimeInputRecord = Record<string, RuntimeInput>;
   ```

   Import these explicitly. Expose them through an ambient `.d.ts` only when dozens of boundary files need them. Use them only for unparsed boundaries, and parse or narrow before domain logic.
3. For runtime checks, expose schema-backed type predicates such as `isRuntimeString`, `isRuntimeNumber` and `isRuntimeRecord`. Callers keep TypeScript narrowing without ad hoc `typeof` checks.
4. Migrate parameters:
   - Replace explicit `unknown` with `RuntimeInput` only on genuine boundary or parser parameters.
   - Keep the existing validation and narrowing inside the function.
   - Rename semantic error-enrichment parameters to `cause` where that fits.
   - `any`, a bare alias to `unknown`, and a generic identity alias added only to satisfy the rule are all type laundering.
5. Migrate dictionaries:
   - Replace truly unparsed `Record<string, unknown>` values with `RuntimeInputRecord`.
   - Keep a recursive JSON record out of global replacements: optional fields and typed interfaces become incompatible with it.
   - Remove catch-all index signatures from domain interfaces and declare the actual fields.
   - Where a provider object stays open, use a named boundary record or parse it with a provider-specific Zod schema.
6. Bulk edits: use syntax-aware AST or token edits that match exact type nodes only. Run TypeScript after each bulk pass. The compiler errors are the inventory of owner contracts that need explicit fields.

## Error objects

`Error` instances do not survive `z.record` parsing or object spread: `message`, `name` and `cause` may be non-enumerable. When converting an error to a record for retry or failure classification, copy these fields explicitly alongside the enumerable custom fields.

## Final verification

Run the repo's equivalents of:

```bash
bunx tsc --noEmit -p tsconfig.json   # every required TypeScript project
bun run test:typecheck
bun run test
bun run fmt:check
bun run build
bun run lint
```

For a single-category migration, focused tests for every changed behavior are enough; run the full suite for broad cross-cutting migrations. Confirm each targeted rule count is zero on its own, independent of the remaining lint baseline, and report the exact remaining diagnostics.
