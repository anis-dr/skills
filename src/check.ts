import { Effect } from "effect";

import type { SourceEntry } from "./SkillTree.ts";
import { SkillTree } from "./SkillTree.ts";

export interface Finding {
  readonly rule: "missing-folder" | "orphan-folder";
  // "<bucket>/<name>"
  readonly skill: string;
}

// Findings sorted by skill; the CLI exits 1 when there is any.
export const check = Effect.fn("check")(function* (
  entries: ReadonlyArray<SourceEntry>
) {
  const tree = yield* SkillTree;
  const folders = new Set(yield* tree.listSkills);
  const declared = new Set(entries.map((entry) => entry.skill));
  const findings: Array<Finding> = [
    ...[...folders]
      .filter((skill) => !declared.has(skill))
      .map((skill): Finding => ({ rule: "orphan-folder", skill })),
    ...[...declared]
      .filter((skill) => !folders.has(skill))
      .map((skill): Finding => ({ rule: "missing-folder", skill })),
  ];
  return findings.sort((a, b) => a.skill.localeCompare(b.skill));
});
