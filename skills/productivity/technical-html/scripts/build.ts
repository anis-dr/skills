// Build one self-contained HTML page from a Markdown document.
// Usage: bun build.ts <path/to/doc.md>   (writes <path/to/doc>.html beside it)
//
// Pipeline: YAML frontmatter -> Markdown (Bun.markdown) -> house look. ```d2 fences are rendered with
// `d2 --layout=tala` (assets/house.d2 prepended) and inlined as <figure class="diagram">; assets/style.css is
// inlined. The Markdown dialect (alerts, `status:` pills, ::: divs, captions) is described in SKILL.md.
// Bun built-ins only. Needs the `d2` CLI with TALA installed. Exits 1 with `build: <message>` on any problem.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";

const fail = (message: string): never => {
  console.error(`build: ${message}`);
  process.exit(1);
};

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const markdown = (s: string): string => Bun.markdown.html(s, { headings: { ids: true } });

// ---------------------------------------------------------------------------------------------- read input

const input = process.argv[2] ?? fail("usage: bun build.ts <path/to/doc.md>");
let source = "";
try {
  source = readFileSync(input, "utf8").replace(/\r\n/g, "\n");
} catch {
  fail(`cannot read ${input}`);
}
const sourceLines = source.split("\n");
const where = (needle: string): string => {
  const i = sourceLines.findIndex((l) => l.includes(needle));
  return i < 0 ? "an unknown line" : `line ${i + 1}`;
};

