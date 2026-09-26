import * as BunServices from "@effect/platform-bun/BunServices";
import { assert, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as Context from "effect/Context";

import {
  OursEntry,
  ReferenceEntry,
  SkillTree,
  VendorEntry,
} from "../src/SkillTree.ts";
import { writePatch, sync } from "../src/sync.ts";
import { git, Upstream } from "../src/Upstream.ts";

type Files = ReadonlyArray<readonly [string, string]>;

const identity = ["-c", "user.name=test", "-c", "user.email=test@example.com"];

const writeFiles = Effect.fn("writeFiles")(function* (
  dir: string,
  files: Files
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  for (const [file, content] of files) {
    yield* fs.makeDirectory(path.dirname(path.join(dir, file)), {
      recursive: true,
    });
    yield* fs.writeFileString(path.join(dir, file), content);
  }
});

const commitFiles = Effect.fn("commitFiles")(function* (
  repo: string,
  files: Files
) {
  yield* writeFiles(repo, files);
  yield* git(repo, ["add", "-A"]);
  yield* git(repo, [...identity, "commit", "-q", "-m", "fixture"]);
  const head = yield* git(repo, ["rev-parse", "HEAD"]);
  return head.trim();
});

const readTree = Effect.fn("readTree")(function* (dir: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const files: Array<readonly [string, string]> = [];
  for (const entry of (yield* fs.readDirectory(dir, {
    recursive: true,
  })).sort()) {
    const info = yield* fs.stat(path.join(dir, entry));
    if (info.type === "File") {
      files.push([entry, yield* fs.readFileString(path.join(dir, entry))]);
    }
  }
  return files;
});

const tddAtA: Files = [
  ["SKILL.md", "---\nname: tdd\ndescription: Test first.\n---\n\nBody at A.\n"],
  ["agents/openai.yaml", 'interface:\n  display_name: "TDD"\n'],
];

const inFolder = (folder: string, files: Files): Files =>
  files.map(([file, content]): readonly [string, string] => [
    `${folder}/${file}`,
    content,
  ]);

// Upstream commit A holds tdd (with Codex metadata) and two user-invoked skills
// without it; commit B then changes tdd, so a sync that ignores the pin shows it.
class Fixture extends Context.Service<
  Fixture,
  {
    readonly arena: VendorEntry;
    readonly how: VendorEntry;
    readonly lever: ReferenceEntry;
    readonly root: string;
    readonly tdd: VendorEntry;
  }
>()("test/Fixture") {}

const fixtureLayer = Layer.unwrap(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const upstream = yield* fs.makeTempDirectoryScoped();
    const root = yield* fs.makeTempDirectoryScoped();
    const cache = yield* fs.makeTempDirectoryScoped();
    yield* git(upstream, ["init", "-q"]);
    const commit = yield* commitFiles(upstream, [
      ...inFolder("skills/engineering/tdd", tddAtA),
      [
        "pstack/skills/how/SKILL.md",
        "---\nname: how\ndescription: Explain code.\ndisable-model-invocation: true\n---\n\nSpawn one Task subagent that explores.\n",
      ],
      [
        "pstack/skills/arena/SKILL.md",
        "---\nname: arena\ndescription: Run candidates.\ndisable-model-invocation: true\n---\n\nBody.\n",
      ],
      [
        "pstack/skills/principle-build-the-lever/SKILL.md",
        "---\nname: principle-build-the-lever\ndescription: Apply to any non-trivial work.\n---\n\n# Build the Lever\n\nPer the [Laziness Protocol](../principle-laziness-protocol/SKILL.md), build the smallest script.\n",
      ],
    ]);
    yield* commitFiles(upstream, [
      [
        "skills/engineering/tdd/SKILL.md",
        "---\nname: tdd\ndescription: Test first.\n---\n\nBody at B.\n",
      ],
      ["skills/engineering/tdd/extra.md", "Added at B.\n"],
    ]);
    const vendor = (name: string, path: string) =>
      new VendorEntry({
        bucket: "engineering",
        commit,
        mode: "vendor",
        name,
        path,
        source: upstream,
      });
    const how = new VendorEntry({
      bucket: "engineering",
      commit,
      invocation: "model",
      mode: "vendor",
      name: "how",
      path: "pstack/skills/how",
      source: upstream,
    });
    return Layer.mergeAll(
      Layer.succeed(
        Fixture,
        Fixture.of({
          arena: vendor("arena", "pstack/skills/arena"),
          how,
          lever: new ReferenceEntry({
            bucket: "engineering",
            commit,
            into: "principles",
            mode: "reference",
            name: "build-the-lever",
            path: "pstack/skills/principle-build-the-lever/SKILL.md",
            source: upstream,
          }),
          root,
          tdd: vendor("tdd", "skills/engineering/tdd"),
        })
      ),
      SkillTree.layer(root),
      Upstream.layer(cache)
    );
  })
).pipe(Layer.provideMerge(BunServices.layer));

layer(fixtureLayer)("sync from an upstream that moved past the pin", (it) => {
  it.effect(
    "replaces the skill folder with the skill at the pinned commit",
    () =>
      Effect.gen(function* () {
        const { root, tdd } = yield* Fixture;
        yield* writeFiles(root, [
          ["skills/engineering/tdd/stale.md", "Dropped upstream.\n"],
        ]);

        yield* sync([tdd]);

        assert.deepStrictEqual(
          yield* readTree(`${root}/skills/engineering/tdd`),
          tddAtA
        );
      })
  );
});

