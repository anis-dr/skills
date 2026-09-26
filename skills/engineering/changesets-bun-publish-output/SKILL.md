---
name: changesets-bun-publish-output
description: Fix or set up Changesets GitHub Action publishing through a custom Bun publish script so tags and GitHub releases are created. Use when changesets/action publishes with Bun and Git tags or GitHub releases are missing.
---

# Changesets with Bun publishing

Use when `changesets/action` calls a custom Bun publish script.

## Required contract

`changesets/action@v2` sets `CHANGESETS_OUTPUT` to a temporary NDJSON file. A custom publish script must write one event for each published package after publishing succeeds:

```json
{"type":"git-tag","tag":"v1.2.3","packageName":"package-name"}
```

If the file is missing, npm publishing may succeed while the action skips Git tags and GitHub releases.

## Setup

1. Keep Bun as the publisher.
2. Chain an output writer after successful publishing:

```json
{
  "scripts": {
    "release": "bun publish --access public && bun run scripts/write-changesets-output.ts"
  }
}
```

3. In `scripts/write-changesets-output.ts`:
   - Require `CHANGESETS_OUTPUT`.
   - Read package name and version from `package.json`.
   - JSON-encode the `git-tag` event.
   - Write the event plus a newline to `CHANGESETS_OUTPUT`.
4. Include `scripts/**/*.ts` in TypeScript, lint, and format checks.
5. Test the writer without publishing:

```bash
CHANGESETS_OUTPUT=/tmp/changesets-output.ndjson \
  bun run scripts/write-changesets-output.ts
```

Verify the file contains exactly one valid NDJSON event.

## Release verification

After the next Version Packages PR merges, verify all three artifacts:

```bash
bun pm view <package> version
git ls-remote --tags origin v<version>
gh release view v<version> --repo <owner/repo>
```

If a version published before this fix, backfill its Git tag and GitHub release manually from the versioned commit and changelog entry.