let frontmatter: Record<string, unknown> = {};
let body = source;
let bodyOffset = 0; // lines before the body, so messages cite file lines
const fm = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(source);
if (fm !== null) {
  body = source.slice(fm[0].length);
  bodyOffset = fm[0].split("\n").length - 1;
  try {
    const parsed: unknown = Bun.YAML.parse(fm[1] ?? "");
    if (parsed !== null && parsed !== undefined) {
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        fail("frontmatter must be a YAML mapping");
      }
      frontmatter = parsed as Record<string, unknown>;
    }
  } catch (error) {
    fail(`frontmatter is not valid YAML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const text = (key: string): string | undefined => {
  const v = frontmatter[key];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "string") return fail(`frontmatter "${key}" must be a string`);
  return v;
};

// ---------------------------------------------------------------------------------------------- pills

const PILLS: Record<string, [label: string, kind: string]> = {
  built: ["Built", "built"],
  gap: ["Gap", "gap"],
  partly: ["Partly", "partly"],
  none: ["Not started", "none"],
  done: ["Done", "done"],
  here: ["We are here", "here"],
};

// `status:<kind>` or `status:<kind> Custom label` as an inline code span (not inside a code block).
const pills = (html: string): string =>
  html.replace(/(?<!<pre>)<code>status:([^<\s]*)([^<]*)<\/code>/g, (_all, kind: string, label: string) => {
    const pill = PILLS[kind];
    if (pill === undefined) {
      return fail(`unknown status kind "${kind}" at ${where(`status:${kind}`)} (known: ${Object.keys(PILLS).join(", ")})`);
    }
    return `<span class="pill ${pill[1]}">${label.trim() || pill[0]}</span>`;
  });

// One line of inline Markdown, without the <p> wrapper.
const inline = (s: string): string => pills(markdown(s)).replace(/^<p>/, "").replace(/<\/p>\n?$/, "").trim();

// ---------------------------------------------------------------------------------------------- source pass

type Diagram = { line: number; source: string; caption: string };
const DIVS: Record<string, [open: string, close: string]> = {
  steps: ['<div class="steps">', "</div>"],
  card: ['<div class="card">', "</div>"],
  footer: ['<footer class="doc-footer">', "</footer>"],
};

const diagrams: Diagram[] = [];
const stepsLines: number[] = []; // file line of each `::: steps`, in order
// Bun 1.4.2 Bun.markdown shares one alignment array across tables: the last table's alignment leaks into earlier
// ones. Record each GFM delimiter row here and re-apply it after rendering. Remove when Bun fixes it.
const aligns: string[][] = [];
const out: string[] = [];
const lines = body.split("\n");
let fence: { marker: string; lang: string; line: number; body: string[] } | undefined;
let div: { kind: string; line: number } | undefined;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i] ?? "";
  const no = i + 1 + bodyOffset;

  if (fence !== undefined) {
    const close = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(line);
    const closes = close !== null && close[1]?.[0] === fence.marker[0] && (close[1]?.length ?? 0) >= fence.marker.length;
    if (!closes) {
      fence.body.push(line);
      continue;
    }
    if (fence.lang !== "d2") {
      out.push(...fence.body, line);
      fence = undefined;
      continue;
    }
    const md = fence.body.findIndex((l) => /\|+\s*md\b/.test(l));
    if (md >= 0) {
      fail(`line ${fence.line + 1 + md}: d2 uses a |md label; use plain string labels with \\n`);
    }
    // Caption: the next paragraph, which must be entirely italic.
    let j = i + 1;
    while (j < lines.length && (lines[j] ?? "").trim() === "") j++;
    const para: string[] = [];
    while (j < lines.length && (lines[j] ?? "").trim() !== "") para.push(lines[j++] ?? "");
    const em = /^<em>((?:(?!<\/?em>)[\s\S])*)<\/em>$/.exec(inline(para.join(" ")));
    if (em === null) {
      fail(`line ${fence.line}: diagram has no caption; put an italic paragraph (*...*) right after the closing fence`);
    }
    diagrams.push({ line: fence.line, source: fence.body.join("\n"), caption: em?.[1] ?? "" });
    out.push("", `<!--d2:${diagrams.length - 1}-->`, "");
    i = j - 1;
    fence = undefined;
    continue;
  }

  const open = /^ {0,3}(`{3,}|~{3,})[ \t]*([^\s`]*)/.exec(line);
  if (open !== null) {
    fence = { marker: open[1] ?? "```", lang: open[2] ?? "", line: no, body: [] };
    if (fence.lang !== "d2") fence.body.push(line);
    continue;
  }

  const fenced = /^:::[ \t]*(.*?)[ \t]*$/.exec(line);
  if (fenced === null) {
    if (/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(line)) {
      aligns.push(
        line.trim().replace(/^\||\|$/g, "").split("|").map((c) => {
          const s = c.trim();
          return s.startsWith(":") && s.endsWith(":") ? "center" : s.endsWith(":") ? "right" : s.startsWith(":") ? "left" : "";
        }),
      );
    }
    out.push(line);
    continue;
  }
  const kind = fenced[1] ?? "";
  const tags = DIVS[kind];
  if (kind === "") {
    if (div === undefined) fail(`line ${no}: ":::" closes nothing`);
    out.push("", DIVS[div?.kind ?? ""]?.[1] ?? "", "");
    div = undefined;
  } else if (tags === undefined) {
    fail(`line ${no}: unknown fenced div kind "${kind}" (known: ${Object.keys(DIVS).join(", ")})`);
  } else if (div !== undefined) {
    fail(`line ${no}: "::: ${kind}" inside "::: ${div.kind}" (opened at line ${div.line}); fenced divs do not nest`);
  } else {
    div = { kind, line: no };
    if (kind === "steps") stepsLines.push(no);
    out.push("", tags?.[0] ?? "", "");
  }
}
if (fence?.lang === "d2") fail(`line ${fence.line}: unclosed d2 code fence`);
if (div !== undefined) fail(`line ${div.line}: unclosed "::: ${div.kind}"; close it with a line containing only ":::"`);

// ---------------------------------------------------------------------------------------------- html pass

// Index just past the </tag> that closes the element whose inner content starts at `from`.
function closeOf(html: string, from: number, tag: string): number {
  const token = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
  token.lastIndex = from;
  for (let depth = 1, m = token.exec(html); m !== null; m = token.exec(html)) {
    depth += m[1] === "" ? 1 : -1;
    if (depth === 0) return m.index + m[0].length;
  }
  return fail(`unbalanced <${tag}> in rendered Markdown`);
}

// > [!NOTE] ... -> <aside class="callout callout-note">. Other blockquotes stay as they are.
function alerts(html: string): string {
  const alert = /<blockquote>\n<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\n|(?=<\/p>))/gi;
  let result = "";
  let prev = 0;
  for (let m = alert.exec(html); m !== null; m = alert.exec(html)) {
    const kind = (m[1] ?? "").toLowerCase();
    const end = closeOf(html, m.index + 12, "blockquote");
    let content = html.slice(m.index + m[0].length, end - "</blockquote>".length);
    content = content.startsWith("</p>") ? content.slice(5) : `<p>${content}`;
    result += `${html.slice(prev, m.index)}<aside class="callout callout-${kind}">\n<p class="callout-label">${kind[0]?.toUpperCase()}${kind.slice(1)}</p>\n${content}</aside>`;
    prev = alert.lastIndex = end;
  }
  return result + html.slice(prev);
}

