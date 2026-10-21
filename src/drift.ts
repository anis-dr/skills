import { Effect, Option, Result, Schema } from "effect";

import { decodeYaml, frontmatterBlock } from "./check.ts";
import type {
  AgentEntry,
  ForkEntry,
  IgnoredEntry,
  ReferenceEntry,
  SourceEntry,
  VendorEntry,
} from "./SkillTree.ts";
import { patchConflict } from "./sync.ts";
import { Upstream } from "./Upstream.ts";

type PinnedEntry = AgentEntry | ForkEntry | ReferenceEntry | VendorEntry;

export interface Drift {
  readonly entry: PinnedEntry;
  // Upstream HEAD when the drift was measured.
  readonly head: string;
  // [sha, subject] of each commit after the pin that touches the entry's path, newest first.
  readonly commits: ReadonlyArray<readonly [string, string]>;
  readonly stat: string;
  // Why the vendored skill's patch fails on head; its pin stays until a person fixes the patch.
  readonly conflict: Option.Option<string>;
}

// The upstream paths an entry is built from.
const pathsOf = (entry: PinnedEntry) => [entry.path].flat();

// Every pinned entry whose upstream paths changed after its commit, in entry order.
export const findDrift = Effect.fn("findDrift")(function* (
  entries: ReadonlyArray<SourceEntry>
) {
  const upstream = yield* Upstream;
  const drift: Array<Drift> = [];
  for (const entry of entries) {
    if (entry.mode !== "ours") {
      const commits = yield* upstream.commitsSince(
        entry.source,
        entry.commit,
        pathsOf(entry)
      );
      if (commits.length > 0) {
        const head = yield* upstream.head(entry.source);
        let conflict = Option.none<string>();
        if (entry.mode === "vendor" || entry.mode === "agent") {
          conflict = yield* patchConflict(entry.withCommit(head));
        }
        drift.push({
          commits,
          conflict,
          entry,
          head,
          stat: yield* upstream.diffStat(
            entry.source,
            entry.commit,
            pathsOf(entry)
          ),
        });
      }
    }
  }
  return drift;
});

const pin = (entry: SourceEntry, drift: ReadonlyArray<Drift>): SourceEntry => {
  const moved = drift.find((each) => each.entry === entry);
  if (
    moved === undefined ||
    Option.isSome(moved.conflict) ||
    entry.mode === "fork" ||
    entry.mode === "ours"
  ) {
    return entry;
  }
  return entry.withCommit(moved.head);
};

// Vendored skills and references move to upstream HEAD; forks keep their base
// commit until a human ports the change (the upstream-review skill), and so does
// a vendored skill whose patch no longer applies.
export const updatePins = (
  entries: ReadonlyArray<SourceEntry>,
  drift: ReadonlyArray<Drift>
): ReadonlyArray<SourceEntry> => entries.map((entry) => pin(entry, drift));

export interface Untracked {
  readonly source: string;
  readonly path: string;
  readonly kind: "agent" | "skill";
  // First line of its frontmatter description.
  readonly description: string;
}

export interface Discovery {
  readonly untracked: ReadonlyArray<Untracked>;
  // Ignore entries that match no upstream file at HEAD, or whose source no entry tracks.
  readonly stale: ReadonlyArray<IgnoredEntry>;
}

// Whether the upstream path `item` is `path` or inside it.
const covers = (path: string, item: string) =>
  path === "." || item === path || item.startsWith(`${path}/`);

const Described = Schema.Struct({
  description: Schema.String,
  name: Schema.String,
});

interface Candidate {
  readonly file: string;
  readonly kind: Untracked["kind"];
  readonly path: string;
}

// Skill folders (by their SKILL.md) and Markdown files directly inside an
// `agents` folder among a source's files, sorted by path.
const candidatesIn = (files: ReadonlyArray<string>) => {
  const candidates: Array<Candidate> = [];
  for (const file of files) {
    const parts = file.split("/");
    if (parts.at(-1) === "SKILL.md") {
      const path = parts.slice(0, -1).join("/") || ".";
      candidates.push({ file, kind: "skill", path });
    } else if (parts.at(-2) === "agents" && file.endsWith(".md")) {
      candidates.push({ file, kind: "agent", path: file });
    }
  }
  return candidates.sort((a, b) => a.path.localeCompare(b.path));
};

// The first line of a Markdown file's frontmatter description; none when its
// frontmatter lacks a name or a description.
const descriptionOf = (text: string) => {
  const block = frontmatterBlock(text) ?? "";
  // Upstream frontmatter is not always valid YAML (an unquoted `: ` in a
  // description); then read the two plain `key: value` lines instead.
  const meta = Result.orElse(decodeYaml(Described, block), () =>
    Schema.decodeUnknownResult(Described)({
      description: /^description:[ \t]*(\S.*)$/mu.exec(block)?.[1],
      name: /^name:[ \t]*(\S.*)$/mu.exec(block)?.[1],
    })
  );
  return Result.match(meta, {
    onFailure: () => Option.none<string>(),
    onSuccess: ({ description }) =>
      Option.some(description.trim().split("\n")[0] ?? ""),
  });
};

