# Versions

Install current versions, but keep the couplings. Query each with `npm view <package> version`.

## Couplings

- `@effect/tsgo` decides three versions. Its README section "Supported Package Versions" (`node_modules/@effect/tsgo/README.md`) lists the TypeScript, `oxlint` and `oxlint-tsgolint` versions it supports. Pick versions from that table, not the npm latest.
- `@oxlint/plugins` must equal the `oxlint` version: the anti-slop plugin imports it.
- `oxlint-plugin-effect` and `@shekohex/oxc-effect` track `oxlint`. After a bump, re-check the rule tables in `rule-ownership.md`.
- `effect`, `@effect/platform-bun` and `@effect/vitest` share one version. In a monorepo, pin them once in the workspace `catalog`. Effect v4 ships on the `rc` dist-tag; `beta` stopped at `4.0.0-beta.107`.
- `@effect/vitest` pins the `vitest` major: the `4.0.0-rc` line needs `vitest` 5, `4.0.0-beta.107` needs `vitest` 4.
- Pin the oxlint family exactly (`bun add -d --exact`). A caret range lets one package move without the others.

## Known-good set (26 September 2026)

| Package | Version |
|---|---|
| bun | 1.3.14 |
| @types/bun | 1.4.2 |
| typescript | 7.0.2 |
| @effect/tsgo | 0.46.0 |
| oxlint, @oxlint/plugins | 1.85.0 |
| oxlint-tsgolint | 7.0.2003 |
| oxlint-plugin-effect | 0.12.1 |
| @shekohex/oxc-effect | 0.2.1 |
| oxfmt | 0.70.0 |
| ultracite | 7.12.0 |
| effect, @effect/platform-bun, @effect/vitest | 4.0.0-rc.117 |
| vitest | 5.0.2 |
| turbo (monorepo) | 2.10.12 |
