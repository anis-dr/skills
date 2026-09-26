# Bulk parameters

Use this procedure for set-based PostgreSQL writes through Drizzle.

1. JavaScript arrays do not become PostgreSQL arrays in `sql` templates. Drizzle can compile `${values}::text[]` as a tuple, `($1,$2,...)::text[]`, which PostgreSQL rejects with `42846`.
2. Represent heterogeneous row changes as objects and `JSON.stringify` the whole row array once.
3. Pass that JSON string as one Drizzle parameter and expand it in SQL:

   ```sql
   from jsonb_to_recordset(${serializedRows}::jsonb)
        as changes(id text, state jsonb, status text)
   ```

4. Keep the existing transaction, row locks, ownership guard, and set-based update semantics.
5. Add a compilation-level regression test using `new PgDialect().sqlToQuery(query)`:
   - SQL contains `jsonb_to_recordset($N::jsonb)`;
   - SQL does not contain tuple-array `unnest` casts;
   - params contain exactly one serialized row-array value at that position.
6. Run a real staging canary before production promotion. Unit mocks do not exercise PostgreSQL parameter encoding.
