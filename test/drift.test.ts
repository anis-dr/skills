import * as BunServices from "@effect/platform-bun/BunServices";
import { assert, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as Context from "effect/Context";

import { findDrift, renderDrift, updatePins } from "../src/drift.ts";
import { ForkEntry, SkillTree, VendorEntry } from "../src/SkillTree.ts";
import { sync } from "../src/sync.ts";
import { git, Upstream } from "../src/Upstream.ts";

type Files = ReadonlyArray<readonly [string, string]>;

const identity = ["-c", "user.name=test", "-c", "user.email=test@example.com"];

const commitFiles = Effect.fn("commitFiles")(function* (
  repo: string,
  message: string,
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
  yield* git(repo, [...identity, "commit", "-q", "-m", message]);
  const head = yield* git(repo, ["rev-parse", "HEAD"]);
  return head.trim();
});

const skillMd = (name: string, body: string) =>
  `---\nname: ${name}\ndescription: Does ${name}.\n---\n\n${body}\n`;

const codex = 'interface:\n  display_name: "X"\n';

// Upstream history: A adds tdd and ask; B changes both; C changes an unrelated folder.
class Fixture extends Context.Service<
  Fixture,
  {
    readonly ask: ForkEntry;
    readonly commits: {
      readonly a: string;
      readonly b: string;
      readonly c: string;
    };
    readonly root: string;
    readonly tdd: VendorEntry;
  }
>()("test/DriftFixture") {}

const fixtureLayer = Layer.unwrap(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const upstream = yield* fs.makeTempDirectoryScoped();
    const root = yield* fs.makeTempDirectoryScoped();
    const cache = yield* fs.makeTempDirectoryScoped();
    yield* git(upstream, ["init", "-q"]);
    const a = yield* commitFiles(upstream, "add skills", [
      ["skills/tdd/SKILL.md", skillMd("tdd", "Body at A.")],
      ["skills/tdd/agents/openai.yaml", codex],
      ["skills/ask/SKILL.md", skillMd("ask", "Router at A.")],
    ]);
    const b = yield* commitFiles(upstream, "sharpen tdd and ask", [
      ["skills/tdd/SKILL.md", skillMd("tdd", "Body at B.")],
      ["skills/ask/SKILL.md", skillMd("ask", "Router at B.")],
    ]);
    const c = yield* commitFiles(upstream, "unrelated", [
      ["docs/readme.md", "Docs.\n"],
    ]);
    const tdd = new VendorEntry({
      bucket: "engineering",
      commit: a,
      mode: "vendor",
      name: "tdd",
      path: "skills/tdd",
      source: upstream,
    });
    const ask = new ForkEntry({
      bucket: "engineering",
      commit: a,
      mode: "fork",
      name: "ask",
      path: "skills/ask",
      source: upstream,
    });
    return Layer.mergeAll(
      Layer.succeed(
        Fixture,
        Fixture.of({ ask, commits: { a, b, c }, root, tdd })
      ),
      SkillTree.layer(root),
      Upstream.layer(cache)
    );
  })
).pipe(Layer.provideMerge(BunServices.layer));

layer(fixtureLayer)("findDrift on an upstream that moved from A to C", (it) => {
  it.effect(
    "lists exactly the commits after the pin that touch each entry's path",
    () =>
      Effect.gen(function* () {
        const { ask, commits, tdd } = yield* Fixture;

        const drift = yield* findDrift([tdd, ask]);

        assert.deepStrictEqual(
          drift.map((each) => [
            each.entry.name,
            each.head,
            each.commits.map(([sha, subject]) => [sha, subject]),
          ]),
          [
            ["tdd", commits.c, [[commits.b, "sharpen tdd and ask"]]],
            ["ask", commits.c, [[commits.b, "sharpen tdd and ask"]]],
          ]
        );
        const report = renderDrift(drift);
        assert.include(report, commits.b.slice(0, 7));
        assert.notInclude(report, commits.c.slice(0, 7) + " unrelated");
      })
  );
});

layer(fixtureLayer)("updatePins then sync", (it) => {
  it.effect(
    "moves vendored skills to upstream HEAD and leaves forks alone",
    () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const { ask, commits, root, tdd } = yield* Fixture;
        yield* fs.makeDirectory(`${root}/skills/engineering/ask`, {
          recursive: true,
        });
        yield* fs.writeFileString(
          `${root}/skills/engineering/ask/SKILL.md`,
          "Our router.\n"
        );
        yield* sync([tdd, ask]);

        const updated = updatePins([tdd, ask], yield* findDrift([tdd, ask]));
        yield* sync(updated);

        const pins: Array<readonly [string, string]> = [];
        for (const each of updated) {
          if (each.mode !== "ours") {
            pins.push([each.name, each.commit]);
          }
        }
        assert.deepStrictEqual(pins, [
          ["tdd", commits.c],
          ["ask", commits.a],
        ]);
        assert.strictEqual(
          yield* fs.readFileString(`${root}/skills/engineering/tdd/SKILL.md`),
          skillMd("tdd", "Body at B.")
        );
        assert.strictEqual(
          yield* fs.readFileString(`${root}/skills/engineering/ask/SKILL.md`),
          "Our router.\n"
        );
      })
  );
});

layer(fixtureLayer)(
  "findDrift on a fork built from several upstream paths",
  (it) => {
    it.effect("lists commits that touch any of the paths", () =>
      Effect.gen(function* () {
        const { ask, commits } = yield* Fixture;
        const multi = new ForkEntry({
          bucket: ask.bucket,
          commit: ask.commit,
          mode: "fork",
          name: "ask-plus-docs",
          path: ["skills/ask", "docs/readme.md"],
          source: ask.source,
        });

        const drift = yield* findDrift([multi]);

        assert.deepStrictEqual(
          drift.map((each) => each.commits.map(([sha]) => sha)),
          [[commits.c, commits.b]]
        );
        assert.include(renderDrift(drift), "skills/ask, docs/readme.md");
      })
    );
  }
);
