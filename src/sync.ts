import { Effect, FileSystem, Path, Schema } from "effect";

import { applyRules, ruleNames } from "./rules.ts";
import type { SourceEntry, VendorEntry } from "./SkillTree.ts";
import { SkillTree } from "./SkillTree.ts";
import { git, Upstream } from "./Upstream.ts";

export class MissingUpstreamPath extends Schema.TaggedError<MissingUpstreamPath>()(
  "MissingUpstreamPath",
  { from: Schema.String, skill: Schema.String }
) {
  override get message() {
    return `${this.skill}: upstream has no folder at ${this.from}`;
  }
}

export class PatchConflict extends Schema.TaggedError<PatchConflict>()(
  "PatchConflict",
  { reason: Schema.String, skill: Schema.String }
) {
  override get message() {
    return `${this.skill}: its patch no longer applies. Edit the skill folder and run \`bun run skills patch\` again. ${this.reason}`;
  }
}

const identity = [
  "-c",
  "user.name=skills",
  "-c",
  "user.email=skills@localhost",
];

// Codex picker metadata for a skill upstream ships without it: the title-cased
// name, and the policy line when the skill is user-invoked.
const codexMetadata = (name: string, userInvoked: boolean) => {
  const displayName = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const lines = ["interface:", `  display_name: "${displayName}"`];
  if (userInvoked) {
    lines.push("policy:", "  allow_implicit_invocation: false");
  }
  return `${lines.join("\n")}\n`;
};

// Builds a vendored skill in a scoped temp folder: the upstream folder at the pin,
// then the rules, the invocation override, Codex metadata and, when asked, the
// skill's patch. Returns the folder and the names of the rules that matched.
const stage = Effect.fn("stage")(function* (
  entry: VendorEntry,
  withPatch: boolean
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const tree = yield* SkillTree;
  const upstream = yield* Upstream;
  const checkout = yield* upstream.fetchPinned(entry.source, entry.commit);
  const from = path.join(checkout, entry.path);
  if (!(yield* fs.exists(from))) {
    return yield* new MissingUpstreamPath({ from, skill: entry.skill });
  }
  const dir = path.join(yield* fs.makeTempDirectoryScoped(), entry.name);
  yield* fs.copy(from, dir);

  const used = new Set<string>();
  for (const file of yield* fs.readDirectory(dir, { recursive: true })) {
    if (file.endsWith(".md")) {
      const result = applyRules(yield* fs.readFileString(path.join(dir, file)));
      for (const name of result.used) {
        used.add(name);
      }
      yield* fs.writeFileString(path.join(dir, file), result.text);
    }
  }

  const skillMd = path.join(dir, "SKILL.md");
  let text = yield* fs.readFileString(skillMd);
  if (entry.invocation === "model") {
    text = text.replace(/^disable-model-invocation: true\r?\n/mu, "");
    yield* fs.writeFileString(skillMd, text);
  }
  const codex = path.join(dir, "agents", "openai.yaml");
  if (!(yield* fs.exists(codex))) {
    yield* fs.makeDirectory(path.dirname(codex), { recursive: true });
    yield* fs.writeFileString(
      codex,
      codexMetadata(entry.name, /^disable-model-invocation: true$/mu.test(text))
    );
  }

  const patch = tree.patchPath(entry.name);
  if (withPatch && (yield* fs.exists(patch))) {
    // Its own repo, so paths resolve against the skill folder wherever the temp folder is.
    yield* git(dir, ["init", "-q"]);
    yield* git(dir, ["apply", patch]).pipe(
      Effect.mapError(
        (error) =>
          new PatchConflict({ reason: error.message, skill: entry.skill })
      )
    );
    yield* fs.remove(path.join(dir, ".git"), { recursive: true });
  }
  return { dir, used };
});

// Stages one vendored skill and writes it into the tree; its temp folder closes after.
const syncVendored = Effect.fn("syncVendored")(function* (entry: VendorEntry) {
  const staged = yield* stage(entry, true);
  yield* (yield* SkillTree).writeSkill(entry, staged.dir);
  return staged.used;
}, Effect.scoped);

// Writes every vendored skill from its pinned upstream commit. Returns the rules
// that matched no vendored text: dead rules the CLI reports.
export const sync = Effect.fn("sync")(function* (
  entries: ReadonlyArray<SourceEntry>
) {
  const used = new Set<string>();
  for (const entry of entries) {
    if (entry.mode === "vendor") {
      for (const name of yield* syncVendored(entry)) {
        used.add(name);
      }
    }
  }
  return ruleNames.filter((name) => !used.has(name));
});

// Writes upstream/patches/<name>.patch: the difference between the skill folder
// and what sync builds without a patch. No difference deletes the patch.
// Returns whether a patch was written.
export const writePatch = Effect.fn("writePatch")(function* (
  entry: VendorEntry
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const tree = yield* SkillTree;
  const { dir } = yield* stage(entry, false);
  yield* git(dir, ["init", "-q"]);
  yield* git(dir, ["add", "-A"]);
  yield* git(dir, [...identity, "commit", "-q", "-m", "staged"]);
  yield* git(dir, [`--work-tree=${tree.skillDir(entry.skill)}`, "add", "-A"]);
  const diff = yield* git(dir, ["diff", "--cached", "--binary"]);
  const patch = tree.patchPath(entry.name);
  if (diff === "") {
    yield* fs.remove(patch, { force: true });
    return false;
  }
  yield* fs.makeDirectory(path.dirname(patch), { recursive: true });
  yield* fs.writeFileString(patch, diff);
  return true;
}, Effect.scoped);
