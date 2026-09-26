---
name: bun-monorepo
description: "Bun monorepo dependency and release safety. Use when adopting Bun workspace catalogs in a monorepo that publishes to npm, or when a published manifest contains catalog: specifiers; when extending a package already patched through Bun patchedDependencies; or when changesets/action publishes through a custom Bun script and Git tags or GitHub releases are missing."
---

# Bun monorepo

Three Bun monorepo tasks. Pick the branch, then read its reference file in full before acting.

- [Workspace catalogs](references/workspace-catalogs.md): adopting Bun `catalog:` versions in a monorepo that publishes to npm, or a published manifest shipped a literal `catalog:` specifier.
- [Patched dependencies](references/patched-dependencies.md): changing a package already registered under `patchedDependencies`.
- [Changesets publishing](references/changesets-publishing.md): `changesets/action` publishes through a custom Bun script, or npm has the new version but its Git tag or GitHub release is missing.

## Shared gotchas

- Only `bun publish` and `bun pm pack` rewrite `catalog:` and `workspace:` specifiers to concrete versions. `changeset publish`, `npm publish` and semantic-release ship the literal string and break every consumer install. Keep `bun publish` as the publisher when you can; the workspace catalogs branch covers the resolver for when you keep `changeset publish`.
- `patchedDependencies` pin an exact version. After any reinstall or catalog change, confirm each patched package still resolves to that version.
- A successful command proves nothing on its own: check the artifact it produced (the lock diff, the generated patch, the published manifest, the tag and release).
