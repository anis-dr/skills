import * as BunServices from "@effect/platform-bun/BunServices";
import { assert, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as Context from "effect/Context";

import { check } from "../src/check.ts";
import { SkillTree, SourceEntry } from "../src/SkillTree.ts";

type Files = ReadonlyArray<readonly [string, string]>;

class Root extends Context.Service<Root, string>()("test/Root") {}

const rootLayer = Layer.unwrap(
  Effect.gen(function* () {
    const root =
      yield* (yield* FileSystem.FileSystem).makeTempDirectoryScoped();
    return Layer.merge(Layer.succeed(Root, root), SkillTree.layer(root));
  })
).pipe(Layer.provideMerge(BunServices.layer));

const writeFiles = Effect.fn("writeFiles")(function* (files: Files) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const root = yield* Root;
  for (const [file, content] of files) {
    yield* fs.makeDirectory(path.dirname(path.join(root, file)), {
      recursive: true,
    });
    yield* fs.writeFileString(path.join(root, file), content);
  }
});

// A skill folder under engineering/: SKILL.md from its frontmatter lines and body, plus openai.yaml.
const skill = (
  name: string,
  frontmatter: string,
  body: string,
  openai = 'interface:\n  display_name: "X"\n'
): Files => [
  [`skills/engineering/${name}/SKILL.md`, `---\n${frontmatter}---\n\n${body}`],
  [`skills/engineering/${name}/agents/openai.yaml`, openai],
];

const entry = (bucket: "engineering" | "productivity", name: string) =>
  new SourceEntry({
    bucket,
    commit: "0000000000000000000000000000000000000000",
    mode: "vendor",
    name,
    path: `skills/${bucket}/${name}`,
    source: "https://example.com/upstream.git",
  });

const publicTerms: readonly [string, string] = [
  "upstream/banned-terms.json",
  '[{ "pattern": "subagent_type", "reason": "Cursor Task tool parameter" }]',
];
const privateTerms: readonly [string, string] = [
  "upstream/private-terms.json",
  '[{ "pattern": "Acme Secret", "reason": "private project" }]',
];

const userPolicy =
  'interface:\n  display_name: "X"\npolicy:\n  allow_implicit_invocation: false\n';

const tree: Files = [
  publicTerms,
  privateTerms,
  // Clean: every rule passes.
  ...skill(
    "clean-caller",
    "name: clean-caller\ndescription: Calls others.\n",
    'Call the Skill tool with "clean-target".\n\nCall the Skill tool with `show-me`. If it is missing, ask the user to run npx skills add humanlayer/skills --skill show-me.\n'
  ),
  ...skill(
    "clean-target",
    "name: clean-target\ndescription: Is called.\n",
    "Body.\n"
  ),
  ...skill(
    "clean-user",
    "name: clean-user\ndescription: Typed by a human.\ndisable-model-invocation: true\n",
    "Body.\n",
    userPolicy
  ),
  // One finding each.
  ...skill("bad-yaml", "name: [bad-yaml\ndescription: Broken.\n", "Body.\n"),
  ...skill(
    "wrong-name",
    "name: other-name\ndescription: Named wrong.\n",
    "Body.\n"
  ),
  ...skill("no-description", "name: no-description\n", "Body.\n"),
  ...skill(
    "long-description",
    `name: long-description\ndescription: ${"x".repeat(1025)}\n`,
    "Body.\n"
  ),
  [
    `skills/engineering/no-openai/SKILL.md`,
    "---\nname: no-openai\ndescription: No Codex file.\n---\n\nBody.\n",
  ],
  ...skill(
    "policy-mismatch",
    "name: policy-mismatch\ndescription: Typed.\ndisable-model-invocation: true\n",
    "Body.\n"
  ),
  ...skill(
    "policy-only",
    "name: policy-only\ndescription: Blocked in Codex only.\n",
    "Body.\n",
    userPolicy
  ),
  // Clean, with Windows line endings.
  ...skill(
    "crlf",
    "name: crlf\r\ndescription: Saved on Windows.\r\n",
    "Body.\r\n"
  ).map(([file, content]): readonly [string, string] => [
    file,
    content.replaceAll("---\n", "---\r\n"),
  ]),
  ...skill(
    "unknown-call",
    "name: unknown-call\ndescription: Calls a ghost.\n",
    'Call the Skill tool\nwith "ghost".\n'
  ),
  ...skill(
    "calls-user",
    "name: calls-user\ndescription: Calls a human-only skill.\n",
    'Call the Skill tool twice, for "clean-target" and "clean-user".\n'
  ),
  ...skill(
    "cursor-term",
    "name: cursor-term\ndescription: Harness words.\n",
    "Pass subagent_type: generalPurpose.\n"
  ),
  ...skill(
    "private-term",
    "name: private-term\ndescription: Leaks.\n",
    "Deploy acme secret to prod.\n"
  ),
  ...skill("orphan", "name: orphan\ndescription: No entry.\n", "Body.\n"),
];

const entries = [
  ...[
    "clean-caller",
    "clean-target",
    "clean-user",
    "bad-yaml",
    "wrong-name",
    "no-description",
    "long-description",
    "no-openai",
    "policy-mismatch",
    "policy-only",
    "crlf",
    "unknown-call",
    "calls-user",
    "cursor-term",
    "private-term",
  ].map((name) => entry("engineering", name)),
  entry("productivity", "missing"),
];

layer(rootLayer)("check on a tree with one broken skill per rule", (it) => {
  it.effect(
    "reports exactly one finding per broken skill and none for clean ones",
    () =>
      Effect.gen(function* () {
        yield* writeFiles(tree);

        const findings = yield* check(entries);

        assert.deepStrictEqual(
          findings.map(({ rule, skill }) => [skill, rule]),
          [
            ["engineering/bad-yaml", "frontmatter"],
            ["engineering/calls-user", "skill-call"],
            ["engineering/cursor-term", "banned-term"],
            ["engineering/long-description", "frontmatter"],
            ["engineering/no-description", "frontmatter"],
            ["engineering/no-openai", "invocation"],
            ["engineering/orphan", "orphan-folder"],
            ["engineering/policy-mismatch", "invocation"],
            ["engineering/policy-only", "invocation"],
            ["engineering/private-term", "banned-term"],
            ["engineering/unknown-call", "skill-call"],
            ["engineering/wrong-name", "frontmatter"],
            ["productivity/missing", "missing-folder"],
          ]
        );
      })
  );
});

layer(rootLayer)("check without the private terms file", (it) => {
  it.effect("fails instead of skipping the private names", () =>
    Effect.gen(function* () {
      yield* writeFiles([
        publicTerms,
        ...skill(
          "clean-target",
          "name: clean-target\ndescription: Is called.\n",
          "Body.\n"
        ),
      ]);

      const error = yield* Effect.flip(
        check([entry("engineering", "clean-target")])
      );

      assert.strictEqual(error._tag, "PrivateTermsMissing");
    })
  );
});
