import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

/** Tool-generated files: add every generator this repo runs. Keep in step with oxlint.config.ts. */
const generatedFilePatterns = ["**/drizzle/**/snapshot.json"];

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
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "**/dist/**",
    ...generatedFilePatterns,
    ...agentDirectoryPatterns,
    ...vendoredPatterns,
  ],
});
