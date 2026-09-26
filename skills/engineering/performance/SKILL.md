---
name: performance
description: Make code faster against a measured baseline, never from reading the source. Use when a measured slowness needs a trace and a fix, or when one metric must climb toward a target over many kept-or-reverted attempts.
---

# Performance

You own the measurement story. Plan the work, review every diff, and verify the numbers. Subagents write the code.

## Measurement rules

Every branch follows these.

- Measure the baseline before any change. Record the number and the path of the artifact that holds it.
- Tie every fix to a measurement. Reading the source is not a measurement, and code inspection never proves a win. Apply the **prove-it-works** principle (call the Skill tool with "principles").
- One change, one measurement, then keep or revert. Never stack untested changes. Each attempt ends in a check before the next one starts, per the **sequence-verifiable-units** principle.
- Run it before you claim a performance ceiling.
- A result that is inconclusive, or measured on a different surface than the one the user complained about, is not a pass. Flag it in the reply.
- Before a fix crosses a function boundary, sketch its types and signatures first. When the fix needs a redesign, tell the user to run `/architect` and wait for the result.

## Branches

- [Perf issue](references/perf-issue.md): one measured slowness to trace, fix once, and prove against a baseline.
- [Hillclimb](references/hillclimb.md): sustained improvement of one metric toward a target, looping one hypothesis at a time with a decision log and one commit per kept win.

A defect that is not about speed is a bug: call the Skill tool with "diagnosing-bugs".

## Reply

Every claim carries its evidence or its label in the same sentence: measured, inferred, or guess. Link each PR as `https://github.com/<owner>/<repo>/pull/<number>`.

- **Perf issue.** The baseline number, the post-fix number, the delta, and the artifact path.
- **Hillclimb.** The metric and target, baseline to final with the percent delta, iterations run (kept and reverted), each accepted fix on one line, the `decision.tsv` path, and the best idea you would try next if pushed further.
