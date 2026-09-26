---
name: orca-browser-ui-verification
description: "Use when working inside Orca and needing visual or behavioral proof of a web UI change. Drives Orca's built-in browser with the orca CLI: snapshot, measure computed styles, capture and view screenshots, and scroll app shells that own their own scroll container."
---

# Verifying UI in Orca's built-in browser

Inside Orca, use the built-in browser through the `orca` CLI. Launch a headless or external browser only when the user explicitly asks for one.

## Resolve the CLI once

Use the `ORCA_CLI_COMMAND` env var if set, else `orca-dev` in a dev checkout, else `orca-ide` on Linux outside Orca terminals, else `orca`. Before using unfamiliar subcommands, call the Skill tool with "orca-cli", or print the version-matched guide with `orca skills get orca-cli`. If "orca-cli" isn't installed, ask the user to run npx skills add stablyai/orca --skill orca-cli, then continue.

## Core loop

```bash
orca goto --url http://localhost:3000/path --json
orca wait --load networkidle --json
orca snapshot --json        # accessibility tree + @eN refs
orca eval --expression "..." --json
```

Re-snapshot after navigation or any click that re-renders. Navigation and tab switches invalidate refs.

## Screenshots must be decoded

`orca screenshot` and `orca full-screenshot` return base64 in JSON, not a file path. Decode before viewing:

```bash
orca screenshot --json | python3 -c "
import sys,json,base64,pathlib
d=json.load(sys.stdin)
pathlib.Path('/tmp/shot.png').write_bytes(base64.b64decode(d['result']['data']))
print('ok')
"
```

Then open `/tmp/shot.png` with your file-reading tool, which shows images.

## App shells own their scroll container

This is the trap. With an `AppShell`-style layout (most app shells), the document does not scroll; an inner element does. Symptoms: `document.documentElement.scrollHeight` looks impossibly short, `orca scroll` appears to do nothing, and `full-screenshot` only captures the first viewport.

Find and drive the real container:

```javascript
(() => {
  const el = [...document.querySelectorAll('*')].find(e =>
    e.scrollHeight > e.clientHeight + 50 &&
    ['auto','scroll'].includes(getComputedStyle(e).overflowY));
  el.scrollTop = 950;
  return { cls: String(el.className).slice(0,40), scrollH: el.scrollHeight, clientH: el.clientHeight };
})()
```

Scroll, sleep about 1s, then screenshot. Repeat to walk a long page.

## Measure, do not eyeball

Assert computed values rather than trusting a screenshot:

```javascript
(() => {
  const b = getComputedStyle(document.body);
  return {
    scheme: getComputedStyle(document.documentElement).colorScheme,
    color: b.color,
    images: [...document.images].map(i => ({ src: i.currentSrc.split('/').pop(), ok: i.complete && i.naturalWidth > 0 })),
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
    dir: document.documentElement.dir
  };
})()
```

Use this to catch stretched elements (measure `getBoundingClientRect().width`), unloaded images, horizontal overflow, and RTL correctness.

## Known limitation

`eval` cannot resize the viewport; `window.resizeTo` is a no-op. Mobile widths are not verifiable this way. Say so rather than claiming mobile works.

## Prove a failure is pre-existing

Before blaming your own change for a failing typecheck or test, stash and re-run:

```bash
git stash push -u -m tmp-verify -- <path>
<the failing command>
git stash pop
```

If it still fails, it is pre-existing. Report it as such with that evidence instead of fixing out of scope.

## Verify with real data, not the empty state

An error or empty state proves nothing about the populated path. Create real records through the app's own flow (sign up, create, publish) so the populated rendering actually runs, then assert the values appear in `document.body.innerText`.

## Cleanup

Stop any dev server you started. Keep the user's last tab open by navigating it to `about:blank`. Leave dev servers you did not start running, and check `lsof -nP -iTCP:<port> -sTCP:LISTEN` before assuming a port squatter is yours.
