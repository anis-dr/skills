---
name: drizzle
description: Drizzle ORM on PostgreSQL. Use when writing or reviewing bulk updates that interpolate JavaScript arrays or set-based row changes; when merging a diverged branch whose migration timestamps interleave with the base branch's; or when drizzle-kit generate emits broad unrelated DDL (tables, enums, constraints, rename prompts) because the latest snapshot predates later hand-written SQL migrations.
---

# Drizzle

Three Drizzle-on-PostgreSQL problems. Pick the branch from the symptom, then read its reference file in full before acting.

- [Bulk parameters](references/bulk-parameters.md): a `sql` template interpolates a JavaScript array or a list of row changes, or PostgreSQL rejects a bulk write with `42846`.
- [Migration tail re-sequence](references/migration-tail-resequence.md): a long-lived branch's migration timestamps interleave with migrations the base branch landed, and the branch's must apply after the base's on every environment.
- [Snapshot baseline repair](references/snapshot-baseline-repair.md): `drizzle-kit generate` proposes many unrelated tables, enums, constraints or rename prompts, or you need a no-op baseline snapshot without shipping duplicate DDL.

## How Drizzle decides what to generate and apply

Both migration branches rest on these two facts. Read them before touching the journal or snapshots.

- `drizzle-kit generate` compares the latest `meta/*_snapshot.json` with the TypeScript schema. It reads neither the migration SQL nor the live database. Snapshot lineage runs through each snapshot's `id` and `prevId`, not through file names.
- The migrator applies a journal entry only when its `when` is strictly greater than the single most recent `created_at` row in `drizzle.__drizzle_migrations`. It stores a hash per migration but never compares hashes or counts rows.

## Shared checks

- Unit mocks do not exercise PostgreSQL. Prove every branch against a real database: a staging canary for runtime queries, a restored dump or a disposable local database for migrations.
- Stop before merge or production promotion unless the user explicitly authorizes it.
