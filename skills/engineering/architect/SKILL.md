---
name: architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
disable-model-invocation: true
---

# Architect

Before writing code, trace every system the change touches, then sketch two different shapes for it (types, signatures, module boundaries) and pick the one where each piece of state has one owner, each task has one way to do it, and callers need to know least. Redesign instead of patching if workarounds repeat.

Call the Skill tool with "codebase-design" first. It owns the vocabulary for the sketch (module, interface, depth, seam, adapter) and the depth rules.

For a large or contested design, arena replaces sketching alone. The arena skill is user-invoked, so tell the user to run `/arena` with the design task and what you traced, and wait for its result.
