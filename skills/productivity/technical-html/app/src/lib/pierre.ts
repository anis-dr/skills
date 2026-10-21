// Pierre helpers shared by the build-time fence plugin (plugins/fences.ts) and the client island (DiffIsland.svelte).
// Keep this file free of `shiki` language tables: the browser bundle imports it.
import { getSharedHighlighter, parsePatchFiles, registerCustomLanguage, RegisteredCustomLanguages } from "@pierre/diffs";
import type { FileDiffMetadata } from "@pierre/diffs";
import darkTheme from "@pierre/theme/themes/pierre-dark.json" with { type: "json" };
import lightTheme from "@pierre/theme/themes/pierre-light.json" with { type: "json" };
import { normalizeTheme } from "shiki/core";

// ```pseudo and `*.pseudo` paths: our own grammar (pseudo.ts). Pierre resolves registered languages before its
// `shiki/langs` table, so the build and the island both load it from here. The guard: the build and Kit's server
// render can evaluate this module twice against one Pierre, which logs an error on a second registration.
if (!RegisteredCustomLanguages.has("pseudo")) registerCustomLanguage("pseudo", () => import("./pseudo.ts"), ["pseudo"]);

// ponytail: @pierre/theming 1.0.1 drops the fallbackLoader that @pierre/diffs 1.6.0 passes it, so the default
// pierre-dark/light themes never resolve. Register them on the shared resolver; remove when upstream fixes it.
// Runs at build time AND in the browser (the island re-highlights after a toggle).
export async function registerThemes() {
  const highlighter = await getSharedHighlighter({ themes: [], langs: [] });
  for (const [name, raw] of [["pierre-dark", darkTheme], ["pierre-light", lightTheme]] as const) {
    highlighter.themeResolver.registerThemeIfAbsent(name, async () => {
      const t = normalizeTheme(raw as never);
      return { name, type: t.type, fg: t.fg, bg: t.bg, colors: t.colors, textmate: { ...t, name } };
    });
  }
}

export type DiffStyle = "unified" | "split";
export const diffOptions = (style: DiffStyle, headless = false) => ({
  diffStyle: style, overflow: "wrap" as const, hunkSeparators: "line-info" as const, disableFileHeader: headless,
});

export const parseFiles = (patch: string, lang?: string): FileDiffMetadata[] =>
  parsePatchFiles(patch, undefined, true).flatMap((p) => p.files).map((f) => (lang === undefined ? f : { ...f, lang }));

