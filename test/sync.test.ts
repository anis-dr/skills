import * as BunServices from "@effect/platform-bun/BunServices";
import { assert, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as Context from "effect/Context";

import { SkillTree, SourceEntry } from "../src/SkillTree.ts";
import { sync } from "../src/sync.ts";
import { git, Upstream } from "../src/Upstream.ts";

type Files = ReadonlyArray<readonly [string, string]>;

const identity = ["-c", "user.name=test", "-c", "user.email=test@example.com"];

const commitFiles = Effect.fn("commitFiles")(function* (
  repo: string,
  files: Files
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  for (const [file, content] of files) {
    yield* fs.makeDirectory(path.dirname(path.join(repo, file)), {
      recursive: true,
    });
    yield* fs.writeFileString(path.join(repo, file), content);
  }
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

const skillAtA: Files = [
  ["SKILL.md", "---\nname: tdd\ndescription: Test first.\n---\n\nBody at A.\n"],
  ["agents/openai.yaml", 'interface:\n  display_name: "TDD"\n'],
];

// A temp repo root and an upstream whose tdd skill changed after the pinned commit A.
class Fixture extends Context.Service<
  Fixture,
  { readonly entry: SourceEntry; readonly root: string }
>()("test/Fixture") {}

const fixtureLayer = Layer.unwrap(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const upstream = yield* fs.makeTempDirectoryScoped();
    const root = yield* fs.makeTempDirectoryScoped();
    const cache = yield* fs.makeTempDirectoryScoped();
    yield* git(upstream, ["init", "-q"]);
    const commitA = yield* commitFiles(
      upstream,
      skillAtA.map(([file, content]): readonly [string, string] => [
        `skills/engineering/tdd/${file}`,
        content,
      ])
    );
    yield* commitFiles(upstream, [
      [
        "skills/engineering/tdd/SKILL.md",
        "---\nname: tdd\ndescription: Test first.\n---\n\nBody at B.\n",
      ],
      ["skills/engineering/tdd/extra.md", "Added at B.\n"],
    ]);
    const entry = new SourceEntry({
      bucket: "engineering",
      commit: commitA,
      mode: "vendor",
      name: "tdd",
      path: "skills/engineering/tdd",
      source: upstream,
    });
    return Layer.mergeAll(
      Layer.succeed(Fixture, Fixture.of({ entry, root })),
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
        const fs = yield* FileSystem.FileSystem;
        const { entry, root } = yield* Fixture;
        yield* fs.makeDirectory(`${root}/skills/engineering/tdd`, {
          recursive: true,
        });
        yield* fs.writeFileString(
          `${root}/skills/engineering/tdd/stale.md`,
          "Dropped upstream.\n"
        );

        yield* sync([entry]);

        assert.deepStrictEqual(
          yield* readTree(`${root}/skills/engineering/tdd`),
          skillAtA
        );
      })
  );
});

layer(fixtureLayer)("sync with a wrong upstream path", (it) => {
  it.effect("fails and keeps the skill folder", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const { entry, root } = yield* Fixture;
      yield* fs.makeDirectory(`${root}/skills/engineering/tdd`, {
        recursive: true,
      });
      yield* fs.writeFileString(
        `${root}/skills/engineering/tdd/SKILL.md`,
        "Kept.\n"
      );
      const moved = new SourceEntry({
        ...entry,
        path: "skills/engineering/renamed",
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
      const { entry, root } = yield* Fixture;
      yield* git(root, ["init", "-q"]);
      yield* sync([entry]);
      yield* git(root, ["add", "-A"]);
      yield* git(root, [...identity, "commit", "-q", "-m", "first sync"]);
      yield* sync([entry]);
      assert.strictEqual(yield* git(root, ["status", "--porcelain"]), "");
    })
  );
});
