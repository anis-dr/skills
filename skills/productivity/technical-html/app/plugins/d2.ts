// Renders one ```d2 fence at build time: assets/house.d2 prepended, `d2 --layout=tala`, and the SVG made responsive at
// its natural width (style.css reads --w). Errors cite the document's file and line.
// The figure's key: a block may declare d2's own `vars: { d2-legend: { ... } }` and nothing else under `vars`. The
// block is cut out before the figure renders, so d2 never draws its Legend box; a second render of house.d2 + the vars
// block lifts each legend symbol out of d2's drawing as a standalone swatch SVG, with the figure's d2 groups drawn
// the same way as its targets. It also indexes the figure's d2 ids, which plugins/fences.ts resolves read steps against.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fail } from "./fail.ts";

const house = readFileSync(new URL("../../assets/house.d2", import.meta.url), "utf8").replace(/\n*$/, "\n\n");
const houseLines = house.split("\n").length - 1;

// The DiagramTools props for one key entry; `targets` are the figure's d2 group tokens (first class) drawn the same way.
export type LegendItem = { label: string; kind: "node" | "edge"; svg: string; targets: string[] };
// `ids` maps a d2 id as an author writes it (`check`, `known.sent`, `model -> check`) to the figure's group tokens.
export type Diagram = { svg: string; legend: LegendItem[]; ids: Map<string, string[]> };

// A legend label names a symbol: at most this many words, no full stop.
const LABEL_WORDS = 4;

const entities = (s: string) => s.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

// The index of the `}` that closes the `{` at `open`, skipping d2 strings and `#` comments; -1 when unbalanced.
function closeBrace(src: string, open: number): number {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'") {
      for (i++; i < src.length && src[i] !== c; i++) if (src[i] === "\\") i++;
    } else if (c === "#") {
      i = src.indexOf("\n", i);
      if (i < 0) return -1;
    } else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i;
  }
  return -1;
}

const lineOf = (src: string, at: number) => src.slice(0, at).split("\n").length;
const blank = (s: string) => s.replace(/[^\n]/g, " ");

