import { assert, describe, it } from "@effect/vitest";

import { applyRules } from "../src/rules.ts";

// Each case is real text from cursor/plugins@56aca54 (subagentEffort: @019a6a2 and @35a9094, interrogate adversaries: @ae5650f) and the neutral text sync must produce.
const cases: ReadonlyArray<readonly [string, string, string]> = [
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
  [
    "subagentEffort",
    "For one or two chats, skip the fan-out and search directly. Pick each subagent's reasoning level for the job, per the Subagents section of the **poteto-mode** skill.\n",
    "For one or two chats, skip the fan-out and search directly.\n",
  ],
  [
    "subagentEffort",
    "Repeat one model when the work is generation-bound. Pick each subagent's reasoning level per the Subagents section of the **poteto-mode** skill.\n",
    "Repeat one model when the work is generation-bound.\n",
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