// ::: steps -> numbered cards. Top-level <li> get class done/here; a bold first line becomes the step title.
function steps(html: string): string {
  let n = 0;
  return html.replace(/<div class="steps">([\s\S]*?)<\/div>/g, (_all, inner: string) => {
    const line = stepsLines[n++];
    if (!inner.includes("<ol")) fail(`line ${line}: "::: steps" needs a numbered list`);
    const here = inner.split('class="pill here"').length - 1;
    if (here > 1) fail(`line ${line}: "::: steps" has ${here} "here" pills; at most one step can be current`);
    let result = "";
    let prev = 0;
    const li = /<li\b[^>]*>/g;
    for (let m = li.exec(inner); m !== null; m = li.exec(inner)) {
      const end = closeOf(inner, li.lastIndex, "li");
      if (m.index < prev) continue; // nested item, already inside the previous top-level one
      const content = inner.slice(li.lastIndex, end - "</li>".length).trimStart();
      const own = content.split(/<(?:ul|ol)[ >]/)[0] ?? content;
      const state = own.includes('class="pill here"') ? "here" : own.includes('class="pill done"') ? "done" : "";
      // A bold first line is the step title; the rest of that paragraph is the body. Tight items have no <p>, loose ones do.
      let titled = content;
      if (/^(?:<p>)?<strong>/.test(content)) {
        const loose = content.startsWith("<p>");
        const stop = loose ? content.indexOf("</p>") : content.search(/<(?:ul|ol|pre|p|blockquote|table|div|figure|aside)\b/);
        const textEnd = stop < 0 ? content.length : stop;
        const [title = "", ...bodyLines] = content.slice(loose ? 3 : 0, textEnd).trim().split("\n");
        const rest = content.slice(loose ? textEnd + "</p>".length : textEnd).replace(/^\n/, "");
        titled = `<p class="step-title">${title}</p>\n${bodyLines.length > 0 ? `<p>${bodyLines.join("\n")}</p>\n` : ""}${rest}`;
      }
      result += `${inner.slice(prev, m.index)}<li${state && ` class="${state}"`}>${titled}</li>`;
      prev = end;
    }
    return `<div class="steps">${result}${inner.slice(prev)}</div>`;
  });
}

let html = markdown(out.join("\n"));
html = pills(html);
html = alerts(html);
html = steps(html);
let table = 0;
html = html
  .replace(/<table>[\s\S]*?<\/table>/g, (t) => {
    const align = aligns[table++] ?? [];
    return t.replace(/<tr>[\s\S]*?<\/tr>/g, (row) => {
      let col = 0;
      return row.replace(/<(th|td)(?: align="\w+")?>/g, (_m, tag: string) => {
        const a = align[col++];
        return a ? `<${tag} align="${a}">` : `<${tag}>`;
      });
    });
  })
  .replace(/<pre><code class="language-([^"]+)">/g, '<pre data-lang="$1"><code>')
  .replace(/<table>/g, '<div class="table-wrap"><table>')
  .replace(/<\/table>/g, "</table></div>");

