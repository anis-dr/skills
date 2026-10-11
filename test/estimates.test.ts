import * as BunServices from "@effect/platform-bun/BunServices";
import { assert, layer } from "@effect/vitest";
import { Effect, Stream } from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

// The estimate skill's script is Python with its own unittest suite; run it from here so `bun run test` covers it.
layer(BunServices.layer)("estimate skill script", (it) => {
  it.effect("passes its unittest suite", () =>
    Effect.gen(function* () {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
      const handle = yield* spawner.spawn(
        ChildProcess.make(
          "python3",
          ["-B", "-m", "unittest", "test_estimates"],
          { cwd: "skills/engineering/estimate/scripts" }
        )
      );
      const [stderr, exitCode] = yield* Effect.all(
        [Stream.mkString(Stream.decodeText(handle.stderr)), handle.exitCode],
        { concurrency: "unbounded" }
      );
      assert.strictEqual(exitCode, 0, stderr);
    }).pipe(Effect.scoped)
  );
});
