import { defineConfig } from "oxlint";
import { recommended as effectRecommended } from "oxlint-plugin-effect/presets/recommended";

const effectStyleRules = {
  "effect-shape/no-arrow-ladder": "error",
  "effect-shape/no-atom-registry-effect-sync": "error",
  "effect-shape/no-branch-in-object": "error",
  "effect-shape/no-call-tower": "error",
  "effect-shape/no-effect-all-step-sequencing": "error",
  "effect-shape/no-effect-as": "error",
  "effect-shape/no-effect-bind": "error",
  "effect-shape/no-effect-callback": "error",
  "effect-shape/no-effect-catch-ladder": "error",
  "effect-shape/no-effect-do": "error",
  "effect-shape/no-effect-fn-callback-alias": "error",
  "effect-shape/no-effect-fn-untraced": "error",
  "effect-shape/no-effect-gen-callback-alias": "error",
  "effect-shape/no-effect-ladder": "error",
  "effect-shape/no-effect-never": "error",
  "effect-shape/no-effect-runfork": "error",
  "effect-shape/no-effect-side-effect-wrapper": "error",
  "effect-shape/no-effect-succeed-variable": "warn",
  "effect-shape/no-effect-type-alias": "error",
  "effect-shape/no-family-collection-read": "error",
  "effect-shape/no-flatmap-ladder": "warn",
  "effect-shape/no-fragmented-const-assembly": "error",
  "effect-shape/no-iife-wrapper": "error",
  "effect-shape/no-inline-runtime-provide": "error",
  "effect-shape/no-manual-data-guard": "error",
  "effect-shape/no-match-effect-branch": "error",
  "effect-shape/no-match-tag-neutral-fallback": "warn",
  "effect-shape/no-match-void-branch": "error",
  "effect-shape/no-naked-object-state-update": "error",
  "effect-shape/no-nested-effect-call": "error",
  "effect-shape/no-option-as": "error",
  "effect-shape/no-option-boolean-normalization": "error",
  "effect-shape/no-option-effect-branch": "warn",
  "effect-shape/no-option-nullish-rewrap": "error",
  "effect-shape/no-pipe-ladder": "error",
  "effect-shape/no-pipeline-fragment-staging": "error",
  "effect-shape/no-react-state": "error",
  "effect-shape/no-render-side-effects": "error",
  "effect-shape/no-return-in-arrow": "warn",
  "effect-shape/no-return-in-callback": "warn",
  "effect-shape/no-schema-sync-in-effect-generator": "error",
  "effect-shape/no-switch-statement": "error",
  "effect-shape/no-try-catch": "error",
  "effect-shape/no-unknown-boolean-coercion-helper": "error",
  "effect-shape/no-wrapgraphql-catch": "error",
  "effect-shape/prefer-assert-in-effect-test": "warn",
  "effect-shape/prefer-effect-async": "warn",
  "effect-shape/prefer-effect-cache": "warn",
  "effect-shape/prefer-effect-fn": "error",
  "effect-shape/prefer-effect-test-layer": "warn",
  "effect-shape/prefer-effect-vitest": "error",
  "effect-shape/prefer-match-tags": "error",
  "effect-shape/prefer-match-value-tags": "warn",
  "effect-shape/prevent-dynamic-imports": "error",
  "effect-shape/require-return-yield-effect-terminal": "error",
  "effect-shape/warn-effect-sync-wrapper": "warn",
} satisfies Record<string, "error" | "warn">;

