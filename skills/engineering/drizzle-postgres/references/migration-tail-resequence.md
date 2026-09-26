# Migration tail re-sequence

Use when a long-lived branch carries generated migrations and the base branch (for example `staging`) landed its own migrations with interleaving timestamps, and the branch's migrations must apply strictly after the base's on every environment.

## Why interleaved timestamps are a real failure

The migrator applies only entries above the most recent ledger `created_at` (see "How Drizzle decides" in `SKILL.md`). With interleaved stamps, environments that already ran the base's migrations silently skip branch migrations below the mark, and environments that ran the branch's skip base migrations below the mark.

## Procedure

1. **Enumerate both sides** from the merge base: `git diff --name-only $(git merge-base HEAD origin/<base>) origin/<base> -- <migrations-dir>` and the branch's own migration files. Check whether the base added `meta/*_snapshot.json` files. Hand-written SQL migrations often have journal entries but no snapshots; then the snapshot lineage does not fork and renames need zero snapshot edits.
2. **Pick new stamps** later than every base stamp, keeping the branch's relative order (for example today's date with minute increments). Compute each `when` as the epoch milliseconds of the stamp datetime (UTC).
3. **`git mv`** each branch `.sql` and its `meta/<stamp>_snapshot.json`. Leave snapshot contents untouched: ids and prevIds stay valid because file names are not part of the lineage.
4. **Rebuild the journal tail**: base entries first, branch entries after, sequential `idx`, new `when`s. Validate with a JSON parse and an idx-linearity check.
5. **Hunt in-file journal identities**: any migration that guards itself by its own journal `when` (re-execution guards binding `created_at = <when>`) needs the constant updated in the SQL and in any TS mirror constant. Grep the old epoch-ms value repo-wide.
6. **Hunt filename references**: `git grep` every old stamp across the repo. Runtime scripts that `readFile` a migration by path (reconciliation scripts, for example) and tests will break. A behavior test that loads the migration through the script's own default path catches this.
7. **Verify**: the journal parses, no stale references remain (`git grep old-stamp|old-when`), the affected focused tests pass, and the full gate passes.

## Per-environment ledger preflight

Run this before claiming what is pending anywhere. One environment's pending set says nothing about another's. For each environment:

```sql
select id, created_at, hash from drizzle.__drizzle_migrations order by created_at desc;
```

- Pending means journal entries with `when` strictly greater than max(`created_at`).
- Orphan ledger rows (a `created_at` matching no journal entry) reveal out-of-band hotfixes or pre-rename applications. Orphans below the mark are inert.
- sha256 the base's migration files and compare against ledger hashes, to prove the merged copies are byte-identical to what actually ran.
- Dev databases that applied the branch migrations under the old stamps need a ledger re-stamp (UPDATE `created_at` old to new; Drizzle stores hashes but never compares them) plus manual application of base migrations stuck below their mark. Re-dumping is the simpler option.

## Rehearsal

Before any real deploy, restore a fresh dump of the target environment and run migrate twice. Run 1 applies the pending set (verify readback counts); run 2 must be a guarded no-op. Probe abort-risk data first with read-only queries derived from the migration's own preflight: old-name references per config location, non-object JSON shapes, duplicate keys for new unique indexes.
