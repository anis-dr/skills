# Agent runtime

How long an agent run will take, on the agent's clock. Never estimate your own runtime from feel: models overestimate it 4-7x and call second-scale work minutes (Garikaparthi 2026, arXiv 2604.00010). Never use recalled elapsed time as an actual: recall is off by 1.7-100x. The clock in `start` and `finish` is the only source of an actual.

## Steps

1. **Decompose into modules.** One module is one change a reviewer could read on its own (a script, an endpoint, a migration, a test file). Done when every file or behavior in the task belongs to exactly one module.
2. **Count rounds per module.** A round is one tool call and the reasoning around it. Pick the anchor band that fits, then a point inside it:

   | Band | Rounds | Fits |
   | --- | --- | --- |
   | Boilerplate | 1-2 | The pattern exists next to the change; copy and adjust |
   | Moderate | 3-5 | Read a little, write, run once |
   | Exploratory | 5-10 | Read widely before writing, or several write-run cycles |
   | High uncertainty | 8-15 | Unknown cause, unknown API, or no way to run the result |

   Done when each module has a band and a round count inside it.
3. **Apply one named risk multiplier per module**, the one that fits best. Name it in the note.

   | Risk | x | Fits |
   | --- | --- | --- |
   | Known | 1.0 | Familiar code, fast checks |
   | Unfamiliar | 1.3 | New library, new corner of the codebase |
   | Slow loop | 1.5 | Checks take minutes, or the result needs a manual look |
   | Blind | 2.0 | No way to run it, external system, flaky environment |

   Done when every module carries one named multiplier.
4. **Add integration** as its own line: 10-20% of the module sum (wiring, the full test run, fixing what the pieces break together). Done when the total has a separate integration line.
5. **Convert rounds to minutes last**, with `minutes per round` from `python3 scripts/estimates.py report --kind agent --type TYPE`. With fewer than 5 measured runs of that type the report prints `insufficient data`: use 0.5 minutes per round and label the result `assumed`. Replace the default as soon as the log has a measured rate. Done when the reply names the rate and says `measured n=N` or `assumed`.
6. **Give low, expected and high.** Low takes the band floors with multiplier 1.0; high takes the band ceilings with the next multiplier up. Run the arithmetic with a calculator or a short script.
7. **Log it.** `start --kind agent --type TYPE --unit rounds` with the three round counts, run the task, then `finish --id ID --rounds N` with the rounds you counted. Done when the run has a finished row.

Express the reply in minutes on the agent clock: `agent: ~6-10 min (assumed, 4 modules x ~5 rounds + 15% integration)`.

Compare with the log before trusting a fresh count: if `report` shows a median actual/expected ratio far from 1.0 for this type, apply its suggested multiplier (capped at +/-20% per review).
