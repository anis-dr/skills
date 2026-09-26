---
name: bun-catalog-publish-safety
description: "Migrate a Bun monorepo to workspace catalogs safely when packages are published to npm, especially via changesets; audit and fix release paths that ship literal catalog: specifiers. Use when adopting Bun catalogs in a publishing monorepo or when a published manifest contains catalog: specifiers."
---

# Bun workspace catalogs in a publishing monorepo

Centralize shared dependency versions with Bun catalogs without breaking npm publishes.

## The core hazard

Only `bun publish` and `bun pm pack` rewrite `catalog:` specifiers to concrete semver.
`changeset publish` (and anything that shells out to `npm publish`) ships the literal string
`"catalog:"` in the published manifest and breaks every consumer install.

Before migrating, enumerate every publish path:

```bash
jq -r '[.name, (.private // false)] | @tsv' packages/*/package.json apps/*/package.json  # who publishes
grep -rn "publish" .github/workflows/ package.json *.sh | grep -vi node_modules          # how
```

Safe: `bun publish` per package. Unsafe: `changeset publish`, `npm publish`, semantic-release.

## Migration procedure

1. Inventory deps that appear in two or more workspace package.json files (dependencies and devDependencies).
2. Root `package.json`: convert the `workspaces` array to object form and add `catalog: { ... }`,
   each entry pinned to the highest range currently used in the repo.
3. Rewrite consumers to `"<dep>": "catalog:"`.
4. `bun install`; verify the lock diff contains only specifier bookkeeping, with zero resolved
   package-version changes. Drift like react ^19.0.0 vs ^19.2.5 usually already resolves to one
   version; the migration fixes specifiers, not resolutions.

## Policy rules

- **peerDependencies stay out of the catalog.** They are published compatibility contracts, not install versions.
- **Deps owned by `overrides` stay out of the catalog.** `overrides` silently wins, so a catalog entry
  creates a second edit site that does nothing. One owner per version.
- **Every package declares every dep it imports.** Relying on hoisting from another workspace
  package is a phantom dependency and breaks per-package installs.
- Check that `patchedDependencies` still resolve to the exact patched version after reinstall.

## Fixing an unsafe changesets path (keep changesets, add a resolver)

Write `scripts/resolvePublishManifests.mjs` (node:fs only):

- Discover packages from the workspace globs (handle the array and the `{ packages: [...] }` forms; expand
  simple `dir/*` globs with readdirSync), and keep those with `private !== true`. A hardcoded package
  list lets a future publishable package silently ship `catalog:`.
- Resolve `workspace:*` to internal versions and `catalog:` to the catalog range across dependencies,
  devDependencies and peerDependencies, all in memory first. Write files only after every package
  validates. A missing entry exits 1 listing all missing entries, because a half-written tree
  blocks retries.
- Stable output: 2-space JSON plus a trailing newline.

The release-script order matters:

```
build -> git add/commit build artifacts -> git tag -> RESOLVE -> changeset publish -> git checkout -- <manifests>
```

- Resolving before the commit permanently strips `catalog:` from the repo on the first release.
- The restore runs on success and on failure (preserve the publish exit code), plus a
  `trap 'git checkout -- ...' EXIT INT TERM` around the resolve-to-publish window for Ctrl-C.

## Verification checklist

- Resolver smoke: run it, grep the published manifests for `catalog:|workspace:` (must be 0),
  restore byte-identically, and negative-test a missing catalog entry in a /tmp fixture (exit 1, zero writes).
- `bash -n` the release script.
- Lock diff: only importer and specifier lines changed; resolved `name@version` entries identical.
