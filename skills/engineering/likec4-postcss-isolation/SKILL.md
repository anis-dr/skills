---
name: likec4-postcss-isolation
description: Fix likec4 serve failures in a monorepo where LikeC4's internal Vite app loads an unrelated root postcss.config. Use when likec4 serve reports "Failed to load PostCSS config" or "Invalid PostCSS Plugin" pointing at the repo root.
---

# LikeC4 PostCSS isolation

Use this when `likec4 serve` fails inside a monorepo with errors such as:

```text
Failed to load PostCSS config
Invalid PostCSS Plugin found at: plugins[0]
```

and the error points at the repo root `postcss.config.*`.

## Cause

LikeC4 serves its viewer through an internal Vite app rooted under its installed package. Vite searches upward for PostCSS configuration and can load the repo root `postcss.config.*`, which belongs to another app.

A PostCSS config beside the `.c4` files does not help: LikeC4 sets Vite's root to its internal app, so the architecture project directory is not on Vite's search path.

## Fix

Run both the process and package resolution outside the repo, then pass the LikeC4 project as an absolute path:

```bash
sh -c 'root="$PWD"; cd "${TMPDIR:-/tmp}"; bunx likec4@1.59.2 serve "$root/docs/architecture/likec4"'
```

As a package script:

```json
{
  "scripts": {
    "architecture:serve": "sh -c 'root=\"$PWD\"; cd \"${TMPDIR:-/tmp}\"; bunx likec4@1.59.2 serve \"$root/docs/architecture/likec4\"'"
  }
}
```

The repo's own `node_modules/.bin/likec4`, run from `/tmp`, still fails: its internal Vite root lives under the repo's `node_modules`, so the search still reaches the root PostCSS config. Use `bunx` from the temporary directory.

## Verify

```bash
bun run architecture:serve
```

The output shows a local LikeC4 URL and no PostCSS diagnostics. Open the URL and confirm the expected project, model and views render.

Validate the model separately:

```bash
likec4 validate --json docs/architecture/likec4
```

## Scope

LikeC4 already ships its Vite viewer. Keep the fix to how the command runs:

- Add no Next.js, Vite or Tailwind dependencies to LikeC4.
- Leave LikeC4 and Vite unpatched.
- Change the shared root PostCSS config only if the user separately approves that wider change.
