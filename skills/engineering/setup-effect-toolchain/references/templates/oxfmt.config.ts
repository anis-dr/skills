// Template from setup-effect-toolchain. Keep these ignores in step with oxlint.config.ts.
import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "**/dist/**",
    // Tool-generated files: add every generator this repo runs.
    "**/drizzle/**/snapshot.json",
    // Installed agent skills and agent config are not project source.
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
    "tools/oxlint/anti-slop/**",
  ],
});
