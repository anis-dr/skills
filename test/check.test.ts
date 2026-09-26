import * as BunServices from "@effect/platform-bun/BunServices";
import { assert, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer } from "effect";
import * as Context from "effect/Context";

import { check } from "../src/check.ts";
import { SkillTree, SourceEntry } from "../src/SkillTree.ts";

class Root extends Context.Service<Root, string>()("test/Root") {}

const rootLayer = Layer.unwrap(
  Effect.gen(function* () {
    const root =
      yield* (yield* FileSystem.FileSystem).makeTempDirectoryScoped();
    return Layer.merge(Layer.succeed(Root, root), SkillTree.layer(root));
  })
).pipe(Layer.provideMerge(BunServices.layer));

const entry = (bucket: "engineering" | "productivity", name: string) =>
  new SourceEntry({
    bucket,
    commit: "0000000000000000000000000000000000000000",
    mode: "vendor",
    name,
    path: `skills/${bucket}/${name}`,
    source: "https://example.com/upstream.git",
  });

layer(rootLayer)("check", (it) => {
  it.effect(
    "reports folders without an entry and entries without a folder",
    () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const root = yield* Root;
        for (const skill of ["engineering/tdd", "engineering/orphan"]) {
          yield* fs.makeDirectory(`${root}/skills/${skill}`, {
            recursive: true,
          });
          yield* fs.writeFileString(
            `${root}/skills/${skill}/SKILL.md`,
            "---\nname: x\n---\n"
          );
        }
        yield* fs.writeFileString(
          `${root}/skills/engineering/README.md`,
          "Bucket readme.\n"
        );

        const findings = yield* check([
          entry("engineering", "tdd"),
          entry("productivity", "missing"),
        ]);

        assert.deepStrictEqual(findings, [
          { rule: "orphan-folder", skill: "engineering/orphan" },
          { rule: "missing-folder", skill: "productivity/missing" },
        ]);
      })
  );
});
