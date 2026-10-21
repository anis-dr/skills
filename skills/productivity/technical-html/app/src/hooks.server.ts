import type { Handle, HandleServerError } from "@sveltejs/kit";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { metadata } from "$doc";

// <body class="doc-<type>"> from the frontmatter; app.html holds the placeholder.
export const handle: Handle = ({ event, resolve }) =>
  resolve(event, { transformPageChunk: ({ html }) => html.replace("%doc.body%", metadata.type === undefined ? "" : ` class="doc-${metadata.type}"`) });

// A component that throws while the page prerenders. Kit prerenders in another process, so the message goes to a file
// that scripts/build.ts reports.
export const handleError: HandleServerError = ({ error }) => {
  writeFileSync(join(process.env.TECHNICAL_HTML_OUT ?? "", "error.txt"), error instanceof Error ? `${error.name}: ${error.message}` : String(error));
};
