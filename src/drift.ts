import { Effect } from "effect";

import type {
  ForkEntry,
  ReferenceEntry,
  SourceEntry,
  VendorEntry,
} from "./SkillTree.ts";
import { Upstream } from "./Upstream.ts";

export interface Drift {
  readonly entry: ForkEntry | ReferenceEntry | VendorEntry;
  // Upstream HEAD when the drift was measured.
  readonly head: string;
  // [sha, subject] of each commit after the pin that touches the entry's path, newest first.
  readonly commits: ReadonlyArray<readonly [string, string]>;
  readonly stat: string;
}

// The upstream paths an entry is built from.
const pathsOf = (entry: ForkEntry | ReferenceEntry | VendorEntry) =>
  [entry.path].flat();

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
        drift.push({
          commits,
          entry,
          head: yield* upstream.head(entry.source),
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
  if (moved === undefined || entry.mode === "fork" || entry.mode === "ours") {
    return entry;
  }
  return entry.withCommit(moved.head);
};

// Vendored skills and references move to upstream HEAD; forks keep their base
// commit until a human ports the change (the upstream-review skill).
export const updatePins = (
  entries: ReadonlyArray<SourceEntry>,
  drift: ReadonlyArray<Drift>
): ReadonlyArray<SourceEntry> => entries.map((entry) => pin(entry, drift));

const section = ({ commits, entry, head, stat }: Drift) =>
  [
    `### ${entry.name} (${entry.mode}, ${entry.skill})`,
    "",
    `\`${entry.source}\` \`${pathsOf(entry).join(", ")}\`, ${entry.commit.slice(0, 7)}..${head.slice(0, 7)}`,
    "",
    ...commits.map(([sha, subject]) => `- ${sha.slice(0, 7)} ${subject}`),
    "",
    "```text",
    stat.trimEnd(),
    "```",
    "",
  ].join("\n");

// upstream/DRIFT.md: forks that need a human port first, then what --update moves.
export const renderDrift = (drift: ReadonlyArray<Drift>) => {
  const forks = drift.filter((each) => each.entry.mode === "fork");
  const vendored = drift.filter((each) => each.entry.mode !== "fork");
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
  if (vendored.length > 0) {
    lines.push("## Vendored", "", ...vendored.map(section));
  }
  return lines.join("\n");
};
