// Build errors for the document, as `<file>:<line>: <message>`. The first one is kept on globalThis because Vite
// wraps errors thrown inside preprocessors; scripts/build.ts prints it as `build: <message>`.
import { relative } from "node:path";

export function fail(file: string, line: number | undefined, message: string): never {
  const text = `${relative(process.env.TECHNICAL_HTML_CWD ?? process.cwd(), file)}:${line ?? 1}: ${message}`;
  const g = globalThis as { technicalHtmlError?: string };
  g.technicalHtmlError ??= text;
  throw new Error(text);
}

// HTML text, with Svelte's `{` and `}` as entities so generated markup never opens an expression.
export const esc = (s: string): string => s.replace(/[&<>"{}]/g, (c) => `&#${c.charCodeAt(0)};`);
