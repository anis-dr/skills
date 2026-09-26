import { Option } from "effect";

// The skill list in README.md, generated from the skill folders between two markers.

export interface SkillSummary {
  readonly bucket: string;
  readonly name: string;
  readonly summary: string;
  readonly userInvoked: boolean;
}

const buckets: ReadonlyArray<readonly [string, string]> = [
  ["engineering", "Engineering"],
  ["productivity", "Productivity"],
  ["design", "Design"],
  ["in-progress", "In progress (beta)"],
];

const start = "<!-- skills:start -->";
const end = "<!-- skills:end -->";

const list = (skills: ReadonlyArray<SkillSummary>) =>
  [...skills]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (each) =>
        `- [${each.name}](skills/${each.bucket}/${each.name}/SKILL.md): ${each.summary}`
    );

// Per bucket, user-invoked skills first, then model-invoked (Matt Pocock's README layout).
export const renderSkillList = (skills: ReadonlyArray<SkillSummary>) => {
  const lines: Array<string> = [];
  for (const [bucket, title] of buckets) {
    const inBucket = skills.filter((each) => each.bucket === bucket);
    if (inBucket.length > 0) {
      lines.push(`### ${title}`, "");
      const user = inBucket.filter((each) => each.userInvoked);
      const model = inBucket.filter((each) => !each.userInvoked);
      if (user.length > 0) {
        lines.push("**User-invoked**", "", ...list(user), "");
      }
      if (model.length > 0) {
        lines.push("**Model-invoked**", "", ...list(model), "");
      }
    }
  }
  return `${lines.join("\n")}\n`;
};

// The text between the markers; none when README.md has no markers.
export const skillListOf = (readme: string) => {
  const from = readme.indexOf(`${start}\n`);
  const to = readme.indexOf(end);
  if (from === -1 || to < from) {
    return Option.none<string>();
  }
  return Option.some(readme.slice(from + start.length + 1, to));
};

export const withSkillList = (readme: string, skillList: string) =>
  Option.match(skillListOf(readme), {
    onNone: () =>
      `${readme.trimEnd()}\n\n## Skills\n\n${start}\n${skillList}${end}\n`,
    onSome: (current) =>
      readme.replace(
        `${start}\n${current}${end}`,
        `${start}\n${skillList}${end}`
      ),
  });
