// Source pass, before mdsvex parses the document. Checks the `::: kind` fenced divs and turns each marker line into a
// `***` thematic break on the same line, recorded in `markers`. A thematic break ends the list or paragraph that a bare
// `:::` would join as a lazy line, and line numbers stay the same. plugins/blocks.ts wraps what lies between markers.
import { fail } from "./fail.ts";

export const DIVS = ["steps", "card", "footer"];
// Per document: file line of each marker -> its kind ("" closes).
export const markers = new Map<string, Map<number, string>>();

export function divs(source: string, file: string): string {
  const lines = source.split("\n");
  let fence: { marker: string; lang: string; line: number } | undefined;
  let div: { kind: string; line: number } | undefined;
  const found = new Map<number, string>();
  markers.set(file, found);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const no = i + 1;
    if (fence !== undefined) {
      const close = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(line)?.[1];
      if (close !== undefined && close[0] === fence.marker[0] && close.length >= fence.marker.length) fence = undefined;
      continue;
    }
    const open = /^ {0,3}(`{3,}|~{3,})[ \t]*([^\s`]*)/.exec(line);
    if (open !== null) {
      fence = { marker: open[1] ?? "```", lang: open[2] ?? "", line: no };
      continue;
    }
    const kind = /^:::[ \t]*(.*?)[ \t]*$/.exec(line)?.[1];
    if (kind === undefined) continue;
    if (kind === "") {
      if (div === undefined) fail(file, no, '":::" closes nothing');
      div = undefined;
    } else if (!DIVS.includes(kind)) {
      fail(file, no, `unknown fenced div kind "${kind}" (known: ${DIVS.join(", ")})`);
    } else if (div !== undefined) {
      fail(file, no, `"::: ${kind}" inside "::: ${div.kind}" (opened at line ${div.line}); fenced divs do not nest`);
    } else {
      div = { kind, line: no };
    }
    found.set(no, kind);
    lines[i] = "***";
  }
  if (fence?.lang === "d2") fail(file, fence.line, "unclosed d2 code fence");
  if (div !== undefined) fail(file, div.line, `unclosed "::: ${div.kind}"; close it with a line containing only ":::"`);
  return lines.join("\n");
}
