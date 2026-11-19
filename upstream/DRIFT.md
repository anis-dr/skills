# Upstream drift

Written by `bun run skills sync --report` and `--update`. `--update` moves vendored skills and references to upstream HEAD; forks keep their base commit until the `upstream-review` skill ports the change.

No pinned skill changed upstream.

## Untracked upstream

Skills and subagent definitions at upstream HEAD that no `upstream/sources.json` entry tracks. Vendor each one, or list it in `upstream/ignored.json` with a reason.

Every upstream skill and subagent definition is tracked or ignored.
