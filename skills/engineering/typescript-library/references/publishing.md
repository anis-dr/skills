# Publishing

Consumers never see your source tree. They see the tarball: its `package.json` `exports`, the emitted `.d.ts` files, and whatever TypeScript version and module resolution they run. Check that artifact.

## Check the packed output

1. Build, then run `npx publint` for `package.json` mistakes (files missing from the tarball, wrong `exports` ordering, `types` condition not first). It packs and cleans up on its own.
2. Run `npm pack` (or the package manager's pack command) to get the exact tarball that would publish, and keep it.
3. Run `npx @arethetypeswrong/cli <name>-<version>.tgz` on that file. It resolves every `exports` entry the way Node 10, Node 16 (CommonJS and ESM) and bundlers do, and reports types that do not resolve, ESM/CJS masquerading, and missing exports. Fix each problem it reports or document why that resolution mode is unsupported (`--profile esm-only` for ESM-only packages). `attw --pack .` would pack its own copy and delete it, leaving nothing for step 4.
4. Compile a consumer fixture: a scratch project outside the repo that installs the tarball, has `skipLibCheck: false`, and contains the step-1 call sites (including every `@ts-expect-error` line, so each mistake also fails against the packed `.d.ts`). Type-check it with `tsc --noEmit` once per supported `moduleResolution` (`bundler`, `node16`) and once per TypeScript version at the edges of the support window below.

## Declaration output

- Read the emitted `.d.ts` for each public entry once per change. Inlined giant types, `import("../../src/internal")` paths, or `any` where the source had a precise type all mean a public type leaked or collapsed during emit. Give such types a name and export it, so emit references it instead of expanding it.
- Every type a public signature mentions must be reachable from the package entry, or consumers cannot name it.
- Ship declaration maps (`declarationMap`) only if the tarball also contains the sources they point to, so "Go to definition" lands in real code. Otherwise turn `declarationMap` off: a map pointing at `../src/index.ts` that is not in the tarball breaks navigation, and neither publint nor attw flags it.

## Supported TypeScript versions

State a support window and test both ends. Query follows DefinitelyTyped's window: TypeScript versions released within the last two years; work out the oldest version from its npm release date when you set the window. Router runs a TypeScript compiler matrix over `src`. If you support TypeScript 7 (the native `tsgo` compiler), add it to the consumer fixture matrix too. Raising the minimum version is a breaking change unless the policy below says otherwise.

## Semver for types

Pick a policy and write it in the docs. TanStack Query's is explicit: type changes ship as patches, runtime API follows strict semver, and users should pin the patch version. A stricter policy treats the rows below as breaking. Either way, classify every change against this table and say which row it hits.

| Change | Breaks consumers? |
|---|---|
| A parameter or option accepts fewer values (narrower type) | Yes: existing calls stop compiling |
| A return type or result field becomes wider (`T` to `T \| undefined`) | Yes: existing uses of the result stop compiling |
| A new required option or a new required `Register` key | Yes |
| An exported type or helper is removed or renamed | Yes |
| Generic parameters reordered, added without a default, or removed | Yes, for anyone who passes them explicitly |
| Minimum supported TypeScript version raised | Yes, unless the support-window policy covers it |
| A parameter accepts more values, or a result becomes narrower | No, though a narrower result can break exhaustive matches on it |
| A new optional option or a new export | No |
| Internal (unexported) types change | No |
