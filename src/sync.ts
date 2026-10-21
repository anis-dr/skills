import { Effect, FileSystem, Option, Path, Schema } from "effect";

import { applyRules, ruleNames } from "./rules.ts";
import type {
  AgentEntry,
  ReferenceEntry,
  SourceEntry,
  VendorEntry,
} from "./SkillTree.ts";
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
  const upstream = yield* Upstream;
  const checkout = yield* upstream.fetchPinned(entry.source, entry.commit);
  const from = path.join(checkout, entry.path);
  if (!(yield* fs.exists(from))) {
    return yield* new MissingUpstreamPath({ from, skill: entry.skill });
  }
  const dir = path.join(yield* fs.makeTempDirectoryScoped(), entry.name);
  yield* fs.copy(from, dir);
  // A whole-repo path ("." ) brings the checkout's own .git along; it is not part of the skill.
  yield* fs.remove(path.join(dir, ".git"), { force: true, recursive: true });

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
  if (entry.invocation === "model" && (yield* fs.exists(codex))) {
    // Upstream's own metadata blocks implicit invocation; the override lifts that too.
    const lifted = (yield* fs.readFileString(codex)).replace(
      /^policy:\r?\n {2}allow_implicit_invocation: false\r?\n/mu,
      ""
    );
    if (lifted.trim() === "") {
      yield* fs.remove(codex);
    } else {
      yield* fs.writeFileString(codex, lifted);
    }
  }
  if (!(yield* fs.exists(codex))) {
    yield* fs.makeDirectory(path.dirname(codex), { recursive: true });
    yield* fs.writeFileString(
      codex,
      codexMetadata(entry.name, /^disable-model-invocation: true$/mu.test(text))
    );
  }

  if (withPatch) {
    yield* applyPatch(dir, entry);
  }
  return { dir, used };
});

// Applies upstream/patches/<name>.patch, when it exists, to a staged folder.
const applyPatch = Effect.fn("applyPatch")(function* (
  dir: string,
  entry: AgentEntry | VendorEntry
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const patch = (yield* SkillTree).patchPath(entry.name);
  if (!(yield* fs.exists(patch))) {
    return;
  }
  // Its own repo, so paths resolve against the staged folder wherever the temp folder is.
  yield* git(dir, ["init", "-q"]);
  yield* git(dir, ["apply", patch]).pipe(
    Effect.mapError(
      (error) =>
        new PatchConflict({ reason: error.message, skill: entry.skill })
    )
  );
  yield* fs.remove(path.join(dir, ".git"), { recursive: true });
});

// Builds a vendored subagent definition in a scoped temp folder as `<name>.md`:
// the upstream file at the pin, the rules and, when asked, its patch.
const stageAgent = Effect.fn("stageAgent")(function* (
  entry: AgentEntry,
  withPatch: boolean
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const checkout = yield* (yield* Upstream).fetchPinned(
    entry.source,
    entry.commit
  );
  const from = path.join(checkout, entry.path);
  if (!(yield* fs.exists(from))) {
    return yield* new MissingUpstreamPath({ from, skill: entry.skill });
  }
  const dir = yield* fs.makeTempDirectoryScoped();
  const result = applyRules(yield* fs.readFileString(from));
  yield* fs.writeFileString(path.join(dir, `${entry.name}.md`), result.text);
  if (withPatch) {
    yield* applyPatch(dir, entry);
  }
  return { dir, used: result.used };
});

// Stages one vendored skill and writes it into the tree; its temp folder closes after.
const syncVendored = Effect.fn("syncVendored")(function* (entry: VendorEntry) {
  const staged = yield* stage(entry, true);
  yield* (yield* SkillTree).writeFolder(entry.skill, staged.dir);
  return staged.used;
}, Effect.scoped);

// Stages one subagent definition and writes it to agents/<name>.md.
const syncAgent = Effect.fn("syncAgent")(function* (entry: AgentEntry) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const { agentsDir } = yield* SkillTree;
  const staged = yield* stageAgent(entry, true);
  yield* fs.makeDirectory(agentsDir, { recursive: true });
  yield* fs.copyFile(
    path.join(staged.dir, `${entry.name}.md`),
    path.join(agentsDir, `${entry.name}.md`)
  );
  return staged.used;
}, Effect.scoped);

