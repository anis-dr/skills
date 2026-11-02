import { assert, describe, it } from "@effect/vitest";

import { applyRules } from "../src/rules.ts";

// Each case is real text from cursor/plugins@56aca54 (modelPreamble: @ecc249f, subagentEffort: @019a6a2, arena judge and interrogate adversaries: @ae5650f) and the neutral text sync must produce.
const cases: ReadonlyArray<readonly [string, string, string]> = [
  [
    "modelPreamble",
    "Each spawn below names a role line in the `pstack-models.mdc` rule and a default. Set `model` to that line's value, or to the default if the rule or the line is missing. Leave `model` unset when the value is `auto` or `inherit-parent`. If the Task tool rejects a slug, use the default and say so. If it rejects the default, use the closest valid slug of the same family from its error message.\n",
    "Each spawn below names the model it needs by role. Use the closest model your harness offers; when it offers no choice, use its default model.\n",
  ],
  [
    "inlineSpawnParams",
    "Every spawn is a Task subagent with `subagent_type: generalPurpose` and `readonly: true`. Explorers use the `how explorer` line in the `pstack-models.mdc` rule (default `grok-4.7-xhigh-fast`), and every explainer uses the `how explainer` line (default `claude-opus-5-5-xhigh`). Set `model` to that line's value, or to the default if the rule or the line is missing. Leave `model` unset when the value is `auto` or `inherit-parent`. If the Task tool rejects a slug, use the default and say so. If it rejects the default, use the closest valid slug of the same family from its error message.\n",
    "Every spawn is a general-purpose, read-only subagent. Explorers use a fast model, and every explainer uses your strongest judgment model.\n",
  ],
  [
    "inlineSpawnParams",
    "Every spawn is `generalPurpose` with `readonly: false` (agent mode). **Do not use readonly/Ask mode.** It strips MCP access, which disables the MCP-backed investigators and the synthesizer's citation spot-checks. Investigators still shouldn't write anything.\n",
    "Every spawn is a general-purpose subagent that is not read-only. A read-only subagent may lose MCP access, which disables the MCP-backed investigators and the synthesizer's citation spot-checks. Investigators still shouldn't write anything.\n",
  ],
  [
    "inlineSpawnParams",
    "Run Phase A steps 3 and 4 and Phase B of the **arena** skill, with four changes. Read the `interrogate reviewers` line in place of `arena runners`. Copy the scope's uncommitted changes into each worktree. Spawn each adversary as `generalPurpose`. In place of the arena task and rationale, give each adversary the scope, the intent, and this brief:\n",
    "Run Phase A steps 3 and 4 and Phase B of the **arena** skill, with four changes. Run two adversaries, one on your strongest judgment model and one on a model from another family, in place of arena's runners. Copy the scope's uncommitted changes into each worktree. Spawn each adversary as a general-purpose subagent. In place of the arena task and rationale, give each adversary the scope, the intent, and this brief:\n",
  ],
  [
    "modelLines",
    "Spawn one investigator per category that has a matching MCP, all in a single message so they run concurrently, each owning exactly one tool or MCP. Don't ask one agent to cover multiple MCPs. `model`: the `why investigators` line, default `grok-4.7-xhigh-fast`.\n",
    "Spawn one investigator per category that has a matching MCP, all in a single message so they run concurrently, each owning exactly one tool or MCP. Don't ask one agent to cover multiple MCPs. Use a fast model.\n",
  ],
  [
    "modelLines",
    "Spawn one synthesizer. `model`: the `why synthesizer` line, default `claude-opus-5-5-xhigh`. It gets:\n",
    "Spawn one synthesizer. Use your strongest judgment model. It gets:\n",
  ],
  [
    "modelLines",
    "Take the runners from the `architect runners` line in the `pstack-models.mdc` rule, in place of the `arena runners` line. If the rule or that line is missing, use `claude-opus-5-5-xhigh` and `grok-4.7-xhigh-fast`. Alias and rejected entries follow the runner rules in the **arena** skill's Phase A.\n\nDesign it twice.\n",
    "Design it twice.\n",
  ],
  [
    "modelLines",
    "3. Pick the runners. Use the `arena runners` line in `~/.cursor/rules/pstack-models.mdc`. If the rule or that line is missing, default to one each on `claude-opus-5-5-xhigh` and `grok-4.7-xhigh-fast`. An `auto` or `inherit-parent` entry in this line or the cross-judge line means the parent model, so omit `model` for it. If the Task tool rejects a configured entry, run that seat on its family's default and say so. Families go by prefix: `claude-*` and `grok-*`. With no family match, use `claude-opus-5-5-xhigh`. If it rejects a default, use the closest valid slug of the same family from its error message. Spawn more runners when the arena covers multiple design directions. Use the same model N times when the work is generation-bound rather than judgment-sensitive.\n",
    "3. Pick the runners. Default to two, one each on your strongest judgment model and the strongest model of another family. If your harness offers one family, fill both seats with the strongest model you have and say so. Spawn more runners when the arena covers multiple design directions. Use the same model N times when the work is generation-bound rather than judgment-sensitive.\n",
  ],
  [
    "modelLines",
    "After all Phase B candidates complete, choose one model from the `arena cross-judge pool` line in `~/.cursor/rules/pstack-models.mdc`. If the rule or that line is missing, choose from `claude-opus-5-5-xhigh` and `grok-4.7-xhigh-fast`. Spawn one readonly judge subagent. The judge is never from the parent's family, as Phase A step 3 defines families. Try only the entries from another family, in pool order. An `auto` or `inherit-parent` entry is the parent model, so it never judges. With the default pool, a Claude parent gets `grok-4.7-xhigh-fast`. A parent from any other family gets `claude-opus-5-5-xhigh` first. If the Task tool rejects an entry, use a valid slug of the same model at the closest level or speed from the error message, or move to the next entry when there is none. If no entry from another family runs, try the default pool's entries from another family the same way. If none of those runs, skip the judge, pick the base alone in Phase D, and say so. If you do not know the parent's model, try the pool's real slugs in pool order and say that the family check did not run. The judge sees the rubric and the candidates by path label, scores each criterion, and recommends a base with rationale. It runs in parallel with your reading in Phase D. Don't spawn it while candidates are still writing.\n",
    "After all Phase B candidates complete, pick a judge model, preferring a model from another family than yours. Spawn one read-only judge subagent on that model. It sees the rubric and the candidates by path label, scores each criterion, and recommends a base with rationale. It runs in parallel with your reading in Phase D. Don't spawn it while candidates are still writing.\n",
  ],
  [
    "skillCalls",
    "Build a real mental model of every system the new code touches. Run the **how** skill over the relevant subsystems.\n",
    'Build a real mental model of every system the new code touches. Call the Skill tool with "how" and run it over the relevant subsystems.\n',
  ],
  [
    "skillCalls",
    "If the design redefines ownership or layering, also run the **why** skill on the existing shape.\n",
    'If the design redefines ownership or layering, also call the Skill tool with "why" and run it on the existing shape.\n',
  ],
  [
    "skillCalls",
    "1. Re-run the **how** skill over what's been built.\n",
    '1. Call the Skill tool with "how" again and run it over what\'s been built.\n',
  ],
  [
    "skillCalls",
    "- Apply the **unslop** skill to every doc this skill touches.\n",
    '- Call the Skill tool with "unslop" and apply it to every doc this skill touches.\n',
  ],
  [
    "principles",
    "**Balance:** The bar is triviality, not repetition. A one-off still earns a lever when the lever is what makes the work checkable. Per the [Laziness Protocol](../principle-laziness-protocol/SKILL.md), build the smallest script that does or proves the job, never a framework.\n",
    "**Balance:** The bar is triviality, not repetition. A one-off still earns a lever when the lever is what makes the work checkable. Per the [Laziness Protocol](laziness-protocol.md), build the smallest script that does or proves the job, never a framework.\n",
  ],
  [
    "principles",
    "Apply the **type-system-discipline** principle skill first.\n",
    'Apply the **type-system-discipline** principle (call the Skill tool with "principles" and read its reference) first.\n',
  ],
  [
    "principles",
    "- Short call chains. If tracing the flow needs more than three files, flatten the hierarchy, per the **laziness-protocol** and **minimize-reader-load** principle skills.\n",
    '- Short call chains. If tracing the flow needs more than three files, flatten the hierarchy, per the **laziness-protocol** and **minimize-reader-load** principles (call the Skill tool with "principles" and read their references).\n',
  ],
  [
    "issuesFolder",
    "- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file\n",
    "- Implementation issues are one file per ticket at `.issues/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file\n",
  ],
  [
    "issuesFolder",
    "3. A spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.\n",
    "3. A spec file under `docs/`, `specs/`, or `.issues/` matching the branch name or feature.\n",
  ],
  [
    "skillsFolder",
    "the project-local skill whose body has launch/drive sections and a feature map (usually `.cursor/skills/verify-*/`).\n",
    "the project-local skill whose body has launch/drive sections and a feature map (usually `.agents/skills/verify-*/`).\n",
  ],
  [
    "subagentEffort",
    "Not a redo of the work, a scan for what's suboptimal or risky. Pick each subagent's reasoning level and fast or standard speed for the job, per the Subagents section of the **poteto-mode** skill.\n",
    "Not a redo of the work, a scan for what's suboptimal or risky.\n",
  ],
];

describe("applyRules", () => {
  for (const [rule, input, expected] of cases) {
    it(`${rule}: ${input.slice(0, 50)}`, () => {
      const result = applyRules(input);
      assert.strictEqual(result.text, expected);
      assert.deepStrictEqual([...result.used], [rule]);
    });
  }

  it("leaves text no rule matches unchanged and reports no rule used", () => {
    const text = 'Call the Skill tool with "grilling".\n';
    const result = applyRules(text);
    assert.strictEqual(result.text, text);
    assert.strictEqual(result.used.size, 0);
  });
});
