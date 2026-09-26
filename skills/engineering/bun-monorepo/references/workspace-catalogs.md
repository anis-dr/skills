# Workspace catalogs in a publishing monorepo

Centralize shared dependency versions with Bun catalogs without breaking npm publishes.

## Enumerate every publish path first

`bun publish` and `bun pm pack` are the only paths that resolve `catalog:` (see "Shared gotchas" in `SKILL.md`). Before migrating, list who publishes and how:

```bash
jq -r '[.name, (.private // false)] | @tsv' packages/*/package.json apps/*/package.json  # who publishes
grep -rn "publish" .github/workflows/ package.json *.sh | grep -vi node_modules          # how
```

Safe: `bun publish` per package. Unsafe: `changeset publish`, `npm publish`, semantic-release.

## Migration procedure

1. Inventory deps that appear in two or more workspace package.json files (dependencies and devDependencies).
2. Root `package.json`: convert the `workspaces` array to object form and add `catalog: { ... }`, each entry pinned to the highest range currently used in the repo.
3. Rewrite consumers to `"<dep>": "catalog:"`.
4. `bun install`; verify the lock diff contains only specifier bookkeeping, with zero resolved package-version changes. Drift like react ^19.0.0 vs ^19.2.5 usually already resolves to one version; the migration fixes specifiers, not resolutions.

## Policy rules

- **peerDependencies stay out of the catalog.** They are published compatibility contracts, not install versions.
- **Deps owned by `overrides` stay out of the catalog.** `overrides` silently wins, so a catalog entry creates a second edit site that does nothing. One owner per version.
- **Every package declares every dep it imports.** Relying on hoisting from another workspace package is a phantom dependency and breaks per-package installs.
- Check that `patchedDependencies` still resolve to the exact patched version after reinstall.

## Fixing an unsafe changesets path (keep changesets, add a resolver)

Write `scripts/resolvePublishManifests.mjs` (node:fs only):

- Discover packages from the workspace globs (handle the array and the `{ packages: [...] }` forms; expand simple `dir/*` globs with readdirSync), and keep those with `private !== true`. A hardcoded package list lets a future publishable package silently ship `catalog:`.
- Resolve `workspace:*` to internal versions and `catalog:` to the catalog range across dependencies, devDependencies and peerDependencies, all in memory first. Write files only after every package validates. A missing entry exits 1 listing all missing entries, because a half-written tree blocks retries.
- Stable output: 2-space JSON plus a trailing newline.

The release-script order matters:

```
build -> git add/commit build artifacts -> git tag -> RESOLVE -> changeset publish -> git checkout -- <manifests>
```

- Resolving before the commit permanently strips `catalog:` from the repo on the first release.
- The restore runs on success and on failure (preserve the publish exit code), plus a `trap 'git checkout -- ...' EXIT INT TERM` around the resolve-to-publish window for Ctrl-C.

If `changesets/action` runs this release and tags or GitHub releases go missing, also follow [Changesets publishing](changesets-publishing.md).

## Verification checklist

- Resolver smoke: run it, grep the published manifests for `catalog:|workspace:` (must be 0), restore byte-identically, and negative-test a missing catalog entry in a /tmp fixture (exit 1, zero writes).
- `bash -n` the release script.
- Lock diff: only importer and specifier lines changed; resolved `name@version` entries identical.