// Stages a vendored skill or a vendored agent.
const stageEntry = Effect.fn("stageEntry")(function* (
  entry: AgentEntry | VendorEntry,
  withPatch: boolean
) {
  if (entry.mode === "agent") {
    return yield* stageAgent(entry, withPatch);
  }
  return yield* stage(entry, withPatch);
});

// The reason a vendored skill's or agent's patch fails on this entry's commit;
// none when it applies or there is no patch. Writes nothing.
export const patchConflict = Effect.fn("patchConflict")(function* (
  entry: AgentEntry | VendorEntry
) {
  return yield* stageEntry(entry, true).pipe(
    Effect.map(() => Option.none<string>()),
    Effect.catchTag("PatchConflict", (error) =>
      Effect.succeedSome(error.reason)
    )
  );
}, Effect.scoped);

// Rebuilds one skill's references/ folder from its reference entries: each
// upstream file with its frontmatter stripped and the rules applied.
const syncReferences = Effect.fn("syncReferences")(function* (
  skill: string,
  entries: ReadonlyArray<ReferenceEntry>,
  ours: ReadonlyArray<string>
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const upstream = yield* Upstream;
  const tree = yield* SkillTree;
  const dir = yield* fs.makeTempDirectoryScoped();
  const used = new Set<string>();
  // Our own reference files are the source; carry them over unchanged.
  for (const name of ours) {
    const file = path.join(tree.skillDir(skill), "references", `${name}.md`);
    if (yield* fs.exists(file)) {
      yield* fs.copyFile(file, path.join(dir, `${name}.md`));
    }
  }
  for (const entry of entries) {
    const checkout = yield* upstream.fetchPinned(entry.source, entry.commit);
    const from = path.join(checkout, entry.path);
    if (!(yield* fs.exists(from))) {
      return yield* new MissingUpstreamPath({ from, skill });
    }
    const result = applyRules(
      (yield* fs.readFileString(from)).replace(
        /^---\r?\n[\s\S]*?\r?\n---\r?\n(?:\r?\n)?/u,
        ""
      )
    );
    for (const name of result.used) {
      used.add(name);
    }
    yield* fs.writeFileString(path.join(dir, `${entry.name}.md`), result.text);
  }
  yield* tree.writeFolder(`${skill}/references`, dir);
  return used;
}, Effect.scoped);

// Writes every vendored skill and reference from its pinned upstream commit.
// Returns the rules that matched no vendored text: dead rules the CLI reports.
export const sync = Effect.fn("sync")(function* (
  entries: ReadonlyArray<SourceEntry>
) {
  const used = new Set<string>();
  const references = new Map<string, Array<ReferenceEntry>>();
  for (const entry of entries) {
    if (entry.mode === "vendor") {
      for (const name of yield* syncVendored(entry)) {
        used.add(name);
      }
    } else if (entry.mode === "agent") {
      for (const name of yield* syncAgent(entry)) {
        used.add(name);
      }
    } else if (entry.mode === "reference") {
      references.set(entry.skill, [
        ...(references.get(entry.skill) ?? []),
        entry,
      ]);
    }
  }
  for (const [skill, group] of references) {
    const ours = entries
      .filter(
        (entry) =>
          entry.mode === "ours" &&
          entry.skill === skill &&
          entry.into !== undefined
      )
      .map((entry) => entry.name);
    for (const name of yield* syncReferences(skill, group, ours)) {
      used.add(name);
    }
  }
  return ruleNames.filter((name) => !used.has(name));
});

// Writes upstream/patches/<name>.patch: the difference between the skill folder
// (or agents/<name>.md) and what sync builds without a patch. No difference
// deletes the patch. Returns whether a patch was written.
export const writePatch = Effect.fn("writePatch")(function* (
  entry: AgentEntry | VendorEntry
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const tree = yield* SkillTree;
  const { dir } = yield* stageEntry(entry, false);
  yield* git(dir, ["init", "-q"]);
  yield* git(dir, ["add", "-A"]);
  yield* git(dir, [...identity, "commit", "-q", "-m", "staged"]);
  // An agent's work tree is the shared agents/ folder, so add only its file.
  let addWorkTree = [`--work-tree=${tree.skillDir(entry.skill)}`, "add", "-A"];
  if (entry.mode === "agent") {
    addWorkTree = [
      `--work-tree=${tree.agentsDir}`,
      "add",
      "-A",
      "--",
      `${entry.name}.md`,
    ];
  }
  yield* git(dir, addWorkTree);
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
