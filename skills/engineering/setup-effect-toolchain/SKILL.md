---
name: setup-effect-toolchain
description: Set up an Effect v4 TypeScript repo's toolchain on Bun, TypeScript 7 with the Effect language service, Oxlint with the Effect, code-shape and anti-slop plugins, and oxfmt, then prove every layer runs. Use when starting an Effect repo or package, copying this lint and typecheck setup into another repo, or adding Effect lint rules to an existing one.
---

# Setup Effect toolchain

Four layers, each owning its own diagnostics:

- **Typecheck:** TypeScript 7 (native `tsc`) patched by `@effect/tsgo`, so `tsc` also reports Effect mistakes such as a floating Effect.
- **Lint:** Oxlint with `oxlint-plugin-effect` (`effect/*`), `@shekohex/oxc-effect` (`effect-shape/*`), the local anti-slop plugin (`anti-slop/*`, `anti-slop-effect/*`), and type-aware `typescript/*` rules through `oxlint-tsgolint`.
- **Format:** oxfmt with the ultracite preset.
- **Runner:** `ultracite check` runs format check and lint in one command.

Which tool owns which diagnostic, and why most anti-slop rules stay off, lives in [rule-ownership.md](references/rule-ownership.md). Read it before changing any rule.

## Steps

### 1. Inspect

Read the repo's agent instructions and `git status`; leave unrelated changes alone. Decide each branch and state it in your reply:

- **Shape:** Bun workspaces monorepo (Turbo, a shared `typescript-config` package) or single package.
- **React:** a package depends on `react` directly.
- **Router:** TanStack Router (a generated `routeTree.gen.ts`).
- **Generators:** tools that write files into the tree (drizzle-kit snapshots, route trees, codegen).
- **Code:** new repo, or existing code that will produce findings.
- **Existing tools:** ESLint, Biome, Prettier or an older Oxlint config. These are replaced; list them.

Done when all six are stated.

### 2. Install

Read [versions.md](references/versions.md), choose versions from its couplings, then install as exact dev dependencies with the repo's package manager: `typescript`, `@effect/tsgo`, `oxlint`, `@oxlint/plugins`, `oxlint-tsgolint`, `oxlint-plugin-effect`, `@shekohex/oxc-effect`, `oxfmt`, `ultracite`, and `@types/bun` (the tsconfig templates load Bun's types). In a monorepo, put `typescript` and the `effect` packages in the workspace `catalog` and reference them as `catalog:`. Remove the tools listed in step 1.

Done when every package resolves at the chosen version (`bun pm ls`).

### 3. TypeScript and the Effect language service

Templates live in [templates/](references/templates/). Replace `@SCOPE` with the repo's package scope.

- **Monorepo:** create `packages/typescript-config` from `templates/typescript-config/` (`base.json` holds strict flags and the Effect plugin; `bun.json` for server packages, `browser.json` for Vite apps, `test.json` for test configs). Each package gets `tsconfig.json` from `package-tsconfig.json` and `tsconfig.test.json` from `package-tsconfig.test.json`, and its `typecheck` script checks both: `tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.test.json`. The root `tsconfig.json` (`root-tsconfig.json`) only lists references, both configs of every package.
- **Single package:** root `tsconfig.json` from `single-tsconfig.json`. It covers `src/` and `test/` and sets `noEmit`, so `typecheck` is `tsc -p tsconfig.json`.

Add `"prepare": "effect-tsgo patch"` to the root `package.json` and run it once. Copy `vscode-settings.json` to `.vscode/settings.json` so the editor uses the patched native compiler.

Keep the Effect plugin's `diagnosticSeverity` offs from `base.json`: Oxlint owns those diagnostics.

Done when `typecheck` passes and the typecheck control proves the Effect language service is live: copy `templates/typecheck-control.ts` into a typechecked `src/`, run `typecheck`, see `effect(floatingEffect)` on the marked line, delete the file.

### 4. anti-slop plugin

Call the Skill tool with "install-anti-slop" to copy the plugin into `tools/oxlint/anti-slop/`. If "install-anti-slop" isn't installed, ask the user to run npx skills add dmmulroy/anti-slop --skill install-anti-slop, then continue.

Enable only the anti-slop rules listed as enabled in [rule-ownership.md](references/rule-ownership.md), plus `anti-slop-effect/no-service-constructor-imports`. The skill's own list enables all 15; in an Effect repo eleven of them duplicate the Effect preset.

Done when `tools/oxlint/anti-slop/index.ts` and `effect/index.ts` exist.

### 5. Oxlint and oxfmt config

Copy `templates/oxlint.config.ts` and `templates/oxfmt.config.ts` to the repo root, then apply the branches from step 1:

- No React: delete every block marked `REACT` and drop `react` and `jsx-a11y` from `plugins`. With React: map the repo's design-system wrappers in `settings["jsx-a11y"].components`.
- No TanStack Router: delete the `routeTree.gen.ts` override.
- Every generator from step 1, and every folder of fetched or vendored files (a download cache, copied upstream code): add it to the ignore list in both files.
- Keep `unicorn` in `plugins`: listing `plugins` replaces Oxlint's defaults, and without it every `unicorn/*` rule in the config silently does nothing.
- Keep `**/node_modules` in the Oxlint ignores: without it, `--type-aware` reports findings inside dependencies.
- Keep the agent directories (`.agents/**`, `.claude/**`, …) ignored in both files. Installed skills are Markdown the formatter would otherwise rewrite and fail on.

Done when both files ignore the same generated, vendored and agent folders.

### 6. Scripts

Root `package.json`:

```json
"lint": "ultracite check --type-aware .",
"lint:fix": "ultracite fix --type-aware .",
"format": "oxfmt --check .",
"format:fix": "oxfmt .",
"typecheck": "turbo typecheck"
```

`ultracite` forwards `--type-aware` to Oxlint. Without the flag the four type-aware `typescript/*` rules in the config silently do nothing. When the repo holds an `oxlint.config.*` that is not a package's own (a template, a fixture, vendored code), add `--disable-nested-config` to both lint scripts: Oxlint loads every such file as a nested config, even inside an ignored folder, and fails on its plugin paths. In a single package, `typecheck` is the `tsc` command from step 3. In a monorepo, add Turbo root tasks `//#lint`, `//#lint:fix` (uncached), `//#format`, `//#format:fix` (uncached), and a `typecheck` task that depends on `^build`.

### 7. Prove every layer runs

Copy `templates/lint-controls.ts` into a linted source folder and run `lint`. Each commented line must report its named rule: `effect/noGlobals`, `anti-slop/no-reflect-get`, `anti-slop/no-unknown-returns`, `effect-shape/no-try-catch`, and `typescript/no-floating-promises`. A missing rule means its plugin or flag is not wired; fix that before going on. Delete the file.

Then run `format`, `lint` and `typecheck` on the real code.

Done when every control reported its rule, the control files are gone, and all three commands exit 0 (new repo) or every remaining finding is listed by rule with a count (existing code).

### 8. Existing code

Report findings by rule and count. Fix each at its root cause. For anti-slop and Effect-preset type findings, call the Skill tool with "anti-slop-typescript-migration". Keep every rule at its configured severity and write no disable comments or `as` casts to get to zero; a finding that needs a product decision goes in the reply with its file and line.

Done when `lint` and `typecheck` exit 0, or the reply lists each remaining finding with the decision it waits on.

## Reply

State the six branch decisions, the installed versions, the files created or changed, the control results rule by rule, and the final output of `format`, `lint` and `typecheck`.
