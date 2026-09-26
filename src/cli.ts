import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunServices from "@effect/platform-bun/BunServices";
import { Console, Effect, Layer, Schema } from "effect";
import { Command } from "effect/unstable/cli";

import { check } from "./check.ts";
import { SkillTree } from "./SkillTree.ts";
import { sync } from "./sync.ts";
import { Upstream } from "./Upstream.ts";

class CheckFailed extends Schema.TaggedError<CheckFailed>()("CheckFailed", {
  findings: Schema.Int,
}) {
  override get message() {
    return `${this.findings} findings`;
  }
}

const syncCommand = Command.make("sync", {}, () =>
  Effect.gen(function* () {
    const entries = yield* (yield* SkillTree).readSources;
    yield* sync(entries);
    yield* Console.log(`synced ${entries.length} skills`);
  })
).pipe(
  Command.withDescription(
    "Write every skill in upstream/sources.json from its pinned upstream commit"
  )
);

const checkCommand = Command.make("check", {}, () =>
  Effect.gen(function* () {
    const findings = yield* check(yield* (yield* SkillTree).readSources);
    for (const finding of findings) {
      yield* Console.log(`${finding.skill}: ${finding.rule}`);
    }
    if (findings.length > 0) {
      return yield* new CheckFailed({ findings: findings.length });
    }
    yield* Console.log("0 findings");
  })
).pipe(
  Command.withDescription(
    "Report skill folders and sources.json entries that disagree"
  )
);

const app = Command.make("skills").pipe(
  Command.withSubcommands([syncCommand, checkCommand])
);

// `bun run skills` runs from the repo root.
const mainLayer = Layer.merge(
  Upstream.layer(".upstream"),
  SkillTree.layer(".")
).pipe(Layer.provideMerge(BunServices.layer));

Command.run(app, { version: "0.0.0" }).pipe(
  Effect.provide(mainLayer),
  BunRuntime.runMain
);
