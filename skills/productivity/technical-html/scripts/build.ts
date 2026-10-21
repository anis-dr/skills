// Build one self-contained HTML page from a Markdown (.md) or mdsvex (.svx) document.
// Usage: bun build.ts <path/to/doc.md|.svx>   (writes <path/to/doc>.html beside it)
//
// The document is the one page of the SvelteKit app in ../app: one `vite build` prerenders it, inlines CSS and any
// script into one HTML file, and this script moves that file beside the document and removes everything else. The
// Markdown dialect lives in ../app/plugins; see SKILL.md. Needs Bun and the `d2` CLI with TALA. Installs the app's
// dependencies on first run. Exits 1 with `build: <message>` on any problem.
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const fail = (message: string): never => {
  console.error(`build: ${message}`);
  process.exit(1);
};

const input = process.argv[2] ?? fail("usage: bun build.ts <path/to/doc.md|.svx>");
if (!/\.(md|svx)$/i.test(input)) fail(`${input}: the document must be a .md or .svx file`);
if (!existsSync(input) || !statSync(input).isFile()) fail(`cannot read ${input}`);

const app = join(import.meta.dir, "..", "app");
if (!existsSync(join(app, "node_modules"))) {
  const install = Bun.spawnSync(["bun", "install", "--frozen-lockfile"], { cwd: app, stdout: "ignore", stderr: "inherit" });
  if (install.exitCode !== 0) fail(`bun install failed in ${app}`);
}

// Inside the app, so Kit's server output resolves the app's node_modules; one folder per run, removed below.
const out = mkdtempSync(join(app, ".out-"));
process.env.TECHNICAL_HTML_DOC = resolve(input);
process.env.TECHNICAL_HTML_OUT = out;
// Kit reads src/ relative to the working directory; messages stay relative to the caller's.
const cwd = process.cwd();
process.env.TECHNICAL_HTML_CWD = cwd;
process.chdir(app);
let page = "";
let error: string | undefined;
const log = console.log;
console.log = () => {}; // Kit and the adapter report progress on stdout; this script prints one line instead.
try {
  // Runtime import: Vite lives in ../app/node_modules, which may only exist after the install above.
  const vite = (await import(Bun.resolveSync("vite", app))) as { createBuilder: (config: object) => Promise<{ buildApp: () => Promise<void> }> };
  // The builder runs every environment (server, then client), as `vite build` does; Kit 3 needs both.
  await (await vite.createBuilder({ root: app, configFile: join(app, "vite.config.js") })).buildApp();
  page = readFileSync(join(out, "site", "index.html"), "utf8");
} catch (e) {
  // The plugins keep their first message (file:line) on globalThis. Svelte errors in a .svx document carry an absolute
  // file:line:column. A component that throws while the page prerenders has no source line: report its error.
  const raw = e instanceof Error ? e.message : String(e);
  const svelte = /(\/\S+?\.(?:md|svx|svelte)):(\d+):(\d+):? ([^\n]+)/.exec(raw);
  const thrown = existsSync(join(out, "error.txt")) ? readFileSync(join(out, "error.txt"), "utf8") : undefined;
  error =
    (globalThis as { technicalHtmlError?: string }).technicalHtmlError ??
    (svelte !== null ? `${relative(cwd, svelte[1] ?? "")}:${svelte[2]}:${svelte[3]}: ${svelte[4]}` : undefined) ??
    (thrown !== undefined ? `${input}: the page threw while prerendering: ${thrown}` : raw);
}
console.log = log;
rmSync(out, { recursive: true, force: true });
process.chdir(cwd);
if (error !== undefined) fail(error);

const external = /<(?:script|link|img|iframe|source|video|audio)\b[^>]*(?:src|href)=["']?https?:|url\(\s*["']?https?:|@import\s+["']?(?:url\(\s*["']?)?https?:/i.exec(page);
if (external !== null) {
  const url = /https?:[^"'\s)>]*/i.exec(page.slice(external.index, external.index + 400))?.[0] ?? "";
  const line = readFileSync(input, "utf8").split("\n").findIndex((l) => l.includes(url)) + 1 || 1;
  fail(`${input}:${line}: external resource (${external[0].slice(0, 60)}); the page must be self-contained`);
}

const target = join(dirname(input), `${basename(input).replace(/\.(md|svx)$/i, "")}.html`);
writeFileSync(target, page);
const scripts = [...page.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].reduce((n, m) => n + Buffer.byteLength(m[1] ?? ""), 0);
console.log(`wrote ${target} (${Buffer.byteLength(page)} bytes, ${scripts} of them script)`);
