import { Effect, FileSystem, Layer, Path, Schema, Stream } from "effect";
import type { Scope } from "effect";
import * as Context from "effect/Context";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

export class GitError extends Schema.TaggedError<GitError>()("GitError", {
  args: Schema.Array(Schema.String),
  stderr: Schema.String,
}) {
  override get message() {
    return `git ${this.args.join(" ")}: ${this.stderr.trim()}`;
  }
}

export class UpstreamFetchError extends Schema.TaggedError<UpstreamFetchError>()(
  "UpstreamFetchError",
  {
    commit: Schema.String,
    reason: Schema.String,
    source: Schema.String,
  }
) {
  override get message() {
    return `cannot fetch ${this.source} at ${this.commit}: ${this.reason}`;
  }
}

// Runs git in `cwd` and returns stdout; a non-zero exit fails with its stderr.
export const git = Effect.fn("git")(function* (
  cwd: string,
  args: ReadonlyArray<string>
) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const handle = yield* spawner.spawn(ChildProcess.make("git", args, { cwd }));
  const [stdout, stderr, exitCode] = yield* Effect.all(
    [
      Stream.mkString(Stream.decodeText(handle.stdout)),
      Stream.mkString(Stream.decodeText(handle.stderr)),
      handle.exitCode,
    ],
    { concurrency: "unbounded" }
  );
  if (exitCode !== 0) {
    return yield* new GitError({ args, stderr });
  }
  return stdout;
}, Effect.scoped);

export class Upstream extends Context.Service<
  Upstream,
  {
    // Checks out `source` at `commit` under the cache and returns the checkout's path.
    readonly fetchPinned: (
      source: string,
      commit: string
    ) => Effect.Effect<string, UpstreamFetchError>;
    // The upstream's current HEAD commit.
    readonly head: (
      source: string
    ) => Effect.Effect<string, UpstreamFetchError>;
    // [sha, subject] of every commit after `from`, up to HEAD, that touches any of `paths`, newest first.
    readonly commitsSince: (
      source: string,
      from: string,
      paths: ReadonlyArray<string>
    ) => Effect.Effect<
      ReadonlyArray<readonly [string, string]>,
      UpstreamFetchError
    >;
    // `git diff --stat` of `paths` from `from` to HEAD.
    readonly diffStat: (
      source: string,
      from: string,
      paths: ReadonlyArray<string>
    ) => Effect.Effect<string, UpstreamFetchError>;
  }
>()("skills/Upstream") {
  static readonly layer = (cacheDir: string) =>
    Layer.effect(
      Upstream,
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
        const slug = (source: string) =>
          source
            .replace(/^[a-z]+:\/\//u, "")
            .replaceAll(/[^A-Za-z0-9]+/gu, "-");
        const failWith =
          (source: string, commit: string) =>
          <A, E extends { readonly message: string }>(
            effect: Effect.Effect<
              A,
              E,
              ChildProcessSpawner.ChildProcessSpawner | Scope.Scope
            >
          ) =>
            effect.pipe(
              Effect.scoped,
              Effect.provideService(
                ChildProcessSpawner.ChildProcessSpawner,
                spawner
              ),
              Effect.mapError(
                (error) =>
                  new UpstreamFetchError({
                    commit,
                    reason: error.message,
                    source,
                  })
              )
            );

        const fetchPinned = Effect.fn("Upstream.fetchPinned")(
          function* (source: string, commit: string) {
            const checkout = path.join(cacheDir, `${slug(source)}@${commit}`);
            if (yield* fs.exists(checkout)) {
              return checkout;
            }
            yield* fs.makeDirectory(cacheDir, { recursive: true });
            // Fetch into a temp folder and rename, so a failed fetch never looks cached.
            // The release deletes the temp folder; after the rename it is already gone.
            const temp = yield* Effect.acquireRelease(
              fs.makeTempDirectory({ directory: cacheDir }),
              (dir) =>
                Effect.ignore(fs.remove(dir, { force: true, recursive: true }))
            );
            yield* git(temp, ["init", "-q"]);
            yield* git(temp, ["fetch", "-q", "--depth", "1", source, commit]);
            yield* git(temp, ["checkout", "-q", "FETCH_HEAD"]);
            yield* fs.rename(temp, checkout);
            return checkout;
          },
          (effect, source, commit) => failWith(source, commit)(effect)
        );

        // A blobless mirror with full history, fetched once per run.
        const fetched = new Set<string>();
        const mirror = Effect.fn("Upstream.mirror")(function* (source: string) {
          const dir = path.resolve(cacheDir, `${slug(source)}.git`);
          if (fetched.has(source)) {
            return dir;
          }
          if (yield* fs.exists(dir)) {
            yield* git(dir, ["fetch", "-q", "--prune", "origin"]);
          } else {
            yield* fs.makeDirectory(cacheDir, { recursive: true });
            yield* git(cacheDir, [
              "clone",
              "-q",
              "--mirror",
              "--filter=blob:none",
              source,
              dir,
            ]);
          }
          fetched.add(source);
          return dir;
        });

        const head = Effect.fn("Upstream.head")(
          function* (source: string) {
            const out = yield* git(yield* mirror(source), [
              "rev-parse",
              "HEAD",
            ]);
            return out.trim();
          },
          (effect, source) => failWith(source, "HEAD")(effect)
        );

        const commitsSince = Effect.fn("Upstream.commitsSince")(
          function* (
            source: string,
            from: string,
            paths: ReadonlyArray<string>
          ) {
            const out = yield* git(yield* mirror(source), [
              "log",
              "--format=%H%x09%s",
              `${from}..HEAD`,
              "--",
              ...paths,
            ]);
            return out
              .split("\n")
              .filter((line) => line !== "")
              .map((line): readonly [string, string] => [
                line.slice(0, line.indexOf("\t")),
                line.slice(line.indexOf("\t") + 1),
              ]);
          },
          (effect, source, from) => failWith(source, from)(effect)
        );

        const diffStat = Effect.fn("Upstream.diffStat")(
          function* (
            source: string,
            from: string,
            paths: ReadonlyArray<string>
          ) {
            return yield* git(yield* mirror(source), [
              "diff",
              "--stat",
              from,
              "HEAD",
              "--",
              ...paths,
            ]);
          },
          (effect, source, from) => failWith(source, from)(effect)
        );

        return Upstream.of({ commitsSince, diffStat, fetchPinned, head });
      })
    );
}