/** effect-shape rules whose diagnostic an oxlint-plugin-effect rule owns (see rule-ownership.md). */
const oxcEffectRulesOwnedElsewhere = {
  /** Owned by effect/noEffectRunInTests. */
  "effect-shape/no-effect-run-in-test": "off",
  /** Owned by effect/noFixedWaitInTests. */
  "effect-shape/no-effect-sleep-in-test": "off",
  /** Owned by effect/noGlobals. */
  "effect-shape/no-effect-sync-console": "off",
  /** Owned by effect/noGlobals. */
  "effect-shape/no-native-current-time": "off",
  /** Owned by effect/noThrowStatement. */
  "effect-shape/no-throw-in-effect-generator": "off",
  /** Owned by effect/noNodeBuiltinImport. */
  "effect-shape/prefer-effect-child-process": "off",
  /** Owned by effect/noGlobals. */
  "effect-shape/prefer-effect-config": "off",
  /** Owned by effect/noGlobals. */
  "effect-shape/prefer-effect-date-time": "off",
  /** Owned by effect/noNodeBuiltinImport. */
  "effect-shape/prefer-effect-file-system": "off",
  /** Owned by effect/noGlobals. */
  "effect-shape/prefer-effect-http-client": "off",
  /** Owned by effect/noGlobals. */
  "effect-shape/prefer-effect-logging": "off",
  /** Owned by effect/noGlobals. */
  "effect-shape/prefer-effect-random": "off",
  /** Owned by effect/noGlobals. */
  "effect-shape/prefer-effect-scheduling": "off",
  /** Owned by effect/noGlobals. */
  "effect-shape/prefer-schema-json": "off",
} satisfies Record<string, "off">;

/** oxlint-plugin-effect rules whose diagnostic effect-shape owns (see rule-ownership.md). */
const effectRulesOwnedByOxcEffect = {
  "effect/noDynamicImports": "off",
  "effect/noEffectBind": "off",
  "effect/noEffectDo": "off",
  "effect/noSequentialEffectAll": "off",
  "effect/noTryCatch": "off",
  "effect/preferEffectFn": "off",
} satisfies Record<string, "off">;

/** Type-aware rules: they run only with oxlint-tsgolint installed and lint run with `--type-aware`. */
const typeAwareRules = {
  "typescript/no-floating-promises": "error",
  "typescript/no-misused-promises": "error",
  "typescript/no-unnecessary-type-assertion": "warn",
  "typescript/switch-exhaustiveness-check": "error",
} satisfies Record<string, "error" | "warn">;

/** REACT: keep only when a package depends on react directly. */
const reactRules = {
  "jsx-a11y/alt-text": "error",
  "jsx-a11y/anchor-has-content": "error",
  "jsx-a11y/aria-props": "error",
  "jsx-a11y/aria-role": "error",
  "jsx-a11y/aria-unsupported-elements": "error",
  "jsx-a11y/control-has-associated-label": "error",
  "jsx-a11y/heading-has-content": "error",
  "jsx-a11y/html-has-lang": "error",
  "jsx-a11y/iframe-has-title": "error",
  "jsx-a11y/interactive-supports-focus": "error",
  "jsx-a11y/label-has-associated-control": "error",
  "jsx-a11y/no-autofocus": "warn",
  "jsx-a11y/no-redundant-roles": "error",
  "jsx-a11y/role-has-required-aria-props": "error",
  "jsx-a11y/role-supports-aria-props": "error",
  "jsx-a11y/tabindex-no-positive": "error",
  "react/exhaustive-deps": "error",
  "react/jsx-key": "error",
  "react/no-danger": "error",
  "react/no-object-type-as-default-prop": "error",
  "react/no-unstable-nested-components": "error",
  "react/error-boundaries": "warn",
  "react/globals": "warn",
  "react/immutability": "warn",
  "react/incompatible-library": "warn",
  "react/preserve-manual-memoization": "warn",
  "react/purity": "warn",
  "react/refs": "warn",
  "react/set-state-in-effect": "warn",
  "react/set-state-in-render": "warn",
  "react/static-components": "warn",
  "react/unsupported-syntax": "warn",
  "react/use-memo": "warn",
  "react/rules-of-hooks": "error",
} satisfies Record<string, "error" | "off" | "warn">;

