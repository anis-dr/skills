import { Effect, Result, Schema } from "effect";
import { parse } from "yaml";

import type { BannedTerm, SourceEntry } from "./SkillTree.ts";
import { SkillTree } from "./SkillTree.ts";

type Files = ReadonlyArray<readonly [string, string]>;

export interface Finding {
  readonly detail: string;
  readonly rule:
    | "banned-term"
    | "frontmatter"
    | "invocation"
    | "missing-folder"
    | "orphan-folder"
    | "skill-call";
  // "<bucket>/<name>"
  readonly skill: string;
}

const Frontmatter = Schema.Struct({
  description: Schema.String.check(Schema.isMaxLength(1024)),
  "disable-model-invocation": Schema.optionalKey(Schema.Boolean),
  name: Schema.String,
});

const CodexMetadata = Schema.Struct({
  policy: Schema.optionalKey(
    Schema.Struct({
      allow_implicit_invocation: Schema.optionalKey(Schema.Boolean),
    })
  ),
});

// Parses YAML text and decodes it with `schema`; failures become a readable message.
const decodeYaml = <T>(schema: Schema.ConstraintDecoder<T>, text: string) =>
  Result.try({ catch: String, try: () => parse(text) }).pipe(
    Result.flatMap((value) =>
      Result.mapError(
        Schema.decodeUnknownResult(schema)(value),
        (error) => error.message
      )
    )
  );

