# Versions

Install current versions, but keep the couplings. Query each with `npm view <package> version`.

## Couplings

- `@effect/tsgo` decides three versions. Its README section "Supported Package Versions" (`node_modules/@effect/tsgo/README.md`) lists the TypeScript, `oxlint` and `oxlint-tsgolint` versions it supports. Pick versions from that table, not the npm latest.
- After bumping `@effect/tsgo`, run `typecheck` before touching code. A renamed diagnostic in `diagnosticSeverity` reports `effect(deprecatedRuleName)`, and a new warning-level diagnostic can fire on existing code; both are warnings, and a warning fails `tsc`.
- `ultracite` declares peer ranges for `oxlint` and `oxfmt` (`npm view ultracite peerDependencies`). The `oxlint` version from the tsgo table must satisfy them; if it does not, use the newest `ultracite` whose range it does.
- `@oxlint/plugins` must equal the `oxlint` version: the anti-slop plugin imports it.
- `oxlint-plugin-effect` and `@shekohex/oxc-effect` track `oxlint`. After a bump, re-check the rule tables in `rule-ownership.md`. `oxlint-plugin-effect` also has an `effect` peer range: 0.32 needs `effect` 4.1 or later.
- `effect`, `@effect/platform-bun` and `@effect/vitest` share one version. In a monorepo, pin them once in the workspace `catalog`. Effect v4 ships on the `latest` dist-tag; `prev` is the last v3.
- `@effect/vitest` pins the `vitest` major: 4.x needs `vitest` 5.
- Moving an existing repo from `effect` 4.0.x to 4.1.x: apply [upgrade-4.1.md](upgrade-4.1.md) before running `typecheck`.
- Pin the oxlint family exactly (`bun add -d --exact`). A caret range lets one package move without the others.

## Known-good set (3 November 2026)

| Package | Version |
|---|---|
| bun | 1.4.4 |
| @types/bun | 1.4.4 |
| typescript | 7.0.2 |
| @effect/tsgo | 0.64.1 |
| oxlint, @oxlint/plugins | 1.90.0 |
| oxlint-tsgolint | 7.0.2005 |
| oxlint-plugin-effect | 0.32.1 |
| @shekohex/oxc-effect | 0.2.1 |
| oxfmt | 0.76.0 |
| ultracite | 8.1.1 |
| effect, @effect/platform-bun, @effect/vitest | 4.1.2 |
| vitest | 5.1.0 |
| turbo (monorepo) | 2.11.10 |

`oxlint` 1.91.0 is out, but `@effect/tsgo` 0.64.1 supports 1.88.0 to 1.90.0, so the set stays on 1.90.0.
