import { assert, describe, it } from "@effect/vitest";

import { applyRules } from "../src/rules.ts";

// Each case is real text from cursor/plugins@ecc249f and the neutral text sync must produce.
const cases: ReadonlyArray<readonly [string, string, string]> = [
  [
    "modelPreamble",
    "Each spawn below names a role line in the `pstack-models.mdc` rule and a default. Set `model` to that line's value, or to the default if the rule or the line is missing. Leave `model` unset when the value is `auto` or `inherit-parent`. If the Task tool rejects a slug, use the default and say so. If it rejects the default, use the closest valid slug of the same family from its error message.\n",
    "Each spawn below names the model it needs by role. Use the closest model your harness offers; when it offers no choice, use its default model.\n",
  ],
  [
    "spawnParams",
    "- `subagent_type`: `generalPurpose`\n- `model`: the `how explorer` line, default `grok-4.7-xhigh-fast`\n- `readonly`: `true`\n",
    "- Subagent: general-purpose\n- Model: a fast model\n- Read-only: yes\n",
  ],
  [
    "spawnParams",
    "- `subagent_type`: `generalPurpose`\n- `model`: the `how explainer` line, default `claude-opus-5-5-max`\n- `readonly`: `true`\n",
    "- Subagent: general-purpose\n- Model: your strongest judgment model\n- Read-only: yes\n",
  ],
  [
    "taskSubagent",
    "Spawn one Task subagent that explores and explains in one pass:\n",
    "Spawn one subagent that explores and explains in one pass:\n",
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
    "Apply the **type-system-discipline** principle from the principles skill first.\n",
  ],
  [
    "principles",
    "- Short call chains. If tracing the flow needs more than three files, flatten the hierarchy, per the **laziness-protocol** and **minimize-reader-load** principle skills.\n",
    "- Short call chains. If tracing the flow needs more than three files, flatten the hierarchy, per the **laziness-protocol** and **minimize-reader-load** principles from the principles skill.\n",
  ],
  [
    "skillsFolder",
    "the project-local skill whose body has launch/drive sections and a feature map (usually `.cursor/skills/verify-*/`).\n",
    "the project-local skill whose body has launch/drive sections and a feature map (usually `.agents/skills/verify-*/`).\n",
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
