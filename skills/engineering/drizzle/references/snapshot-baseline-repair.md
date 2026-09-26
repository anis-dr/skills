# Snapshot baseline repair

Use when `drizzle-kit generate` emits many unrelated tables, enums, constraints or rename prompts because `_journal.json` continued after the latest snapshot: hand-written SQL migrations landed with journal entries but no current-schema snapshot.

Generate diffs only the latest snapshot against the TypeScript schema (see "How Drizzle decides" in `SKILL.md`), so the feature branch did not necessarily create any of the generated operations.

## Invariant

A snapshot-only no-op migration is safe only after proof that applying all preceding migrations to an empty database rebuilds the schema the generated snapshot describes. `IF NOT EXISTS` wrappers are not proof: they can silently keep incompatible definitions.

## 1. Diagnose

1. Find the latest `meta/*_snapshot.json`.
2. Compare its position with the journal tail.
3. Confirm that the later SQL migrations have journal entries but no matching snapshot.

## 2. Generate the candidate baseline

1. Branch from the exact merged migration base.
2. Build the workspace packages that `drizzle.config.ts` imports. Stale `dist` exports show up as undefined enum members or missing exports.
3. Run normal named generation with a TTY and a descriptive name. Classify new tables as created, not renamed.
4. Keep the generated SQL, snapshot and journal entry for audit.
5. Treat the broad SQL as unsafe evidence. Open the PR as a draft marked DO NOT MERGE.

Skip `generate --custom` here (drizzle-kit 0.31.10): it carries the stale snapshot forward instead of recording the current schema.

## 3. Prove what the SQL should be

1. Temporarily exclude the baseline artifacts (restore the pre-baseline journal and files).
2. Reset only an explicitly approved, local, disposable database. Refuse non-local hosts.
3. Apply every existing migration to the empty database.
4. Compare the fresh migrated database with the TypeScript schema using `drizzle-kit push`. Stop at the confirmation prompt and apply nothing.
5. Where a deployed database exists, also compare it with the fresh one using semantic inventories:
   - base-table and column counts;
   - column names, types, nullability and defaults, treating physical column order separately;
   - complete index definitions and their hash;
   - constraint definitions, excluding PostgreSQL-version-specific `NOT NULL` constraint rows;
   - enum labels and order.
6. Compare the broad generated SQL against objects the preceding migrations already created. Keep unrelated `drizzle-kit push` drift separate from the stale-snapshot problem; it does not belong in the baseline.
7. Classify each proposed operation:
   - equivalent naming or representation: no DDL;
   - real missing schema: focused DDL;
   - destructive or ambiguous: owner decision.
8. Restore the generated snapshot and journal entry.

## 4. Write the baseline

- Every broad operation duplicates prior migration state: replace the generated SQL body with an explanatory comment and `SELECT 1;`. Keep the generated current-schema snapshot and the sequential journal entry.
- Some schema is really missing: replace the broad SQL with only the proven missing DDL.

A no-op baseline is wrong if the fresh migrated database lacks any table, column, index, constraint, enum value, default or nullability the snapshot represents. Reconcile each real difference first: change the TypeScript schema when the database is canonical, or add narrow guarded DDL when TypeScript is canonical.

## 5. Completion gates

1. Reset the local database again and apply the complete history including the baseline. The fresh database migrates successfully.
2. Run migration a second time: no migration reapplies.
3. The live schema comparison reports no meaningful drift.
4. A temporary `drizzle-kit generate --name baseline-probe` reports `No schema changes, nothing to migrate`. Remove any probe artifact it created.
5. Feature migrations generated above the baseline contain only feature-owned DDL.
6. The migration ledger hash equals the hash of the committed baseline SQL.
7. Keep the PR draft until this evidence is recorded, then push or update it. Stop before merge unless the user explicitly authorizes it.

The broad generated SQL used as evidence is never applied or merged.