// `Call the Skill tool with "x"` or `Call the Skill tool twice, for "x" and "y"`, quoted or in backticks.
const skillCall =
  /call(?:s|ing)?\s+the\s+skill\s+tool\s+(?:with|twice,\s+for)\s+["`]([\w-]+)["`](?:,?\s+and\s+["`]([\w-]+)["`])?/giu;

interface LoadedSkill {
  readonly files: Files;
  readonly frontmatter: Result.Result<typeof Frontmatter.Type, string>;
  // Folder name, which is also the name the Skill tool takes.
  readonly name: string;
  readonly skill: string;
}

const finding = (
  rule: Finding["rule"],
  skill: string,
  detail: string
): Finding => ({ detail, rule, skill });

function readFrontmatter(
  files: Files
): Result.Result<typeof Frontmatter.Type, string> {
  const skillMd = files.find(([file]) => file === "SKILL.md")?.[1] ?? "";
  const block = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(skillMd)?.[1];
  if (block === undefined) {
    return Result.fail("SKILL.md has no frontmatter block");
  }
  return decodeYaml(Frontmatter, block);
}

function sourcesFindings(
  entries: ReadonlyArray<SourceEntry>,
  folders: ReadonlyArray<string>
): Array<Finding> {
  const declared = new Set(entries.map((entry) => entry.skill));
  const present = new Set(folders);
  return [
    ...folders
      .filter((skill) => !declared.has(skill))
      .map((skill) =>
        finding("orphan-folder", skill, "no entry in upstream/sources.json")
      ),
    ...[...declared]
      .filter((skill) => !present.has(skill))
      .map((skill) =>
        finding("missing-folder", skill, "sources.json entry has no folder")
      ),
  ];
}

function frontmatterFindings({
  frontmatter,
  name,
  skill,
}: LoadedSkill): Array<Finding> {
  if (Result.isFailure(frontmatter)) {
    return [finding("frontmatter", skill, frontmatter.failure)];
  }
  if (frontmatter.success.name !== name) {
    return [
      finding(
        "frontmatter",
        skill,
        `name "${frontmatter.success.name}" differs from the folder name`
      ),
    ];
  }
  return [];
}

function invocationFindings({
  files,
  frontmatter,
  skill,
}: LoadedSkill): Array<Finding> {
  if (Result.isFailure(frontmatter)) {
    return [];
  }
  const codex = files.find(([file]) => file === "agents/openai.yaml")?.[1];
  if (codex === undefined) {
    return [finding("invocation", skill, "agents/openai.yaml is missing")];
  }
  const metadata = decodeYaml(CodexMetadata, codex);
  if (Result.isFailure(metadata)) {
    return [
      finding("invocation", skill, `agents/openai.yaml: ${metadata.failure}`),
    ];
  }
  const userOnly = frontmatter.success["disable-model-invocation"] === true;
  const implicitOff =
    metadata.success.policy?.allow_implicit_invocation === false;
  if (userOnly && !implicitOff) {
    return [
      finding(
        "invocation",
        skill,
        "disable-model-invocation is true but agents/openai.yaml allows implicit invocation"
      ),
    ];
  }
  if (!userOnly && implicitOff) {
    return [
      finding(
        "invocation",
        skill,
        "agents/openai.yaml blocks implicit invocation but disable-model-invocation is not true"
      ),
    ];
  }
  return [];
}

// A call resolves to a model-invoked repo skill, or to an outside skill whose
// install command (`--skill <name>`) appears in the calling skill.
function skillCallFindings(
  { files, skill }: LoadedSkill,
  repoSkills: ReadonlySet<string>,
  userInvoked: ReadonlySet<string>
): Array<Finding> {
  const text = files.map(([, content]) => content).join("\n");
  const findings: Array<Finding> = [];
  for (const [file, content] of files) {
    for (const match of content.matchAll(skillCall)) {
      for (const target of match.slice(1)) {
        if (target === undefined) {
          continue;
        }
        const installable = new RegExp(
          `--skill[ =]${target}(?![\\w-])`,
          "u"
        ).test(text);
        if (userInvoked.has(target)) {
          findings.push(
            finding(
              "skill-call",
              skill,
              `${file} calls user-invoked "${target}"`
            )
          );
        } else if (!(repoSkills.has(target) || installable)) {
          findings.push(
            finding(
              "skill-call",
              skill,
              `${file} calls "${target}", which is not in this repo and has no install command`
            )
          );
        }
      }
    }
  }
  return findings;
}

function bannedTermFindings(
  { files, skill }: LoadedSkill,
  terms: ReadonlyArray<BannedTerm>
): Array<Finding> {
  return files.flatMap(([file, content]) =>
    terms
      .filter((term) => new RegExp(term.pattern, "iu").test(content))
      .map((term) =>
        finding(
          "banned-term",
          skill,
          `${file}: ${term.reason} (${term.pattern})`
        )
      )
  );
}

// Findings sorted by skill, then rule; the CLI exits 1 when there is any.
export const check = Effect.fn("check")(function* (
  entries: ReadonlyArray<SourceEntry>
) {
  const tree = yield* SkillTree;
  const folders = yield* tree.listSkills;
  const terms = yield* tree.readBannedTerms;
  const skills = yield* Effect.forEach(folders, (skill) =>
    Effect.map(tree.readSkillFiles(skill), (files): LoadedSkill => ({
      files,
      frontmatter: readFrontmatter(files),
      name: skill.slice(skill.indexOf("/") + 1),
      skill,
    }))
  );
  const repoSkills = new Set(skills.map((each) => each.name));
  const userInvoked = new Set(
    skills
      .filter(
        (each) =>
          Result.isSuccess(each.frontmatter) &&
          each.frontmatter.success["disable-model-invocation"] === true
      )
      .map((each) => each.name)
  );
  const findings = [
    ...sourcesFindings(entries, folders),
    ...skills.flatMap((each) => [
      ...frontmatterFindings(each),
      ...invocationFindings(each),
      ...skillCallFindings(each, repoSkills, userInvoked),
      ...bannedTermFindings(each, terms),
    ]),
  ];
  return findings.sort(
    (a, b) =>
      a.skill.localeCompare(b.skill) ||
      a.rule.localeCompare(b.rule) ||
      a.detail.localeCompare(b.detail)
  );
});