// Every upstream path that entries build from, per source.
const trackedPaths = (entries: ReadonlyArray<SourceEntry>) => {
  const tracked = new Map<string, Array<string>>();
  for (const entry of entries) {
    if (entry.mode !== "ours") {
      tracked.set(entry.source, [
        ...(tracked.get(entry.source) ?? []),
        ...pathsOf(entry),
      ]);
    }
  }
  return tracked;
};

// Every skill folder (one holding a SKILL.md) and subagent definition (a
// Markdown file with name and description, directly inside an `agents` folder)
// at each source's HEAD that no entry tracks and upstream/ignored.json leaves in.
export const findUntracked = Effect.fn("findUntracked")(function* (
  entries: ReadonlyArray<SourceEntry>,
  ignored: ReadonlyArray<IgnoredEntry>
) {
  const upstream = yield* Upstream;
  const tracked = trackedPaths(entries);
  const untracked: Array<Untracked> = [];
  const stale: Array<IgnoredEntry> = ignored.filter(
    (each) => !tracked.has(each.source)
  );
  for (const [source, paths] of tracked) {
    const files = yield* upstream.filesAtHead(source);
    const skip = ignored.filter((each) => each.source === source);
    stale.push(
      ...skip.filter((each) => !files.some((file) => covers(each.path, file)))
    );
    for (const { file, kind, path } of candidatesIn(files)) {
      // A reference entry tracks a skill through its SKILL.md.
      const known =
        paths.some((each) => covers(each, path) || each === file) ||
        skip.some((each) => covers(each.path, path));
      if (!known) {
        const description = descriptionOf(
          yield* upstream.readAtHead(source, file)
        );
        if (kind === "skill" || Option.isSome(description)) {
          const firstLine = Option.getOrElse(
            description,
            () => "(no description)"
          );
          untracked.push({ description: firstLine, kind, path, source });
        }
      }
    }
  }
  return { stale, untracked } satisfies Discovery;
});

const untrackedSection = ({ stale, untracked }: Discovery) => {
  const lines = [
    "## Untracked upstream",
    "",
    "Skills and subagent definitions at upstream HEAD that no `upstream/sources.json` entry tracks. Vendor each one, or list it in `upstream/ignored.json` with a reason.",
    "",
  ];
  if (untracked.length === 0) {
    lines.push(
      "Every upstream skill and subagent definition is tracked or ignored.",
      ""
    );
  }
  for (const source of new Set(untracked.map((each) => each.source))) {
    lines.push(
      `### ${source}`,
      "",
      ...untracked
        .filter((each) => each.source === source)
        .map(
          ({ description, kind, path }) =>
            `- \`${path}\` (${kind}): ${description}`
        ),
      ""
    );
  }
  if (stale.length > 0) {
    lines.push(
      "### Stale ignore entries",
      "",
      "These `upstream/ignored.json` entries match nothing upstream; delete them.",
      "",
      ...stale.map(({ path, source }) => `- \`${source}\` \`${path}\``),
      ""
    );
  }
  return lines;
};

const section = ({ commits, conflict, entry, head, stat }: Drift) =>
  [
    `### ${entry.name} (${entry.mode}, ${entry.skill})`,
    "",
    `\`${entry.source}\` \`${pathsOf(entry).join(", ")}\`, ${entry.commit.slice(0, 7)}..${head.slice(0, 7)}`,
    "",
    ...commits.map(([sha, subject]) => `- ${sha.slice(0, 7)} ${subject}`),
    "",
    ...Option.match(conflict, {
      onNone: () => [],
      onSome: (reason) => ["```text", reason.trimEnd(), "```", ""],
    }),
    "```text",
    stat.trimEnd(),
    "```",
    "",
  ].join("\n");

// upstream/DRIFT.md: what needs a person first (forks, then patches that no
// longer apply), then what --update moves, then upstream skills and agents no
// entry tracks.
export const renderDrift = (
  drift: ReadonlyArray<Drift>,
  discovery: Discovery
) => {
  const forks = drift.filter((each) => each.entry.mode === "fork");
  const conflicts = drift.filter((each) => Option.isSome(each.conflict));
  const vendored = drift.filter(
    (each) => each.entry.mode !== "fork" && Option.isNone(each.conflict)
  );
  const lines = [
    "# Upstream drift",
    "",
    "Written by `bun run skills sync --report` and `--update`. `--update` moves vendored skills and references to upstream HEAD; forks keep their base commit until the `upstream-review` skill ports the change.",
    "",
  ];
  if (drift.length === 0) {
    lines.push("No pinned skill changed upstream.", "");
  }
  if (forks.length > 0) {
    lines.push("## Forks: needs review", "", ...forks.map(section));
  }
  if (conflicts.length > 0) {
    lines.push(
      "## Patch conflicts: needs a hand fix",
      "",
      "These skills keep their old pin: their patch no longer applies to upstream HEAD. Move the pin by hand, run `bun run skills sync`, redo the edit in the skill folder, then run `bun run skills patch <name>`.",
      "",
      ...conflicts.map(section)
    );
  }
  if (vendored.length > 0) {
    lines.push("## Vendored", "", ...vendored.map(section));
  }
  lines.push(...untrackedSection(discovery));
  return lines.join("\n");
};
