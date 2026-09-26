# Perf issue

One measured slowness, traced and fixed once against a baseline. For sustained improvement of a metric toward a target, use [Hillclimb](hillclimb.md) instead.

1. **Capture a baseline trace** on the surface where the user sees the slowness. For a web or Electron UI, call the Skill tool with "control-ui". For a CLI or TUI, call the Skill tool with "control-cli". Record the number and the artifact path.
2. **Ground the hypotheses.** Call the Skill tool with "how" over the slow path so each hypothesis names a real mechanism. Run it before you claim a ceiling.

   Most fixes come from the eight strategy families below. They generate hypotheses; they are not a checklist. A family earns an attempt only when the trace shows the signal it names.

   - **Elimination.** Before optimizing the hot path, ask whether it needs to exist: a computation nobody consumes, a feature gate that is always off for this user, a sync that mirrors state already held elsewhere, a legacy path kept "just in case". The trace shows what is slow, never that it is deletable, so this family needs the `how` pass, not the profiler.
   - **Divide and conquer.** The dominant cost scales with input size. Split the work so each piece touches less (chunk, shard, prune the search space), or so independent pieces run in parallel.
   - **Caching.** The same computation or fetch repeats on identical inputs. Store the result and reuse it. Name what invalidates it before claiming the win.
   - **Indirection.** The hot path does expensive work that a cheaper intermediate could absorb: an index instead of a scan, a queue that moves work off the interactive thread, a handle that lets a cheaper implementation swap in. Add the hop only when it removes more from the critical path than it adds.
   - **Batching.** Many small operations each pay a fixed overhead (RPC, query, syscall, draw call). Coalesce them so the overhead is paid once per batch.
   - **Redundancy.** The wait hangs on one slow instance or attempt. Duplicate the work (replicas, hedged requests, speculative execution) and take the fastest result. The trace has to show that the wait dominates and that the system has headroom.
   - **Lazy evaluation.** Cost lands on results that are never used or not needed yet (eager init on the boot path, rendering offscreen items). Defer the work until first use.
   - **Scheduling.** The work must happen, but not during the interactive moment. Move it to where nobody is waiting: idle callbacks, a background warmup after boot, precompute before the user arrives, cleanup after the frame commits. The win is perceived latency, so measure the interactive path, not total work done.
3. **Plan the fix from the trace.** If it crosses a function boundary, sketch its types and signatures first; for a redesign, tell the user to run `/architect` and wait. Hand the implementation to a subagent on a fast model with a tight scope. Review its diff yourself; its summary is not a review. Then capture a post-fix trace on the same surface as the baseline. Verify each attempt before trying the next.
4. **Compare the artifacts.** Parse both traces into something you can query and diff (JSON into sqlite, then a diff). An inconclusive result or a wrong-surface measurement is not a pass. Flag it.
5. **Open the PR.** Call the Skill tool with "pr" to write the body, and cite the baseline and post-fix measurement in it. Then open it with `gh pr create`.
