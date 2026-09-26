import { Effect, FileSystem, Layer, Path, Schema } from "effect";
import * as Context from "effect/Context";
import type { PlatformError } from "effect/PlatformError";

const Bucket = Schema.Literals([
  "engineering",
  "productivity",
  "design",
  "in-progress",
]);

// An upstream copy that sync writes (CONVENTIONS.md, "Layout and ownership").
export class VendorEntry extends Schema.Class<VendorEntry>("VendorEntry")({
  bucket: Bucket,
  // Full SHA: git fetches a pinned commit only by its full id.
  commit: Schema.String.check(Schema.isPattern(/^[0-9a-f]{40}$/u)),
  // Makes a skill that upstream marks user-invoked model-invoked.
  invocation: Schema.optionalKey(Schema.Literal("model")),
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

// A skill with no upstream; its folder is the source.
export class OursEntry extends Schema.Class<OursEntry>("OursEntry")({
  bucket: Bucket,
  mode: Schema.Literal("ours"),
  name: Schema.String,
}) {
  get skill() {
    return `${this.bucket}/${this.name}`;
  }
}

// One entry of upstream/sources.json.
export type SourceEntry = OursEntry | VendorEntry;

const Sources = Schema.fromJsonString(
  Schema.Array(Schema.Union([VendorEntry, OursEntry]))
);

// A regex (matched case-insensitively) that no file under skills/ may contain.
export class BannedTerm extends Schema.Class<BannedTerm>("BannedTerm")({
  // Skills ("<bucket>/<name>") whose job is to name the term, e.g. a table of harness paths.
  allowIn: Schema.optionalKey(Schema.Array(Schema.String)),
  pattern: Schema.String,
  reason: Schema.String,
}) {}

const BannedTerms = Schema.fromJsonString(Schema.Array(BannedTerm));

export class PrivateTermsMissing extends Schema.TaggedError<PrivateTermsMissing>()(
  "PrivateTermsMissing",
  { path: Schema.String }
) {
  override get message() {
    return `${this.path} is missing. It lists private names and stays out of git; CI writes it from the SKILLS_PRIVATE_TERMS secret.`;
  }
}

export class SkillTree extends Context.Service<
  SkillTree,
  {
    readonly readSources: Effect.Effect<
      ReadonlyArray<SourceEntry>,
      PlatformError | Schema.SchemaError
    >;
    // Replaces the skill's folder with a copy of `from`.
    readonly writeSkill: (
      entry: SourceEntry,
      from: string
    ) => Effect.Effect<void, PlatformError>;
    // Absolute path of a skill folder ("<bucket>/<name>").
    readonly skillDir: (skill: string) => string;
    // Absolute path of upstream/patches/<name>.patch, which may not exist.
    readonly patchPath: (name: string) => string;
    // Every "<bucket>/<name>" folder under skills/, sorted.
    readonly listSkills: Effect.Effect<ReadonlyArray<string>, PlatformError>;
    // Every file of a skill as [path relative to the skill folder, content], sorted by path.
    readonly readSkillFiles: (
      skill: string
    ) => Effect.Effect<ReadonlyArray<readonly [string, string]>, PlatformError>;
    // upstream/banned-terms.json plus the gitignored upstream/private-terms.json.
    readonly readBannedTerms: Effect.Effect<
      ReadonlyArray<BannedTerm>,
      PrivateTermsMissing | PlatformError | Schema.SchemaError
    >;
  }
>()("skills/SkillTree") {
  static readonly layer = (root: string) =>
    Layer.effect(
      SkillTree,
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const skillsDir = path.resolve(root, "skills");

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

        const readSkillFiles = Effect.fn("SkillTree.readSkillFiles")(function* (
          skill: string
        ) {
          const dir = path.join(skillsDir, skill);
          const files: Array<readonly [string, string]> = [];
          for (const file of (yield* fs.readDirectory(dir, {
            recursive: true,
          })).sort()) {
            const info = yield* fs.stat(path.join(dir, file));
            if (info.type === "File") {
              files.push([
                file,
                yield* fs.readFileString(path.join(dir, file)),
              ]);
            }
          }
          return files;
        });

        const readBannedTerms = Effect.gen(function* () {
          const publicTerms = yield* Schema.decodeEffect(BannedTerms)(
            yield* fs.readFileString(
              path.join(root, "upstream", "banned-terms.json")
            )
          );
          const privatePath = path.join(root, "upstream", "private-terms.json");
          if (!(yield* fs.exists(privatePath))) {
            return yield* new PrivateTermsMissing({ path: privatePath });
          }
          const privateTerms = yield* Schema.decodeEffect(BannedTerms)(
            yield* fs.readFileString(privatePath)
          );
          return [...publicTerms, ...privateTerms];
        }).pipe(Effect.withSpan("SkillTree.readBannedTerms"));

        return SkillTree.of({
          listSkills,
          patchPath: (name) =>
            path.resolve(root, "upstream", "patches", `${name}.patch`),
          readBannedTerms,
          readSkillFiles,
          readSources,
          skillDir: (skill) => path.join(skillsDir, skill),
          writeSkill,
        });
      })
    );
}