const h1 = /<h1 id="[^"]*">([\s\S]*?)<\/h1>\n?/.exec(html);
if (h1 === null) fail("no H1: the document needs a `# Title` heading");
const title = h1?.[1] ?? "";
html = html.replace(h1?.[0] ?? "", "");

// ---------------------------------------------------------------------------------------------- diagrams

// d2 emits a nested svg. Make the outer one responsive at its natural width.
function inlineSvg(svg: string): string {
  const viewBox = /viewBox="0 0 (\d+(?:\.\d+)?) \d+(?:\.\d+)?"/.exec(svg);
  if (viewBox === null) {
    return fail("svg has no outer viewBox");
  }
  return svg
    .replace(/^<\?xml[^>]*\?>\s*/, "")
    .replace(/preserveAspectRatio="[^"]*"/, "")
    .replace("<svg ", `<svg role="img" preserveAspectRatio="xMidYMin meet" style="--w:${viewBox[1]}px" `)
    .replace(/(<svg class="d2-[^"]*"[^>]*?) width="\d+(?:\.\d+)?" height="\d+(?:\.\d+)?"/, '$1 width="100%" height="100%"');
}

const assets = join(import.meta.dir, "..", "assets");
const house = readFileSync(join(assets, "house.d2"), "utf8").replace(/\n*$/, "\n\n");
const houseLines = house.split("\n").length - 1;

if (diagrams.length > 0) {
  const d2 = Bun.which("d2") ?? fail("cannot find the `d2` CLI; install d2 with TALA");
  const scratch = mkdtempSync(join(tmpdir(), "technical-html-"));
  try {
    diagrams.forEach((diagram, n) => {
      const src = join(scratch, `diagram${n}.d2`);
      const svg = join(scratch, `diagram${n}.svg`);
      writeFileSync(src, house + diagram.source);
      const run = Bun.spawnSync([d2, "--layout=tala", "--pad", "24", src, svg], { stderr: "pipe" });
      if (run.exitCode !== 0) {
        const message = run.stderr
          .toString()
          .replace(/failed to compile \S+diagram\d+\.d2: /, "")
          .replace(/\S*diagram\d+\.d2:(\d+):(\d+)/g, (_all, l: string, c: string) => `${input}:${diagram.line + Number(l) - houseLines}:${c}`);
        return fail(`d2 failed for the diagram at line ${diagram.line}:\n${message.trim()}`);
      }
      const figure = `<figure class="diagram">${inlineSvg(readFileSync(svg, "utf8"))}<figcaption>${diagram.caption}</figcaption></figure>`;
      html = html.replace(`<!--d2:${n}-->`, () => figure);
    });
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------------------------- page

const styles = readFileSync(join(assets, "style.css"), "utf8");

const eyebrow = text("eyebrow");
const lede = text("lede");
const meta = text("meta");
const type = text("type");
if (type !== undefined && !["status", "design", "how-to", "reference"].includes(type)) {
  fail(`frontmatter type "${type}" is unknown (status, design, how-to, reference)`);
}

const statList = frontmatter.stats ?? [];
if (!Array.isArray(statList) || (statList.length !== 0 && (statList.length < 2 || statList.length > 4))) {
  fail("frontmatter stats must be a list of 2 to 4 cards (or omitted)");
}
const cards = (statList as unknown[]).map((raw, i) => {
  const card = (raw ?? {}) as Record<string, unknown>;
  const tone = card.tone ?? "none";
  if (typeof tone !== "string" || !["good", "gap", "wait", "none"].includes(tone)) {
    fail(`frontmatter stats[${i}].tone must be good, gap, wait or none`);
  }
  if ((typeof card.value !== "string" && typeof card.value !== "number") || typeof card.label !== "string") {
    fail(`frontmatter stats[${i}] needs a value and a label`);
  }
  return `<div class="stat ${tone}"><b>${esc(String(card.value))}</b><span>${inline(String(card.label))}</span></div>`;
});

const headings = [...html.matchAll(/<h2 id="([^"]*)">([\s\S]*?)<\/h2>/g)];
const tocSetting = frontmatter.toc ?? "auto";
if (tocSetting !== "auto" && typeof tocSetting !== "boolean") {
  fail('frontmatter toc must be auto, true or false');
}
const showToc = headings.length > 0 && (tocSetting === "auto" ? headings.length >= 4 : tocSetting === true);
const toc = showToc
  ? `<nav class="toc" aria-label="Contents">\n<ol>\n${headings
      .map((h) => `<li><a href="#${h[1]}">${(h[2] ?? "").replace(/<[^>]+>/g, "")}</a></li>`)
      .join("\n")}\n</ol>\n</nav>\n`
  : "";

const header =
  `<header class="doc-header">\n` +
  (eyebrow === undefined ? "" : `<p class="eyebrow">${esc(eyebrow)}</p>\n`) +
  `<h1>${title}</h1>\n` +
  (lede === undefined ? "" : `<p class="lede">${inline(lede)}</p>\n`) +
  (meta === undefined ? "" : `<p class="meta">${inline(meta)}</p>\n`) +
  (cards.length === 0 ? "" : `<div class="stats">${cards.join("")}</div>\n`) +
  `</header>`;

// Scheme toggle (see style.css). The head script applies a stored override before first paint; the body script flips
// between the system scheme and its opposite, stored literally in localStorage "color-scheme". Storage may be blocked,
// so the override also lives in `stored` for this page.
const schemeHead =
  `<meta name="color-scheme" content="light dark">` +
  `<script>try{document.querySelector('meta[name="color-scheme"]').content=localStorage.getItem("color-scheme")??"light dark"}catch{}</script>`;
const schemeButton =
  `<button type="button" class="scheme">` +
  `<span class="to-dark"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/></svg><span class="visually-hidden">Switch to dark theme</span></span>` +
  `<span class="to-light"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z"/></svg><span class="visually-hidden">Switch to light theme</span></span>` +
  `</button>`;
const schemeScript = `<script>{
const meta = document.querySelector('meta[name="color-scheme"]');
const system = matchMedia("(prefers-color-scheme: dark)");
const read = () => { try { return localStorage.getItem("color-scheme"); } catch { return null; } };
let stored = read();
document.querySelector(".scheme").addEventListener("click", () => {
  const os = system.matches ? "dark" : "light";
  const target = (stored ?? os) === "dark" ? "light" : "dark";
  stored = target === os ? null : target;
  try { stored === null ? localStorage.removeItem("color-scheme") : localStorage.setItem("color-scheme", stored); } catch {}
  meta.content = stored ?? "light dark";
});
addEventListener("storage", () => { stored = read(); meta.content = stored ?? "light dark"; });
}</script>`;

const page =
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
  `${schemeHead}<title>${title.replace(/<[^>]+>/g, "")}</title><style>\n${styles}</style></head>\n` +
  `<body${type === undefined ? "" : ` class="doc-${type}"`}>\n${schemeButton}\n<div class="page">\n<main>\n${header}\n${toc}${html}</main>\n</div>\n${schemeScript}\n</body></html>\n`;

const external = /<(?:script|link|img|iframe|source|video|audio)\b[^>]*(?:src|href)=["']?https?:|url\(\s*["']?https?:|@import\s+["']?(?:url\(\s*["']?)?https?:/i.exec(page);
if (external !== null) {
  fail(`external resource (${external[0].slice(0, 60)}); the page must be self-contained`);
}

const target = join(dirname(input), `${basename(input).replace(/\.md$/i, "")}.html`);
writeFileSync(target, page);
console.log(`wrote ${target} (${diagrams.length} diagram(s), ${Buffer.byteLength(page)} bytes)`);