// The block's `vars: { d2-legend: { ... } }`, as [start, end) in the source; undefined without one. Any other vars fail.
function legendVars(src: string, file: string, line: number): [number, number] | undefined {
  const found = [...src.matchAll(/^[ \t]*vars\b[ \t]*[.:]/gm)];
  if (found.length === 0) return undefined;
  function bad(at: number): never {
    fail(file, line + lineOf(src, at), "a diagram declares no vars but its key, as vars: { d2-legend: { ... } }; house.d2 owns d2-config");
  }
  const blocks = found.map(({ index: start }): [number, number] => {
    const open = /^[ \t]*vars[ \t]*:[ \t]*\{/.exec(src.slice(start));
    if (open === null) bad(start);
    const end = closeBrace(src, start + open[0].length - 1);
    if (end < 0) fail(file, line + lineOf(src, start), "the vars block is never closed");
    const body = src.slice(start + open[0].length, end);
    const legend = /^[ \t]*d2-legend[ \t]*:[ \t]*\{/m.exec(body);
    const legendEnd = legend === null ? -1 : closeBrace(body, legend.index + legend[0].length - 1);
    const rest = legend === null || legendEnd < 0 ? body : body.slice(0, legend.index) + body.slice(legendEnd + 1);
    if (legend === null || rest.replace(/#[^\n]*/g, "").trim() !== "") bad(start);
    return [start, end + 1];
  });
  if (blocks.length > 1) bad(blocks[1]![0]);
  return blocks[0];
}

// Runs d2 on house.d2 + `src` and returns the SVG text. `src` keeps the fence's line count, so d2's line numbers map
// back to the document.
function render(src: string, file: string, line: number, pad: number): string {
  const dir = mkdtempSync(join(tmpdir(), "technical-html-"));
  try {
    writeFileSync(join(dir, "diagram.d2"), house + src);
    const run = spawnSync("d2", ["--layout=tala", "--pad", String(pad), join(dir, "diagram.d2"), join(dir, "diagram.svg")], { encoding: "utf8" });
    if (run.error !== undefined) fail(file, line, "cannot find the `d2` CLI; install d2 with TALA");
    if (run.status !== 0) {
      const message = run.stderr
        .replace(/failed to compile \S+diagram\.d2: /, "")
        .replace(/\S*diagram\.d2:(\d+):(\d+)/g, (_all, l: string, c: string) => `${relative(process.env.TECHNICAL_HTML_CWD ?? process.cwd(), file)}:${line + Number(l) - houseLines}:${c}`);
      fail(file, line, `d2 failed for the diagram:\n${message.trim()}`);
    }
    return readFileSync(join(dir, "diagram.svg"), "utf8");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// An edge's look: stroke colour and whether it is dashed, read from its `path.connection`.
const edgeSig = (markup: string) => {
  const path = /<path [^>]*class="connection\b[^>]*>/.exec(markup)?.[0] ?? "";
  return `${(/ stroke="([^"]*)"/.exec(path)?.[1] ?? "").toLowerCase()}${path.includes("stroke-dasharray") ? ":dash" : ""}`;
};

// `(a -> b)[0]` or `box.(a -> b)[0]` as an author writes it: `a -> b`, `box.a -> box.b`; `<-` turned around.
const EDGE = /^((?:[^(]*\.)?)\((.*) (<->|->|<-|--) (.*)\)\[\d+\]$/;
export const edgeKey = (from: string, arrow: string, to: string) => (arrow === "<-" ? `${to} -> ${from}` : `${from} ${arrow} ${to}`);

type Part = { token: string; id: string; edge: boolean; classes: string[]; sig: string };

// Every d2 node and edge group in the figure SVG: `<g class="<base64 id>[ <class>...]">`.
function parts(svg: string): Part[] {
  const groups = [...svg.matchAll(/<g class="([A-Za-z0-9+/]+={0,2})((?: [^" ]+)*)">/g)];
  return groups.flatMap((m, i) => {
    const token = m[1]!;
    const raw = Buffer.from(token, "base64");
    if (raw.toString("base64") !== token) return []; // an inner group such as `shape`, not a d2 id
    const id = entities(raw.toString("utf8"));
    const edge = EDGE.test(id);
    const markup = svg.slice(m.index, groups[i + 1]?.index ?? svg.length);
    return [{ token, id, edge, classes: (m[2] ?? "").trim().split(" ").filter(Boolean), sig: edge ? edgeSig(markup) : "" }];
  });
}

// d2 writes each legend symbol as <g transform="translate(..) scale(..)"><g class="<b64 id>[ class]">…</g></g>, then
// its <text> label. The inner group keeps its own unscaled coordinates; the swatch's viewBox does the scaling.
const SYMBOL =
  /<g transform="translate\([^)]*\) scale\([^)]*\)">\s*(<g class="([A-Za-z0-9+/=]+)((?: [\w-]+)*)"[\s\S]*?<\/g>)\s*<\/g>\s*<text class="text"[^>]*>([^<]*)<\/text>/g;

// d2 draws a legend shape 120 units wide at 0.2 scale, so its 2-unit outline would be a hairline in a 24 px swatch.
// A non-scaling stroke draws it at about the weight of the diagram's outlines on screen (2 units at ~0.56 scale).
const SHAPE_STROKE = 1.25;

function legend(src: string, vars: [number, number], figure: Part[], id: string, file: string, line: number): LegendItem[] {
  // Only the vars block, at its own lines, plus an invisible anchor for d2 to draw the legend beside.
  const only = blank(src.slice(0, vars[0])) + src.slice(vars[0], vars[1]) + blank(src.slice(vars[1]));
  const svg = render(`${only}\nanchor: "" {style.opacity: 0}\n`, file, line, 0);
  const block = src.slice(vars[0], vars[1]);
  const items = [...svg.matchAll(SYMBOL)].map(([, group, b64, classes, text]): LegendItem => {
    const label = entities(text!).trim();
    const at = block.indexOf(label);
    const where = line + lineOf(src, vars[0] + Math.max(at, 0));
    if (label.split(/\s+/).length > LABEL_WORDS || label.includes(".")) {
      fail(file, where, `legend label "${label}" is not a short name; use 1 to ${LABEL_WORDS} words and no full stop`);
    }
    // d2 points the legend's edges at masks it never writes; dropping them lets the arrows render. Marker ids get the
    // figure's id so two figures' keys never share one. The legend's own d2 id leaves the class, so a swatch never
    // matches a target selector of a diagram node with the same id.
    const markup = group!
      .replace(/ mask="[^"]*"/g, "")
      .replace(/mk-legend-/g, `mk-${id}-`)
      .replace(/^<g class="[^" ]+ ?([^"]*)"/, (_all, rest: string) => (rest === "" ? "<g" : `<g class="${rest}"`));
    const edge = EDGE.test(entities(Buffer.from(b64!, "base64").toString("utf8")));
    let item: LegendItem;
    if (edge) {
      const sig = edgeSig(markup);
      item = { label, kind: "edge", targets: figure.filter((p) => p.edge && p.sig === sig).map((p) => p.token), svg: swatch("-1 -8 50 16", 25, 8, markup) };
    } else {
      const cls = (classes ?? "").trim().split(" ").filter(Boolean);
      const shapes = markup.replace(/<(rect|path|ellipse|circle|polygon|line)\b([^>]*?)style="stroke-width:[^;"]*;?/g, `<$1 vector-effect="non-scaling-stroke"$2style="stroke-width:${SHAPE_STROKE};`);
      const targets = cls.length === 0 ? [] : figure.filter((p) => !p.edge && cls.every((c) => p.classes.includes(c))).map((p) => p.token);
      item = { label, kind: "node", targets, svg: swatch("-4 -4 128 128", 24, 24, shapes) };
    }
    if (item.targets.length === 0) fail(file, where, `legend item "${label}" matches nothing in the diagram`);
    return item;
  });
  if (items.length === 0) fail(file, line + lineOf(src, vars[0]), "d2 drew no symbols for the d2-legend block");
  return items;
}

const swatch = (viewBox: string, w: number, h: number, markup: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}" aria-hidden="true" focusable="false">${markup}</svg>`;

export function d2(src: string, file: string, line: number, id: string): Diagram {
  const md = src.split("\n").findIndex((l) => /\|+\s*md\b/.test(l));
  if (md >= 0) fail(file, line + 1 + md, "d2 uses a |md label; use plain string labels with \\n");
  const vars = legendVars(src, file, line);
  const figureSrc = vars === undefined ? src : src.slice(0, vars[0]) + blank(src.slice(vars[0], vars[1])) + src.slice(vars[1]);
  const raw = render(figureSrc, file, line, 24);
  const figure = parts(raw);
  const ids = new Map<string, string[]>();
  const add = (key: string, token: string) => ids.set(key, [...(ids.get(key) ?? []), token]);
  for (const p of figure) {
    add(p.id, p.token);
    const e = EDGE.exec(p.id);
    if (e !== null) add(edgeKey(`${e[1]}${e[2]}`, e[3]!, `${e[1]}${e[4]}`), p.token);
  }
  const w = /viewBox="0 0 (\d+(?:\.\d+)?)/.exec(raw)?.[1] ?? "600";
  const svg = raw
    .replace(/^<\?xml[^>]*\?>\s*/, "")
    .replace(/preserveAspectRatio="[^"]*"/, "")
    .replace("<svg ", `<svg role="img" preserveAspectRatio="xMidYMin meet" style="--w:${w}px" `)
    .replace(/(<svg class="d2-[^"]*"[^>]*?) width="\d+(?:\.\d+)?" height="\d+(?:\.\d+)?"/, '$1 width="100%" height="100%"');
  return { svg, legend: vars === undefined ? [] : legend(src, vars, figure, id, file, line), ids };
}
