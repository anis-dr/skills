---
name: tanstack-start-middleware
description: Use when TanStack Start global middleware needs server-only implementation imports without dynamic import or client import-protection failures.
---

# TanStack Start server-only middleware import safety

Use this pattern when a shared `src/start.ts` must register request middleware whose implementation imports Node-only modules.

## Problem

These both fail, for different reasons:

- Dynamic `import()` inside `.server(...)` violates static-dependency and Effect lint rules.
- Importing a `.server.ts` middleware value and placing it directly in `createStart({ requestMiddleware })` makes TanStack Start's client import-protection plugin reject the server-only import.

## Pattern

Keep the implementation in a `.server.ts` module and export the request handler, not the completed middleware object:

```ts
// tracing-middleware.server.ts
import type { RequestServerFn } from "@tanstack/react-start"

export const handleTracingRequest: RequestServerFn<{}, undefined, undefined> =
  function (options) {
    // Node-only implementation
  }
```

Reference that import only inside an inline `.server(...)` callback in the shared Start entry:

```ts
// start.ts
import { createMiddleware, createStart } from "@tanstack/react-start"
import { handleTracingRequest } from "./tracing-middleware.server"

const tracingMiddleware = createMiddleware().server((options) =>
  handleTracingRequest(options)
)

export const startInstance = createStart(() => ({
  requestMiddleware: [tracingMiddleware],
}))
```

TanStack's transform recognizes the inline `.server(...)` boundary and removes the server-only dependency from the client graph.

## Verification

Run the production web build, not only TypeScript:

```sh
bun run build
```

A typecheck cannot detect the import-protection failure.
