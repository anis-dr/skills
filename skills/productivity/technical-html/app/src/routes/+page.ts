import { metadata } from "$doc";

export const prerender = true;
// Hydrate only a document with interactive parts (a diff island, or a .svx script or component); see plugins/fences.ts.
export const csr = metadata.interactive === true;
