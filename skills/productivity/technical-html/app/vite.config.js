// SvelteKit app that prerenders one document (TECHNICAL_HTML_DOC) into one self-contained page. scripts/build.ts
// sets the environment and runs this config; see SKILL.md. Kit 3 reads its options from here, not svelte.config.js.
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { mdsvex } from "mdsvex";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bundledLanguagesInfo } from "shiki";
import { defineConfig } from "vite";
import { blocks } from "./plugins/blocks.ts";
import { divs } from "./plugins/divs.ts";
import { escapeMarkdown } from "./plugins/escape.ts";
import { fences, islandLangs } from "./plugins/fences.ts";
import { frontmatter, page } from "./plugins/page.ts";

const doc = process.env.TECHNICAL_HTML_DOC ?? "";
const out = process.env.TECHNICAL_HTML_OUT ?? "";
const stub = (f) => fileURLToPath(new URL(`./src/stubs/${f}`, import.meta.url));
const isDoc = (file) => /\.(md|svx)$/i.test(file ?? "");

const markdown = mdsvex({
  extensions: [".svx", ".md"],
  highlight: false,
  smartypants: false,
  frontmatter: { type: "yaml", marker: "-", parse: frontmatter },
  remarkPlugins: [blocks, fences, page, escapeMarkdown],
});

// The client re-highlights only the languages the document's diff islands use; fences.ts collects them while the
// document compiles, which happens before Pierre's `shiki/langs` import is resolved.
const langsModule = () => {
  const entries = [...islandLangs].flatMap((lang) => {
    const info = bundledLanguagesInfo.find((l) => l.id === lang || l.aliases?.includes(lang));
    return info === undefined ? [] : [info.id, ...(info.aliases ?? [])].map((k) => `${JSON.stringify(k)}: () => import("shiki/langs/${info.id}.mjs")`);
  });
  return `export const bundledLanguages = {${entries.join(",")}};`;
};

export default defineConfig({
  logLevel: "silent",
  plugins: [
    {
      name: "technical-html",
      enforce: "pre",
      resolveId(source, importer) {
        if (source === "shiki/langs") return "\0island-langs";
        // The pseudo grammar is registered with Pierre directly (src/lib/pierre.ts), not through `shiki/langs`.
        if (source === "./pseudo.ts" && importer?.endsWith("pierre.ts") && !islandLangs.has("pseudo")) return stub("empty.ts");
        // Pierre lazily imports its Highlights backend (265 kB); the island never selects it.
        if (/backends\/highlights\.js$/.test(source) && importer?.includes("@pierre/diffs")) return stub("empty.ts");
        return null;
      },
      load: (id) => (id === "\0island-langs" ? langsModule() : null),
    },
    sveltekit({
      extensions: [".svelte", ".svx", ".md"],
      // `::: kind` lines become HTML comments before mdsvex parses the document; see plugins/divs.ts.
      preprocess: [{ name: "technical-html", markup: (o) => (isDoc(o.filename) ? markdown.markup({ ...o, content: divs(o.content, o.filename) }) : undefined) }],
      adapter: adapter({ pages: join(out, "site"), assets: join(out, "site") }),
      outDir: join(out, "kit"),
      output: { bundleStrategy: "inline" },
      inlineStyleThreshold: Number.POSITIVE_INFINITY,
      // One page: links and images in the document are not routes of this app.
      prerender: { crawl: false },
    }),
  ],
  resolve: {
    alias: [
      { find: /^\$doc$/, replacement: doc },
      ...["shiki/engine/oniguruma", "shiki/wasm", "@pierre/highlights/themes/loader", "@pierre/theming/themes"].map((find) => ({ find, replacement: stub("empty.ts") })),
    ],
    // Components next to the document resolve `svelte` from this app, not from the document's folder.
    dedupe: ["svelte"],
  },
  server: { fs: { allow: [dirname(doc)] } },
});