/** Build output, caches and lockfiles. */
const buildOutputPatterns = [
  "**/dist",
  "**/node_modules",
  "**/build",
  "**/.output",
  "**/.turbo",
  "**/.vite",
  "**/coverage",
  "**/*.d.ts.map",
  "**/bun.lock",
];

/** Tool-generated files: add every generator this repo runs. */
const generatedFilePatterns = [
  "**/*.gen.*",
  "**/*.generated.*",
  "**/generated",
  "**/__generated__",
  "**/drizzle/**/snapshot.json",
];

/** Installed agent skills and agent config are not project source. */
const agentDirectoryPatterns = [
  ".agent/**",
  ".agents/**",
  ".claude/**",
  ".codex/**",
  ".continue/**",
  ".cursor/**",
  ".gemini/**",
  ".opencode/**",
  ".pi/**",
  ".roo/**",
  ".windsurf/**",
];

/** Vendored code and fetched files. */
const vendoredPatterns = ["tools/oxlint/anti-slop/**"];

export default defineConfig({
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  ignorePatterns: [
    ...buildOutputPatterns,
    ...generatedFilePatterns,
    ...agentDirectoryPatterns,
    ...vendoredPatterns,
  ],
  jsPlugins: [
    { name: "effect", specifier: "oxlint-plugin-effect/plugin" },
    { name: "effect-shape", specifier: "@shekohex/oxc-effect" },
    {
      name: "anti-slop-effect",
      specifier: "./tools/oxlint/anti-slop/effect/index.ts",
    },
  ],
  overrides: [
    /** TanStack Router only: its generated route tree carries eslint-disable comments. */
    {
      files: ["**/routeTree.gen.ts"],
      rules: {
        "unicorn/no-abusive-eslint-disable": "off",
      },
    },
    /** Tests: effect/noPromiseChainsInTests owns Promise chains. */
    {
      files: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
      rules: {
        "promise/prefer-await-to-then": "off",
      },
    },
  ],
  /** REACT: drop "react" and "jsx-a11y" without React. */
  plugins: [
    "typescript",
    "unicorn",
    "oxc",
    "import",
    "promise",
    "react",
    "jsx-a11y",
  ],
  rules: {
    ...effectRecommended,
    ...effectStyleRules,
    ...oxcEffectRulesOwnedElsewhere,
    ...effectRulesOwnedByOxcEffect,
    ...typeAwareRules,
    /** REACT */
    ...reactRules,
    /** The one anti-slop rule no other plugin owns (see rule-ownership.md). */
    "anti-slop-effect/no-service-constructor-imports": "error",
    "effect/preferMatchTagsExhaustive": "error",
    "func-style": "off",
    "import/no-cycle": "warn",
    "import/no-duplicates": "error",
    "import/no-self-import": "error",
    "no-use-before-define": "off",
    "promise/no-multiple-resolved": "error",
    "promise/no-return-wrap": "error",
    "promise/param-names": "error",
    "promise/prefer-await-to-then": "error",
    "promise/valid-params": "error",
    "typescript/consistent-type-imports": "error",
    "typescript/no-import-type-side-effects": "error",
    "unicorn/no-abusive-eslint-disable": "error",
    "unicorn/no-document-cookie": "error",
    "unicorn/no-invalid-fetch-options": "error",
    "unicorn/no-useless-undefined": "error",
  },
  /**
   * REACT: map the repo's design-system wrappers to the native element they render,
   * so jsx-a11y checks them. A wrapper that owns its accessible name through a
   * required prop (e.g. a Button with a `label` prop) is left out.
   */
  settings: {
    "jsx-a11y": {
      components: {
        Input: "input",
        Label: "label",
        Textarea: "textarea",
      },
    },
    react: {
      /** TanStack Router's <Link to>; adjust for the repo's router. */
      linkComponents: [{ attribute: "to", name: "Link" }],
    },
  },
});
