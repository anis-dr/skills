// Renders one ```d2 fence at build time: assets/house.d2 prepended, `d2 --layout=tala`, and the SVG made responsive at
// its natural width (style.css reads --w). Errors cite the document's file and line.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fail } from "./fail.ts";

const house = readFileSync(new URL("../../assets/house.d2", import.meta.url), "utf8").replace(/\n*$/, "\n\n");
const houseLines = house.split("\n").length - 1;

export function d2(src: string, file: string, line: number): string {
  const md = src.split("\n").findIndex((l) => /\|+\s*md\b/.test(l));
  if (md >= 0) fail(file, line + 1 + md, "d2 uses a |md label; use plain string labels with \\n");
  const dir = mkdtempSync(join(tmpdir(), "technical-html-"));
  try {
    writeFileSync(join(dir, "diagram.d2"), house + src);
    const run = spawnSync("d2", ["--layout=tala", "--pad", "24", join(dir, "diagram.d2"), join(dir, "diagram.svg")], { encoding: "utf8" });
    if (run.error !== undefined) fail(file, line, "cannot find the `d2` CLI; install d2 with TALA");
    if (run.status !== 0) {
      const message = run.stderr
        .replace(/failed to compile \S+diagram\.d2: /, "")
        .replace(/\S*diagram\.d2:(\d+):(\d+)/g, (_all, l: string, c: string) => `${relative(process.env.TECHNICAL_HTML_CWD ?? process.cwd(), file)}:${line + Number(l) - houseLines}:${c}`);
      fail(file, line, `d2 failed for the diagram:\n${message.trim()}`);
    }
    const svg = readFileSync(join(dir, "diagram.svg"), "utf8");
    const w = /viewBox="0 0 (\d+(?:\.\d+)?)/.exec(svg)?.[1] ?? "600";
    return svg
      .replace(/^<\?xml[^>]*\?>\s*/, "")
      .replace(/preserveAspectRatio="[^"]*"/, "")
      .replace("<svg ", `<svg role="img" preserveAspectRatio="xMidYMin meet" style="--w:${w}px" `)
      .replace(/(<svg class="d2-[^"]*"[^>]*?) width="\d+(?:\.\d+)?" height="\d+(?:\.\d+)?"/, '$1 width="100%" height="100%"');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
