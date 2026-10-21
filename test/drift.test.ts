import * as BunServices from "@effect/platform-bun/BunServices";
import { assert, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as Context from "effect/Context";

import {
  findDrift,
  findUntracked,
  renderDrift,
  updatePins,
} from "../src/drift.ts";
import {
  ForkEntry,
  IgnoredEntry,
  SkillTree,
  VendorEntry,
} from "../src/SkillTree.ts";
import { sync } from "../src/sync.ts";
import { git, Upstream } from "../src/Upstream.ts";

type Files = ReadonlyArray<readonly [string, string]>;

const noDiscovery = { stale: [], untracked: [] };

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
        const report = renderDrift(drift, noDiscovery);
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
  "updatePins when a patch no longer applies at HEAD",
  (it) => {
    it.effect(
      "keeps that skill's pin and folder and lists it as a patch conflict",
      () =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const { ask, commits, root, tdd } = yield* Fixture;
          yield* fs.makeDirectory(`${root}/upstream/patches`, {
            recursive: true,
          });
          yield* fs.writeFileString(
            `${root}/upstream/patches/tdd.patch`,
            "--- a/SKILL.md\n+++ b/SKILL.md\n@@ -5 +5 @@\n-Body at A.\n+Body patched.\n"
          );
          yield* fs.makeDirectory(`${root}/skills/engineering/ask`, {
            recursive: true,
          });
          yield* fs.writeFileString(
            `${root}/skills/engineering/ask/SKILL.md`,
            "Our router.\n"
          );
          yield* sync([tdd, ask]);

          const drift = yield* findDrift([tdd, ask]);
          const updated = updatePins([tdd, ask], drift);
          yield* sync(updated);

          const report = renderDrift(drift, noDiscovery);
          assert.strictEqual(
            updated[0]?.mode === "vendor" && updated[0].commit,
            commits.a
          );
          assert.strictEqual(
            yield* fs.readFileString(`${root}/skills/engineering/tdd/SKILL.md`),
            skillMd("tdd", "Body patched.")
          );
          assert.match(
            report,
            /## Patch conflicts: needs a hand fix\n[\s\S]*### tdd \(vendor/u
          );
          assert.notInclude(report, "## Vendored");
        })
    );
  }
);

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
        assert.include(
          renderDrift(drift, noDiscovery),
          "skills/ask, docs/readme.md"
        );
      })
    );
  }
);

// An upstream holding one tracked skill, one untracked skill (with per-skill
// Codex metadata), one ignored skill, one untracked subagent definition and an
// agents/ README with no frontmatter.
const discoveryLayer = Layer.unwrap(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const upstream = yield* fs.makeTempDirectoryScoped();
    const cache = yield* fs.makeTempDirectoryScoped();
    yield* git(upstream, ["init", "-q"]);
    const head = yield* commitFiles(upstream, "add skills and agents", [
      ["skills/tdd/SKILL.md", skillMd("tdd", "Tracked.")],
      [
        "skills/swarm/SKILL.md",
        "---\nname: swarm\ndescription: |-\n  Fans work out to subagents.\n  Second line.\n---\n\nBody.\n",
      ],
      ["skills/swarm/agents/openai.yaml", codex],
      ["skills/setup/SKILL.md", skillMd("setup", "Ignored.")],
      [
        "agents/critic.md",
        "---\nname: critic\ndescription: Reviews comments.\n---\n\nBody.\n",
      ],
      ["agents/README.md", "Our agents.\n"],
    ]);
    const tdd = new VendorEntry({
      bucket: "engineering",
      commit: head,
      mode: "vendor",
      name: "tdd",
      path: "skills/tdd",
      source: upstream,
    });
    const ignored = [
      new IgnoredEntry({
        path: "skills/setup",
        reason: "Setup only",
        source: upstream,
      }),
      new IgnoredEntry({
        path: "skills/gone",
        reason: "Removed upstream since",
        source: upstream,
      }),
    ];
    return Layer.succeed(
      DiscoveryFixture,
      DiscoveryFixture.of({ ignored, source: upstream, tdd })
    ).pipe(Layer.merge(Upstream.layer(cache)));
  })
).pipe(Layer.provideMerge(BunServices.layer));

class DiscoveryFixture extends Context.Service<
  DiscoveryFixture,
  {
    readonly ignored: ReadonlyArray<IgnoredEntry>;
    readonly source: string;
    readonly tdd: VendorEntry;
  }
>()("test/DiscoveryFixture") {}

layer(discoveryLayer)("findUntracked on an upstream with new items", (it) => {
  it.effect(
    "lists the untracked skill and agent and the stale ignore entry, not the tracked, ignored or yaml files",
    () =>
      Effect.gen(function* () {
        const { ignored, source, tdd } = yield* DiscoveryFixture;

        const report = renderDrift([], yield* findUntracked([tdd], ignored));

        assert.strictEqual(
          report.slice(report.indexOf("## Untracked upstream")),
          [
            "## Untracked upstream",
            "",
            "Skills and subagent definitions at upstream HEAD that no `upstream/sources.json` entry tracks. Vendor each one, or list it in `upstream/ignored.json` with a reason.",
            "",
            `### ${source}`,
            "",
            "- `agents/critic.md` (agent): Reviews comments.",
            "- `skills/swarm` (skill): Fans work out to subagents.",
            "",
            "### Stale ignore entries",
            "",
            "These `upstream/ignored.json` entries match nothing upstream; delete them.",
            "",
            `- \`${source}\` \`skills/gone\``,
            "",
          ].join("\n")
        );
        assert.notInclude(report, "openai.yaml");
      })
  );
});
