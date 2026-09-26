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
    // Cursor Task tool parameters in spawn blocks.
    name: "spawnParams",
    rewrites: [
      [
        /^- `subagent_type`: `generalPurpose`$/gmu,
        "- Subagent: general-purpose",
      ],
      [
        /^- `model`: the `[^`]+` line, default `claude-opus[^`]*`$/gmu,
        "- Model: your strongest judgment model",
      ],
      [
        /^- `model`: the `[^`]+` line, default `grok-[^`]*-fast`$/gmu,
        "- Model: a fast model",
      ],
      [/^- `readonly`: `true`$/gmu, "- Read-only: yes"],
    ],
  },
  {
    name: "taskSubagent",
    rewrites: [[/\bTask subagent\b/gu, "subagent"]],
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
