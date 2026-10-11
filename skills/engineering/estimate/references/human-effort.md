# Human dev effort

How long a developer needs, on the human clock. Estimate it as "a competent professional with the needed domain knowledge and tools" (Anthropic, 2025-11-25), then correct for the way model estimates compress: short work comes out too long, long work too short.

## Steps

1. **State the assumptions** that move the number: how well the developer knows the codebase, the tools and the domain; whether tests, CI and a review loop exist; what counts as done (merged, deployed, documented). Done when each assumption is one line next to the estimate.
2. **Compare before guessing.** Find reference tasks of the same type in the log (`python3 scripts/estimates.py report --kind human --type TYPE`) or in closed tickets of the repo. Say "about as big as X, which took Y". Done when the estimate names a reference task, or says no reference exists.
3. **Estimate low, expected and high in hours.** Low is the quiet path, high is the path where one assumption fails. Long or vague work gets a wider upper tail: model estimates compress, so the high value of a task over a day is often 2-3x the expected value. Done when low < expected < high and the high names the assumption that fails.
4. **Split what is too big to hold.** A ticket above about a day, or one whose estimate you cannot compare to a reference, goes back to decomposition (sub-tasks, each with its own range) before it gets a number.
5. **Label the basis**: `measured n=N` from the log, or `assumed`. Never mix in the agent clock: how fast an agent would do it is a separate agent-runtime estimate.
6. **Log it.** `start --kind human --type TYPE --unit hours`. When the real time is known, `actual --id ID --value N --unit hours`. Done when the row exists.

Reply format: `you: ~2-3 h (assumed, familiar codebase, tests exist)`. For tickets, write the range and basis on the ticket.
