---
name: agent-sources
description: Read a dependency's upstream source, cloned into `.agent-sources/`, at the installed version. Use when types and docs leave a signature, behaviour or idiom unclear, when upstream tests would show intended usage, or before building on an assumption about how a library behaves.
---

# Agent sources

Types and docs say what an API accepts. The source and its tests say what it does. Read the source at the installed version.

A source that `AGENTS.md` already names for a library comes first; this skill covers everything else and whatever those leave open.

## 1. Pin the version

Read the version the importing workspace resolves:

```sh
jq -r .version <workspace>/node_modules/<pkg>/package.json
```

Read it from the workspace, not the root: a package manager store (Bun's, pnpm's) can hold several versions of one package. Done when you hold one exact version string.

## 2. Open the matching source

Upstream clones live in `.agent-sources/<name>`. `.git/info/exclude` keeps that folder out of git; it is local reference, and the app imports only from `node_modules`.

- **No clone yet**: add one (see [Adding and removing clones](#adding-and-removing-clones)).
- **Clone exists**: read the version in its package's `package.json`. Clones drift behind upgrades, and a clone can even track a different major line than the installed one. When the version differs, check out the tag:

  ```sh
  git -C .agent-sources/<name> fetch -q --depth 1 origin tag <tag> && git -C .agent-sources/<name> checkout -q <tag>
  ```

Done when the clone's `package.json` reports the pinned version.

## 3. Read

- **Behaviour**: the public module, then the internal implementation it delegates to.
- **Idioms**: upstream tests show intended usage more reliably than doc snippets.
- **Docs**: many repositories ship their docs site source; it matches the pinned version where the hosted docs track latest.

Cite the source path and version beside any claim that rests on it (plan, review, commit message), so the claim can be rechecked.

The clones are yours to experiment in: run their tests, edit them, write scripts against them, whatever gets you the answer. A clone checked out at a tag can always be reset.

## Adding and removing clones

`.agent-sources/` holds one clone per library, named after the package. Nothing else tracks what is in it; the folder is the list.

- **Add** a clone when a question about a dependency needs its source and none exists. Find the repository and the release tag for the pinned version (`git ls-remote --tags <repo-url>`), then:

  ```sh
  git clone --depth 1 --branch <tag> <repo-url> .agent-sources/<name>
  ```

  If the folder is new to this checkout, add `.agent-sources/` to `.git/info/exclude`.

- **Remove** a clone when the project drops the dependency, or when the clone tracks a major line the project no longer installs: `rm -rf .agent-sources/<name>`. A stale clone is worse than none, since it answers confidently for the wrong version.
