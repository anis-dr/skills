---
name: estimate
description: "Estimate effort or duration with a stated basis and a calibration log. Use when estimating how long an agent run, task, ticket, feature or project will take; sizing tickets; quoting effort for a client; or about to state a time estimate in a reply. Covers agent runtime, human dev effort, client quotes and one-line replies."
---

# Estimate

Models misjudge time in both directions. They overestimate their own runtime (median 6.1x for the worst frontier model tested, 5x or more on multi-step agentic runs), recall elapsed time off by 1.7-100x, and default to human-scale minutes for second-scale work ([Garikaparthi 2026, arXiv 2604.00010](https://arxiv.org/abs/2604.00010)). On human work, Claude's ticket estimates rank tasks about as well as developers do (rho 0.44 against 0.50) but compress: short tasks come out too long, long tasks too short, and ten in-context examples did not fix it ([Anthropic, 2025-11-25](https://www.anthropic.com/research/estimating-productivity-gains)). So an estimate is built from parts, labeled with its basis, and checked against a log.

## Rules for every estimate

- **Pick the clock.** Agent clock or human clock, never both in one number. A number states its unit and its clock.
- **Give a range**: low, expected, high. A point value hides the spread.
- **Label the basis.** `measured n=12` means 12 finished rows of this kind and type in the log. `assumed` means a default or a judgment. Below 5 measured rows the basis is `assumed`.
- **Do arithmetic with the script or a calculator**, never inline. Complexity labels ("simple", "trivial") do not move a number: count rounds, modules or assumptions instead (one frontier model scored 18% on pairs where the label misleads, in the paper above).
- **Log it.** Before the work starts, run `start`. When it ends, run `finish` or `actual`. See [the log](#calibration-log).

## Pick the branch

1. **Agent runtime** (how long will this agent run take?): read [agent runtime](references/agent-runtime.md).
2. **Human dev effort** (ticket, feature, how long would a developer need?): read [human effort](references/human-effort.md).
3. **Client quote** (effort that becomes a price): read [client quote](references/client-quote.md).
4. **Reply to the user** (stating any estimate in chat): use the format below.

A task that fits two branches runs both and keeps the two numbers apart.

## Reply format

One line: a range in the right unit and clock, then the basis.

- `agent: ~6-10 min (assumed, 4 modules x ~5 rounds)`
- `you: ~2-3 h (measured n=12, familiar codebase)`

Done when the line carries a range, a clock, a unit and a basis, and no other number in the reply mixes the clocks.

## Calibration log

`scripts/estimates.py` in this folder keeps the log (Python 3, no dependencies). Run `python3 scripts/estimates.py --help` from this folder for the arguments; every command prints the file it used.

- `start --id ID --kind agent|human|quote --type TYPE --low N --expected N --high N --unit rounds|minutes|hours [--note TEXT]` stamps the start time from the clock.
- `finish --id ID [--rounds N]` stamps the end. Pass the tool-call round count when you counted it; a rounds estimate needs it.
- `actual --id ID --value N --unit hours|minutes` records a human or quote actual reported later.
- `report [--kind K] [--type T]` prints per kind and type: n, PRED(25) (share of rows within 25% of the actual), median actual/expected, share inside low-high, a suggested multiplier capped at +/-20% per review, and the measured minutes per round. Below 5 measured rows it prints `insufficient data (n<5)`.

Use the same `--type` string for the same kind of work (`script`, `migration`, `crud-endpoint`), or `report` cannot group it. Elapsed time for the log comes from `start` and `finish`, never from your recall of how long it took.

Done when every estimate you stated has a `start` row, and every finished piece of work has its `finish` or `actual`.

## Sources

The anchor bands, named risk multipliers, integration line and the measured-versus-assumed label are ideas from ZhangHanDong/agent-estimation, kiloloop/agent-estimate and Enreign/progressive-estimation, rewritten here. The repo's `NOTICE.md` credits them.
