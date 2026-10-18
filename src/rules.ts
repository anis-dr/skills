// Ordered rewrites that make vendored text agent-neutral. Each rule must still
// match some current upstream text: sync fails on a rule that matched nothing.
interface Rule {
  readonly name: string;
  readonly rewrites: ReadonlyArray<readonly [RegExp, string]>;
}

const rules: ReadonlyArray<Rule> = [
  {
    // pstack's per-role model config file and its fallback instructions.
    name: "modelPreamble",
    rewrites: [
      [
        /Each spawn below names a role line in the `pstack-models\.mdc` rule and a default\.[^\n]*/gu,
        "Each spawn below names the model it needs by role. Use the closest model your harness offers; when it offers no choice, use its default model.",
      ],
    ],
  },
  {
    // pstack's Task tool parameters (`subagent_type`, `readonly`) written inline.
    name: "inlineSpawnParams",
    rewrites: [
      [
        /Every spawn is a Task subagent with `subagent_type: generalPurpose` and `readonly: true`\. Explorers use the `[^`]+` line in the `pstack-models\.mdc` rule \(default `grok-[^`]+`\), and every explainer uses the `[^`]+` line \(default `claude-[^`]+`\)\.[^\n]*/gu,
        "Every spawn is a general-purpose, read-only subagent. Explorers use a fast model, and every explainer uses your strongest judgment model.",
      ],
      [
        /Every spawn is `generalPurpose` with `readonly: false` \(agent mode\)\. \*\*Do not use readonly\/Ask mode\.\*\* It strips MCP access,/gu,
        "Every spawn is a general-purpose subagent that is not read-only. A read-only subagent may lose MCP access,",
      ],
      [
        /Each reviewer gets `subagent_type: generalPurpose`, `readonly: true`, and `model` set to[^\n]*/gu,
        "Each reviewer is a general-purpose, read-only subagent on the model in its table row.",
      ],
    ],
  },
  {
    // pstack's per-role model lines (`pstack-models.mdc`, `~/.cursor/rules/`) and the model ids hard-coded as their defaults.
    name: "modelLines",
    rewrites: [
      [
        /`model`: the `[^`]+` line, default `grok-[^`]+`\./gu,
        "Use a fast model.",
      ],
      [
        /`model`: the `[^`]+` line, default `claude-[^`]+`\./gu,
        "Use your strongest judgment model.",
      ],
      [/^Take the runners from the `architect runners` line[^\n]*\n\n/gmu, ""],
      [
        /Use the `arena runners` line in `~\/\.cursor\/rules\/pstack-models\.mdc`\..*?(?= Spawn more runners)/gu,
        "Default to two, one each on your strongest judgment model and the strongest model of another family. If your harness offers one family, fill both seats with the strongest model you have and say so.",
      ],
      [
        /choose one model from the `arena cross-judge pool` line in `~\/\.cursor\/rules\/pstack-models\.mdc`\. If the rule or that line is missing, choose from `claude-[^`]+` and `grok-[^`]+`\. Prefer a different model family from the parent's\. Spawn one readonly judge/gu,
        "pick a judge model, preferring a model from another family than yours. Spawn one read-only judge",
      ],
      [
        / with the Task tool, one per entry on the `interrogate reviewers` line in `~\/\.cursor\/rules\/pstack-models\.mdc`, labeled Reviewer A, B, and so on to match the entry count\. If the rule or that line is missing, use the table defaults\./gu,
        ", each as its own subagent, one per row of the table below, labeled Reviewer A, B, and so on.",
      ],
      [
        /\| Subagent \| Default model \|\n\|-+\|-+\|\n\| Reviewer A \| `claude-[^`]+` \|\n\| Reviewer B \| `grok-[^`]+` \|/gu,
        "| Subagent | Model |\n|----------|-------|\n| Reviewer A | your strongest judgment model |\n| Reviewer B | a model from another family |",
      ],
      [
        /^If the Task tool rejects a configured entry, run that reviewer[^\n]*\n\n/gmu,
        "",
      ],
    ],
  },
  {
    // pstack's per-spawn reasoning level and fast/standard speed, a Cursor-only
    // setting described in poteto-mode, which is not vendored here.
    name: "subagentEffort",
    rewrites: [
      [
        / Pick each subagent's reasoning level and fast or standard speed for the job, per the Subagents section(?: of the \*\*poteto-mode\*\* skill)?\./gu,
        "",
      ],
    ],
  },
  {
    // Operative "Run the **x** skill" becomes a Skill tool call (CONVENTIONS.md).
    name: "skillCalls",
    rewrites: [
      [
        /\bRe-run the \*\*([\w-]+)\*\* skill\b/gu,
        'Call the Skill tool with "$1" again and run it',
      ],
      [
        /\bRun the \*\*([\w-]+)\*\* skill\b/gu,
        'Call the Skill tool with "$1" and run it',
      ],
      [
        /\brun the \*\*([\w-]+)\*\* skill\b/gu,
        'call the Skill tool with "$1" and run it',
      ],
      [
        /\bApply the \*\*([\w-]+)\*\* skill\b/gu,
        'Call the Skill tool with "$1" and apply it',
      ],
    ],
  },
  {
    // pstack's principle skills are reference files in the principles skill here.
    name: "principles",
    rewrites: [
      [/\]\(\.\.\/principle-([\w-]+)\/SKILL\.md\)/gu, "]($1.md)"],
      [
        /(\*\*[\w-]+\*\*) principle skills\b/gu,
        '$1 principles (call the Skill tool with "principles" and read their references)',
      ],
      [
        /(\*\*[\w-]+\*\*) principle skill\b/gu,
        '$1 principle (call the Skill tool with "principles" and read its reference)',
      ],
    ],
  },
  {
    // Matt Pocock's local-markdown issue tracker folder. `.scratch/` would read as
    // temporary files, which live in `.scratchpad/` here (the scratchpad skill).
    name: "issuesFolder",
    rewrites: [[/\.scratch\//gu, ".issues/"]],
  },
  {
    // Cursor's project and user skill folders; `.agents/skills/` is the shared one.
    name: "skillsFolder",
    rewrites: [[/\.cursor\/skills\//gu, ".agents/skills/"]],
  },
];

export const ruleNames = rules.map((rule) => rule.name);

// Returns the rewritten text and the names of the rules that changed it.
export const applyRules = (text: string) => {
  const used = new Set<string>();
  let result = text;
  for (const rule of rules) {
    for (const [pattern, replacement] of rule.rewrites) {
      const next = result.replace(pattern, replacement);
      if (next !== result) {
        used.add(rule.name);
        result = next;
      }
    }
  }
  return { text: result, used };
};
