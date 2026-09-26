---
name: phantom-db-query-timeout-diagnosis
description: "Use when a Node/pg app reports 'Query read timeout' or slow-query errors while the database is demonstrably healthy. Separates client event-loop stalls, per-row WAN loops and pool starvation from real DB slowness, especially on constrained workers (for example Trigger.dev micro machines)."
---

# Phantom DB query timeout diagnosis

Use when a Node/pg app reports query timeouts (`Query read timeout`, bounded-operation deadline errors) but DB metrics look healthy.

## Decision tree

1. **Get the real error source.** `Error: Query read timeout` at `pg/lib/client.js` is the client-side `query_timeout` (wall clock). `canceling statement due to statement timeout` is server-side. Drizzle's `DrizzleQueryError` ("Failed query: <sql>") hides the pg cause; find the run trace or reproduce to get it.
2. **Check DB health during the failure window** (CPU, active connections, error logs). If CPU is low, connections are far under max, and there are no DB errors, the database is innocent: do NOT raise DB resources.
3. **Ask which statement timed out.** BEGIN, COMMIT or a single-row indexed UPDATE "taking 30s" is physically impossible server-side, so the time was spent client-side.
4. **Client-side causes, in order of likelihood:**
   - **Event-loop stall.** pg's `query_timeout` counts wall time until the event loop reads the socket. CPU-heavy work (JSON parse or stringify of large payloads, tokenization) on a small worker (Trigger.dev `micro` is 0.25 vCPU) stalls the loop past the timer even though Postgres answered in milliseconds. Check the worker machine preset and the compute duration.
   - **Per-row query loops over WAN.** N sequential round trips (about 50-100ms each) inside one bounded transaction: 400+ rows is roughly 30s or more. Grep the failing helper for `for (...) await query(...)`.
   - **Pool acquisition starvation.** An unbounded `Promise.all` of N queries through a small pool (`max: 10`) with a short `connectionTimeoutMillis`. Concurrent workloads multiply it.

## Fixes (root cause, not band-aid)

- Delete the client `query_timeout`; keep the server-side `statement_timeout` (`select set_config('statement_timeout', $1, true)` inside the transaction) as the only query bound. The task-level max duration covers dead sockets. Raising the client timeout just fails later.
- Replace per-row loops with one set-based statement: `UPDATE t SET ... FROM unnest($1::text[], $2::text[], ...) AS c(k, v) WHERE t.key = c.k`, or a multi-row `INSERT ... ON CONFLICT DO UPDATE`. Dedupe VALUES by conflict key first: Postgres rejects duplicate conflict keys in one statement ("cannot affect row a second time").
- Regression-guard in tests: assert exactly one UPDATE or INSERT regardless of row count, and assert `query_timeout === undefined` on captured query configs.
- Keep connection-destruction tests (`release(error)` on failure); that contract survives. Rename injected errors to the server-side message so they don't imply the client timeout still exists.

## Anti-patterns

- Raising the timeout value when the loop is O(n × RTT): it fails again at the next size bump.
- Blaming the DB or pool size while metrics show it idle.
- Assuming pools pre-open connections. `pg.Pool` is lazy: per-process usage equals peak concurrent query demand, and idle connections close after `idleTimeoutMillis` (default 10s).
