# One Codec per Concept

Every value that crosses a boundary (wire, database, form, config, file) has exactly one schema, and that schema both decodes and encodes it. The static type, validators, form rules and interop formats derive from it. Nothing about the concept is written twice.

**Why:** Two schemas for one concept drift. The day they disagree, one side accepts what the other rejects, and the bug lives in the gap: a form that allows what the API refuses, an ID the client formats one way and the server parses another.

**The pattern:**
- One codec per concept, owned by the module that owns the concept.
- Derive, don't restate: infer the type from the codec; generate JSON Schema or OpenAPI from it.
- A second schema library enters only through a generated bridge, never as a parallel model of the same concept.
- The codec is the only place the wire form and the internal form meet. Code on either side sees one form only.

**Applications:**
- An ID sent as `prd_01h…` and stored as a uuid: one codec that decodes the wire string to the stored form and encodes it back, not a parser in one file and a formatter in another.
- A form that checks what the API also checks: the form reuses the API's schema, or a JSON Schema generated from it.
- Environment config: one schema decoded at startup; the typed config everywhere after.
- A library that wants its own schema format (a form library, an OpenAPI tool): feed it a bridge generated from the codec.

**The tests:**
- "If I add a field, how many files change?" If the answer is more than the codec and its callers, a second source exists.
- "Could these two representations ever disagree?" If yes, one of them must be derived from the other.
- "Where does the wire form turn into the internal form?" If there's more than one answer, merge them into the codec.
