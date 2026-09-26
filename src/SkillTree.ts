import { Effect, FileSystem, Layer, Path, Schema } from "effect";
import * as Context from "effect/Context";
import type { PlatformError } from "effect/PlatformError";

// One entry of upstream/sources.json: where a skill comes from and where it lives here.
export class SourceEntry extends Schema.Class<SourceEntry>("SourceEntry")({
  bucket: Schema.Literals([
    "engineering",
    "productivity",
    "design",
    "in-progress",
  ]),
  // Full SHA: git fetches a pinned commit only by its full id.
  commit: Schema.String.check(Schema.isPattern(/^[0-9a-f]{40}$/u)),
  mode: Schema.Literal("vendor"),
  name: Schema.String,
  // Folder inside the upstream repo.
  path: Schema.String,
  // Git remote URL or local path.
  source: Schema.String,
}) {
  // "<bucket>/<name>", the skill's folder under skills/.
  get skill() {
    return `${this.bucket}/${this.name}`;
  }
}

export class MissingUpstreamPath extends Schema.TaggedError<MissingUpstreamPath>()(
  "MissingUpstreamPath",
  { from: Schema.String, skill: Schema.String }
) {
  override get message() {
    return `${this.skill}: upstream has no folder at ${this.from}`;
  }
}

const Sources = Schema.fromJsonString(Schema.Array(SourceEntry));

export class SkillTree extends Context.Service<
  SkillTree,
  {
    readonly readSources: Effect.Effect<
      ReadonlyArray<SourceEntry>,
      PlatformError | Schema.SchemaError
    >;
    // Replaces the skill's folder with a copy of `from`, keeping it when `from` is missing.
    readonly writeSkill: (
      entry: SourceEntry,
      from: string
    ) => Effect.Effect<void, MissingUpstreamPath | PlatformError>;
    // Every "<bucket>/<name>" folder under skills/, sorted.
    readonly listSkills: Effect.Effect<ReadonlyArray<string>, PlatformError>;
  }
>()("skills/SkillTree") {
  static readonly layer = (root: string) =>
    Layer.effect(
      SkillTree,
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const skillsDir = path.join(root, "skills");

        const readSources = Effect.gen(function* () {
          const text = yield* fs.readFileString(
            path.join(root, "upstream", "sources.json")
          );
          return yield* Schema.decodeEffect(Sources)(text);
        }).pipe(Effect.withSpan("SkillTree.readSources"));

        const writeSkill = Effect.fn("SkillTree.writeSkill")(function* (
          entry: SourceEntry,
          from: string
        ) {
          const dest = path.join(skillsDir, entry.skill);
          if (!(yield* fs.exists(from))) {
            return yield* new MissingUpstreamPath({ from, skill: entry.skill });
          }
          yield* fs.remove(dest, { force: true, recursive: true });
          yield* fs.makeDirectory(path.dirname(dest), { recursive: true });
          yield* fs.copy(from, dest);
        });

        const subfolders = Effect.fn("SkillTree.subfolders")(function* (
          dir: string
        ) {
          const names = yield* fs.readDirectory(dir);
          const folders: Array<string> = [];
          for (const name of names) {
            const info = yield* fs.stat(path.join(dir, name));
            if (info.type === "Directory") {
              folders.push(name);
            }
          }
          return folders;
        });

        const listSkills = Effect.gen(function* () {
          if (!(yield* fs.exists(skillsDir))) {
            return [];
          }
          const skills: Array<string> = [];
          for (const bucket of yield* subfolders(skillsDir)) {
            for (const name of yield* subfolders(
              path.join(skillsDir, bucket)
            )) {
              skills.push(`${bucket}/${name}`);
            }
          }
          return skills.sort();
        }).pipe(Effect.withSpan("SkillTree.listSkills"));

        return SkillTree.of({ listSkills, readSources, writeSkill });
      })
    );
}