layer(fixtureLayer)("sync with a wrong upstream path", (it) => {
  it.effect("fails and keeps the skill folder", () =>
    Effect.gen(function* () {
      const { root, tdd } = yield* Fixture;
      yield* writeFiles(root, [["skills/engineering/tdd/SKILL.md", "Kept.\n"]]);
      const moved = new VendorEntry({
        bucket: tdd.bucket,
        commit: tdd.commit,
        mode: tdd.mode,
        name: tdd.name,
        path: "skills/engineering/renamed",
        source: tdd.source,
      });

      const error = yield* Effect.flip(sync([moved]));

      assert.strictEqual(error._tag, "MissingUpstreamPath");
      assert.deepStrictEqual(
        yield* readTree(`${root}/skills/engineering/tdd`),
        [["SKILL.md", "Kept.\n"]]
      );
    })
  );
});

layer(fixtureLayer)("sync run twice", (it) => {
  it.effect("leaves git status clean", () =>
    Effect.gen(function* () {
      const { how, root, tdd } = yield* Fixture;
      yield* git(root, ["init", "-q"]);
      yield* sync([tdd, how]);
      yield* git(root, ["add", "-A"]);
      yield* git(root, [...identity, "commit", "-q", "-m", "first sync"]);
      yield* sync([tdd, how]);
      assert.strictEqual(yield* git(root, ["status", "--porcelain"]), "");
    })
  );
});

layer(fixtureLayer)("sync of a skill without Codex metadata", (it) => {
  it.effect(
    "rewrites harness wording, applies the invocation override and writes openai.yaml",
    () =>
      Effect.gen(function* () {
        const { arena, how, root } = yield* Fixture;

        yield* sync([how, arena]);

        assert.deepStrictEqual(
          yield* readTree(`${root}/skills/engineering/how`),
          [
            [
              "SKILL.md",
              "---\nname: how\ndescription: Explain code.\n---\n\nSpawn one subagent that explores.\n",
            ],
            ["agents/openai.yaml", 'interface:\n  display_name: "How"\n'],
          ]
        );
        assert.deepStrictEqual(
          yield* readTree(`${root}/skills/engineering/arena/agents`),
          [
            [
              "openai.yaml",
              'interface:\n  display_name: "Arena"\npolicy:\n  allow_implicit_invocation: false\n',
            ],
          ]
        );
      })
  );
});

layer(fixtureLayer)("a patch made from a hand edit", (it) => {
  it.effect("is reapplied by the next sync", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const { root, tdd } = yield* Fixture;
      yield* sync([tdd]);
      yield* writeFiles(root, [
        [
          "skills/engineering/tdd/SKILL.md",
          "---\nname: tdd\ndescription: Test first.\n---\n\nBody edited here.\n",
        ],
        ["skills/engineering/tdd/notes.md", "Added here.\n"],
      ]);

      yield* writePatch(tdd);
      yield* fs.remove(`${root}/skills/engineering/tdd`, { recursive: true });
      yield* sync([tdd]);

      assert.deepStrictEqual(
        yield* readTree(`${root}/skills/engineering/tdd`),
        [
          [
            "SKILL.md",
            "---\nname: tdd\ndescription: Test first.\n---\n\nBody edited here.\n",
          ],
          ["agents/openai.yaml", 'interface:\n  display_name: "TDD"\n'],
          ["notes.md", "Added here.\n"],
        ]
      );
    })
  );
});

layer(fixtureLayer)("a patch that no longer applies", (it) => {
  it.effect("fails the sync and keeps the skill folder", () =>
    Effect.gen(function* () {
      const { root, tdd } = yield* Fixture;
      yield* writeFiles(root, [
        ["skills/engineering/tdd/SKILL.md", "Kept.\n"],
        [
          "upstream/patches/tdd.patch",
          "--- a/SKILL.md\n+++ b/SKILL.md\n@@ -5 +5 @@\n-Body at Z.\n+Body patched.\n",
        ],
      ]);

      const error = yield* Effect.flip(sync([tdd]));

      assert.strictEqual(error._tag, "PatchConflict");
      assert.deepStrictEqual(
        yield* readTree(`${root}/skills/engineering/tdd`),
        [["SKILL.md", "Kept.\n"]]
      );
    })
  );
});

layer(fixtureLayer)("sync of reference entries", (it) => {
  it.effect(
    "replaces the owner's references/ with the files, frontmatter stripped and rules applied",
    () =>
      Effect.gen(function* () {
        const { lever, root } = yield* Fixture;
        yield* writeFiles(root, [
          ["skills/engineering/principles/SKILL.md", "Our index.\n"],
          ["skills/engineering/principles/references/old.md", "Dropped.\n"],
        ]);

        yield* sync([lever]);

        assert.deepStrictEqual(
          yield* readTree(`${root}/skills/engineering/principles`),
          [
            ["SKILL.md", "Our index.\n"],
            [
              "references/build-the-lever.md",
              "# Build the Lever\n\nPer the [Laziness Protocol](laziness-protocol.md), build the smallest script.\n",
            ],
          ]
        );
      })
  );
});

layer(fixtureLayer)("sync of references next to our own reference", (it) => {
  it.effect("keeps our reference file and still drops stale ones", () =>
    Effect.gen(function* () {
      const { lever, root } = yield* Fixture;
      yield* writeFiles(root, [
        ["skills/engineering/principles/SKILL.md", "Our index.\n"],
        ["skills/engineering/principles/references/one-codec.md", "# Ours\n"],
        ["skills/engineering/principles/references/old.md", "Dropped.\n"],
      ]);
      const ours = new OursEntry({
        bucket: "engineering",
        into: "principles",
        mode: "ours",
        name: "one-codec",
      });

      yield* sync([lever, ours]);

      assert.deepStrictEqual(
        (yield* readTree(`${root}/skills/engineering/principles`)).map(
          ([file]) => file
        ),
        ["SKILL.md", "references/build-the-lever.md", "references/one-codec.md"]
      );
    })
  );
});
