# Perf issue

One measured slowness, traced and fixed once against a baseline. For sustained improvement of a metric toward a target, use [Hillclimb](hillclimb.md) instead.

1. **Capture a baseline trace** into `.scratchpad/<task>/`, where the post-fix trace and the comparison also go, on the surface where the user sees the slowness. For a web or Electron UI, call the Skill tool with "control-ui". For a CLI or TUI, call the Skill tool with "control-cli". Record the number and the artifact path. Vet the baseline, and every number after it, before you plan from it: name the limiter, run every side tuned the way production runs it, check the result against hardware limits, count errors, run each side at least 5 times alternating and report the median and range, measure the end-to-end path next to any micro result, and confirm the timed work actually happened. A number that fails one of these is inconclusive; say which check it failed.
2. **Ground the hypotheses.** Call the Skill tool with "how" over the slow path so each hypothesis names a real mechanism. Run it before you claim a ceiling.

   Try the performance mantras in order, cheapest first. A mantra earns an attempt only when the trace shows work it would remove or move:

   1. Don't do it. Stop work whose result nothing uses rather than cheapening it. The trace shows what is slow, never that it is deletable, so this one needs the `how` pass, not the profiler.
   2. Do it, but don't do it again.
   3. Do it less.
   4. Do it later.
   5. Do it when they're not looking.
   6. Do it concurrently.
   7. Do it cheaper.

   When an earlier mantra meets the target, stop.
3. **Plan the fix from the trace.** If it crosses a function boundary, sketch its types and signatures first; for a redesign, tell the user to run `/architect` and wait. Hand the implementation to a subagent on a fast model with a tight scope. Review its diff yourself; its summary is not a review. Then capture a post-fix trace on the same surface as the baseline. Verify each attempt before trying the next.
4. **Compare the artifacts.** Parse both traces into something you can query and diff (JSON into sqlite, then a diff). An inconclusive result or a wrong-surface measurement is not a pass. Flag it.
5. **Open the PR.** Call the Skill tool with "pr" to write the body, and cite the baseline and post-fix measurement in it. Then open it with `gh pr create`.
