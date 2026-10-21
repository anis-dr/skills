// Fence helpers for plugins/fences.ts, build time only: the words after a fence language, and bare diff hunks as patches.
import { getFiletypeFromFileName } from "@pierre/diffs";
import { bundledLanguages } from "shiki";

// A ```diff fence without git headers is a bare hunk; give it the headers Pierre's patch parser needs.
export const hasHeaders = (text: string) => /^(diff --git|--- )/m.test(text);
export function asPatch(text: string, name = "change"): string {
  if (hasHeaders(text)) return text;
  const old = text.split("\n").filter((l) => l !== "" && !l.startsWith("+")).length;
  const nu = text.split("\n").filter((l) => l !== "" && !l.startsWith("-")).length;
  return `diff --git a/${name} b/${name}\n--- a/${name}\n+++ b/${name}\n@@ -1,${old} +1,${nu} @@\n${text.endsWith("\n") ? text : `${text}\n`}`;
}

// Words after a fence's language: `split`, a language id (`ts`, `pseudo`) or a file path (`apps/sapio/agent.ts`).
// `pseudo` is our grammar, registered with Pierre in src/lib/pierre.ts; `text` stays plain.
export const isLang = (id: string) => id in bundledLanguages || id === "text" || id === "pseudo";
export function fenceWords(meta: string | undefined): { split: boolean; lang?: string; path?: string } {
  const words = (meta ?? "").split(/\s+/).filter(Boolean);
  const path = words.find((w) => w.includes("."));
  const id = words.find((w) => w !== "split" && !w.includes(".") && isLang(w));
  const lang = id ?? (path === undefined ? undefined : getFiletypeFromFileName(path));
  return { split: words.includes("split"), ...(lang === undefined || lang === "text" && id === undefined ? {} : { lang }), ...(path === undefined ? {} : { path }) };
}
