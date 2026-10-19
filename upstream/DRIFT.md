# Upstream drift

Written by `bun run skills sync --report` and `--update`. `--update` moves vendored skills and references to upstream HEAD; forks keep their base commit until the `upstream-review` skill ports the change.

## Vendored

### ketchup (vendor, productivity/ketchup)

`https://github.com/cursor/plugins` `pstack/skills/ketchup`, 019a6a2..d457567

- bc14437 fix(pstack): say outright that ketchup never cuts items to stay under a word count (#708)
- 16541c6 fix(pstack): list every waiting item so each ketchup call is decidable (#692)

```text
 pstack/skills/ketchup/SKILL.md | 20 +++++++++++++-------
 1 file changed, 13 insertions(+), 7 deletions(-)
```
