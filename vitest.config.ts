import { defineConfig } from "vitest/config";

// .upstream/ holds fetched repos with their own test files.
export default defineConfig({ test: { include: ["test/**/*.test.ts"] } });
