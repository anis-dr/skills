import { Effect, FileSystem, Layer, Option, Path, Schema } from "effect";
import * as Context from "effect/Context";
import type { PlatformError } from "effect/PlatformError";

const Bucket = Schema.Literals([
  "engineering",
  "productivity",
  "design",
  "in-progress",
]);

const Commit = Schema.String.check(Schema.isPattern(/^[0-9a-f]{40}$/u));

// Field order is the key order `writeSources` writes to upstream/sources.json.

// An upstream copy that sync writes (CONVENTIONS.md, "Layout and ownership").
export class VendorEntry extends Schema.Class<VendorEntry>("VendorEntry")({
  name: Schema.String,
  bucket: Bucket,
  mode: Schema.Literal("vendor"),
  // Makes a skill that upstream marks user-invoked model-invoked.
  invocation: Schema.optional(Schema.Literal("model")),
  // Git remote URL or local path.
  source: Schema.String,
  // Folder inside the upstream repo.
  path: Schema.String,
  // Full SHA: git fetches a pinned commit only by its full id.
  commit: Commit,
}) {
  // "<bucket>/<name>", the skill's folder under skills/.
  get skill() {
    return `${this.bucket}/${this.name}`;
  }

  withCommit(commit: string) {
    return new VendorEntry({
      bucket: this.bucket,
      commit,
      invocation: this.invocation,
      mode: this.mode,
      name: this.name,
      path: this.path,
      source: this.source,
    });
  }
}

// A skill with no upstream; its folder is the source.
export class OursEntry extends Schema.Class<OursEntry>("OursEntry")({
  name: Schema.String,
  bucket: Bucket,
  mode: Schema.Literal("ours"),
}) {
  get skill() {
    return `${this.bucket}/${this.name}`;
  }
}

// Our text, based on an upstream skill at `commit`. sync leaves the folder alone;
// upstream changes since `commit` are ported by review.
export class ForkEntry extends Schema.Class<ForkEntry>("ForkEntry")({
  name: Schema.String,
  bucket: Bucket,
  mode: Schema.Literal("fork"),
  source: Schema.String,
  // One upstream path, or several when the fork is built from more than one.
  path: Schema.Union([Schema.String, Schema.Array(Schema.String)]),
  commit: Commit,
}) {
  get skill() {
    return `${this.bucket}/${this.name}`;
  }
}

// One upstream file vendored into another skill's references/ folder as
// `references/<name>.md`, frontmatter stripped. sync owns that whole folder.
export class ReferenceEntry extends Schema.Class<ReferenceEntry>(
  "ReferenceEntry"
)({
  name: Schema.String,
  bucket: Bucket,
  mode: Schema.Literal("reference"),
  // The skill that indexes the file.
  into: Schema.String,
  source: Schema.String,
  // File inside the upstream repo.
  path: Schema.String,
  commit: Commit,
}) {
  // The owning skill's folder, "<bucket>/<into>".
  get skill() {
    return `${this.bucket}/${this.into}`;
  }

  withCommit(commit: string) {
    return new ReferenceEntry({
      bucket: this.bucket,
      commit,
      into: this.into,
      mode: this.mode,
      name: this.name,
      path: this.path,
      source: this.source,
    });
  }
}

// One entry of upstream/sources.json.
export type SourceEntry = ForkEntry | OursEntry | ReferenceEntry | VendorEntry;

const Entries = Schema.Array(
  Schema.Union([VendorEntry, ForkEntry, OursEntry, ReferenceEntry])
);
const Sources = Schema.fromJsonString(Entries, { space: 2 });

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
    // Rewrites upstream/sources.json, two-space indented, keys in field order.
    readonly writeSources: (
      entries: ReadonlyArray<SourceEntry>
    ) => Effect.Effect<void, PlatformError | Schema.SchemaError>;
    // A text file relative to the repo root (README.md, upstream/DRIFT.md), if it exists.
    readonly readText: (
      file: string
    ) => Effect.Effect<Option.Option<string>, PlatformError>;
    readonly writeText: (
      file: string,
      text: string
    ) => Effect.Effect<void, PlatformError>;
    // Replaces a folder under skills/ ("<bucket>/<name>", or a subfolder of it) with a copy of `from`.
    readonly writeFolder: (
      folder: string,
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

        const writeSources = Effect.fn("SkillTree.writeSources")(function* (
          entries: ReadonlyArray<SourceEntry>
        ) {
          yield* fs.writeFileString(
            path.join(root, "upstream", "sources.json"),
            `${yield* Schema.encodeEffect(Sources)(entries)}\n`
          );
        });

        const readText = Effect.fn("SkillTree.readText")(function* (
          file: string
        ) {
          const full = path.join(root, file);
          if (!(yield* fs.exists(full))) {
            return Option.none<string>();
          }
          return Option.some(yield* fs.readFileString(full));
        });

        const writeText = (file: string, text: string) =>
          fs.writeFileString(path.join(root, file), text);

        const writeFolder = Effect.fn("SkillTree.writeFolder")(function* (
          folder: string,
          from: string
        ) {
          const dest = path.join(skillsDir, folder);
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
            // A skill's bundled script may install its dependencies next to it.
            if (file.split("/").includes("node_modules")) {
              continue;
            }
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
          readText,
          writeText,
          writeSources,
          skillDir: (skill) => path.join(skillsDir, skill),
          writeFolder,
        });
      })
    );
}
