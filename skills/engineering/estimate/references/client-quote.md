# Client quote

Effort that becomes a price. The human-effort rules apply per module; a quote adds the commitment level.

## Steps

1. **List the modules** the client buys, each one deliverable. Done when no deliverable is outside a module.
2. **Estimate each module** with the [human effort](human-effort.md) steps: low, expected, high hours and the assumptions (codebase familiarity, access, client response time, scope exclusions). Done when every module has a range and its assumptions.
3. **Add the shared lines** as modules of their own: integration, testing, project management, handover. Done when none is hidden inside another module.
4. **Choose the commitment.** Expected is the 50% value: the work lands at or under it half the time. Committed is the value the work stays under 80% or 90% of the time. State which one the quote uses, and say the other beside it. A fixed price uses committed; a time-and-materials estimate uses expected with the high shown. Done when the quote names its level (expected, 80% or 90%).
5. **Hand pricing over.** Call the Skill tool with "technical-pdf" and follow its client-quote branch: the day rate and the module list produce the prices there. Pass the hours per module, the commitment level and the assumptions; do not type a price by hand.
6. **Log it.** `start --kind quote --type TYPE --unit hours` per quote. After delivery, `actual --id ID --value N --unit hours` with the hours spent. Done when the row exists.

Never put an agent-clock number in a quote: the client pays for human effort.
