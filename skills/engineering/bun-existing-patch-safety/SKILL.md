---
name: bun-existing-patch-safety
description: Safely extend an existing Bun patchedDependencies patch without dropping prior hunks or shipping .bun-tag artifacts. Use when modifying a package that is already patched through Bun patchedDependencies.
---

# Safe existing Bun patch workflow

Use when modifying a package already registered under Bun `patchedDependencies`.

1. Identify the exact pinned package version and patch file.
2. Confirm the patch currently contains every pre-existing required symbol and hunk.
3. Run `bun install --force` so the installed package reflects the committed patch.
4. Run `bun patch <package>@<version>`.
5. Before editing, inspect the editable directory Bun prints and verify the pre-existing patched behavior is present. If it is missing, stop: the workspace is stale.
6. Make the narrow package edit.
7. Run `bun patch --commit <exact-directory-printed-by-bun-patch>`.
8. Inspect the generated patch:
   - grep for every old required symbol and every new symbol;
   - remove any generated `node_modules/<package>/.bun-tag-*` hunk;
   - verify unrelated hunks are unchanged.
9. Run `bun install --force` again.
10. Confirm the installed package contains both old and new symbols.
11. Run all old and new contract tests, typecheck, and repository checks.

A successful `bun patch --commit` proves nothing on its own: a syntactically valid patch can still have silently lost earlier behavior.
