import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunServices from "@effect/platform-bun/BunServices";
import { Console, Effect, Layer, Schema } from "effect";
import { Argument, Command } from "effect/unstable/cli";

import { check } from "./check.ts";
import { SkillTree } from "./SkillTree.ts";
import { writePatch, sync } from "./sync.ts";
import { Upstream } from "./Upstream.ts";

class CheckFailed extends Schema.TaggedError<CheckFailed>()("CheckFailed", {
  findings: Schema.Int,
}) {
  override get message() {
    return `${this.findings} findings`;
  }
}

class DeadRules extends Schema.TaggedError<DeadRules>()("DeadRules", {
  rules: Schema.Array(Schema.String),
}) {
  override get message() {
    return `rules that matched no upstream text: ${this.rules.join(", ")}. Delete them from src/rules.ts or fix their patterns.`;
  }
}

class UnknownSkill extends Schema.TaggedError<UnknownSkill>()("UnknownSkill", {
  name: Schema.String,
}) {
  override get message() {
    return `no vendored skill named "${this.name}" in upstream/sources.json`;
  }
}

const syncCommand = Command.make("sync", {}, () =>
  Effect.gen(function* () {
    const entries = yield* (yield* SkillTree).readSources;
    const deadRules = yield* sync(entries);
    yield* Console.log(`synced ${entries.length} skills`);
    if (deadRules.length > 0) {
      return yield* new DeadRules({ rules: deadRules });
    }
  })
).pipe(
  Command.withDescription(
    "Write every vendored skill in upstream/sources.json from its pinned upstream commit"
  )
);

const patchCommand = Command.make(
  "patch",
  { name: Argument.String("name") },
  ({ name }) =>
    Effect.gen(function* () {
      const entries = yield* (yield* SkillTree).readSources;
      const entry = entries.find(
        (each) => each.mode === "vendor" && each.name === name
      );
      if (entry?.mode !== "vendor") {
        return yield* new UnknownSkill({ name });
      }
      if (yield* writePatch(entry)) {
        yield* Console.log(`wrote upstream/patches/${name}.patch`);
      } else {
        yield* Console.log(`${name} matches sync output; no patch`);
      }
    })
).pipe(
  Command.withDescription(
    "Save hand edits to a vendored skill folder as upstream/patches/<name>.patch"
  )
);

const checkCommand = Command.make("check", {}, () =>
  Effect.gen(function* () {
    const findings = yield* check(yield* (yield* SkillTree).readSources);
    for (const finding of findings) {
      yield* Console.log(
        `${finding.skill}: ${finding.rule}: ${finding.detail}`
      );
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
  Command.withSubcommands([syncCommand, checkCommand, patchCommand])
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
