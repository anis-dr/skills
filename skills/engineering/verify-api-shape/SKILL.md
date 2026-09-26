---
name: verify-api-shape
description: "Use when code reads fields off a third-party API, when tests pass but a path never works in production, when a plan or PR claims what an API returns, or before marking such work done. Verifies the live response shape before trusting hand-written fixtures."
---

# Verify API shape before trusting fixtures

A green test suite proves nothing about an external API when the fixtures were hand-written. Fabricated fixtures encode a contract the API does not implement, so every guard passes in CI and the path refuses (or misbehaves) in production forever.

Real case: 278 passing tests, a reviewed and merged feature, and the code path could never succeed. It read three field names the API does not send.

## When to run this

- Code reads named fields off an external API response.
- A path "works" in tests but is reported as always refusing or never firing.
- Before marking any task done that consumes an external record.
- A plan or PR asserts "the API returns X".

## Procedure

### 1. Capture a real response first

Run a read-only GET against a non-production environment. Never reason from the fixture, the Swagger, or memory. If the endpoint has no documented response schema, that is itself a finding to report.

### 2. Prove absence properly

A missing key means "not on the DTO" ONLY if the serializer emits nulls. Test that first:

```js
// find a field that is null in every record: if it is PRESENT as null,
// the serializer emits nulls, so an absent key really is absent from the DTO
Object.entries(record).filter(([, v]) => v === null)
```

Without this check, "key not found" is ambiguous between unset and not modelled.

### 3. Search nested, not just top level

Fields routinely move one level down (`propertyId` becomes `property.propertyId`). Recurse before declaring a field missing:

```js
function find(obj, re, path = "") {
  const out = [];
  if (obj && typeof obj === "object") for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (re.test(k)) out.push({ path: p, value: v });
    if (v && typeof v === "object") out.push(...find(v, re, p));
  }
  return out;
}
```

### 4. Sample enough records, and check types per field

One record hides variance. Pull 20+ and tally presence, null rate and JS type per field. Money fields commonly arrive as strings in some records and numbers in others; enum-like fields may be ids in one endpoint and labels in another.

### 5. Never assume one endpoint's vocabulary from another's

Sibling endpoints in the same API disagree. Check each independently. The same field NAME can carry different meanings across endpoints, and that alone disqualifies it as the basis for a safety rule.

### 6. Distinguish read targets from write targets

If your code WRITES a field, it cannot also serve as the durable baseline you compare against. The first pass looks correct; every later pass compares the value against itself. Grep your own write path before choosing a baseline field.

### 7. Classify each defect by failure mode

- **Fails closed.** The path refuses: a liveness bug, and nothing incorrect was written.
- **Fails open.** A guard silently evaluates false and the operation proceeds: a safety bug.

Fails-open is the dangerous one, and it hides behind fails-closed defects: fixing the field names can ENABLE a path whose guard was silently disabled. Always ask what your fix switches on.

### 8. Rebuild fixtures from the capture

Derive every fixture from a captured response, sanitised. Then add a standing gate: no task that reads an external record is marked done until a real response is captured and every field the code reads is asserted to exist on it.

## Reporting

State the environment, date, and sample size with every claim ("QA, 2026-08-17, 60 records"). Say explicitly when something is measured rather than contractual. Never present a filtered subset of keys as if it were the whole response.
