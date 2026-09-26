import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunServices from "@effect/platform-bun/BunServices";
import { Console, Effect, Layer, Option, Schema } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";

import { check, loadSkills, summarize } from "./check.ts";
import { findDrift, renderDrift, updatePins } from "./drift.ts";
import { renderSkillList, withSkillList } from "./readme.ts";
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

const syncCommand = Command.make(
  "sync",
  {
    report: Flag.Boolean("report").pipe(
      Flag.withDefault(false),
      Flag.withDescription(
        "Only write upstream/DRIFT.md: upstream commits after each pin that touch the skill"
      )
    ),
    update: Flag.Boolean("update").pipe(
      Flag.withDefault(false),
      Flag.withDescription(
        "Write upstream/DRIFT.md, move drifted vendored skills and references to upstream HEAD, then sync"
      )
    ),
  },
  ({ report, update }) =>
    Effect.gen(function* () {
      const tree = yield* SkillTree;
      let entries = yield* tree.readSources;
      if (report || update) {
        const drift = yield* findDrift(entries);
        yield* tree.writeText("upstream/DRIFT.md", renderDrift(drift));
        yield* Console.log(
          `wrote upstream/DRIFT.md: ${drift.length} entries drifted`
        );
        if (report) {
          return;
        }
        entries = updatePins(entries, drift);
        yield* tree.writeSources(entries);
      }
      const deadRules = yield* sync(entries);
      yield* Console.log(`synced ${entries.length} sources.json entries`);
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
    "Check skill folders, sources.json, invocation, skill calls, banned terms, the router and README.md"
  )
);

const readmeCommand = Command.make("readme", {}, () =>
  Effect.gen(function* () {
    const tree = yield* SkillTree;
    const readme = Option.getOrElse(
      yield* tree.readText("README.md"),
      () => ""
    );
    yield* tree.writeText(
      "README.md",
      withSkillList(readme, renderSkillList(summarize(yield* loadSkills)))
    );
    yield* Console.log("wrote the skill list in README.md");
  })
).pipe(
  Command.withDescription(
    "Regenerate the skill list in README.md from the skill folders"
  )
);

const app = Command.make("skills").pipe(
  Command.withSubcommands([
    syncCommand,
    checkCommand,
    patchCommand,
    readmeCommand,
  ])
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
