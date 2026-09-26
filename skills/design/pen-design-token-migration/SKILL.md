---
name: pen-design-token-migration
description: "Migrate, rename, alias, de-alias or delete design tokens (variables) in a pen.dev .pen file, including moving onto an external design system's token set with light and dark modes. Use when renaming or restructuring .pen tokens, adding dark mode, removing hardcoded colours, making a design match a token system, or when nodes render black after a token change."
---

# Migrating tokens in a .pen file

Goal: every node resolves to a canonical token name from the target set, colour tokens carry light and dark values, and nothing renders black.

A `.pen` file is plain JSON (`children`, `variables`). You edit it two ways: the pen.dev MCP `execute` API (`Get`, `Update`, `SetVariables`, ...) and the raw JSON. Both have traps that silently lose work.

## Trap 1: `descendants` is not `children`

A `ref` (instance) node stores its per-instance overrides in a `descendants` map that sits beside `children`, not inside it. Those override values reference tokens too:

```json
{"type":"ref","ref":"e8oy5","descendants":{
  "sAE3v":{"content":"1042","fill":"$primary"},
  "lRrFE/yaLYB":{"fill":"$olive"}
}}
```

- A rewrite or verification walk that recurses only through `children` misses every override. In one 91-frame file that was 778 references.
- Delete the old variables afterwards and those references dangle. pen resolves an unresolvable colour to `#000000`, and the app's next autosave writes that black into the file for good. In that session 411 overrides turned black. The app may also materialise the whole child node into the override, with its own `id`, `children`, and black `fill`/`stroke`. The original token name is then gone from the working file and must come from git.
- `Get(visitor)` does not traverse into materialised override nodes, so an in-app audit reports zero problems on a broken file. Audit the raw JSON, not the document API.
- Override keys can be nested paths (`parentChild/grandChild`), and refs can sit inside other refs' overrides. The walk must recurse over every dict and list, not two levels.

Any deep scan or rewrite recurses into `descendants` values as well as `children`.

## Trap 2: two writers, one file

The pen.dev app and the `pen` CLI both write the file, and neither reloads the other's write. MCP `execute` edits go to the app's in-memory document, not to disk: you can make 150 edits, read the file, and find none of them. There is no `Save()` inside `execute`. `pen interactive --app <name>` attaches to the running app and exposes `save()`, so flush yourself:

```sh
printf 'save()\nexit()\n' | pen interactive --app desktop --in designs/app.pen
```

The app's next autosave silently reverts a raw-JSON edit made while it holds the file. For anything that needs raw JSON (deleting variables has no API), keep this order:

1. Make edits through MCP `execute`.
2. Flush with the command above.
3. Edit the raw JSON, then commit at once.
4. If you touch the app again, re-flush and re-strip, because its next save restores what you stripped.

If you edit raw JSON anyway, tell the owner the app's copy is stale. Repairing a broken document means fixing the app's copy, not only the disk (see "Repairing a blackened file").

## pen API facts not in the docs

- `GetVariables()` returns `{variables, themes}`. `SetVariables(obj)` creates or overwrites.
- There is no delete API. `DeleteVariables` is undefined and `SetVariables({k: null})` errors. Remove a variable by editing the raw JSON after a flush.
- Themed values:
  ```js
  SetVariables({'color-accent': {type:'color', value:[
    {value:'#235aa6', theme:{mode:'light'}},
    {value:'#7aa9e8', theme:{mode:'dark'}},
  ]}})
  ```
  `theme` must be an object. A bare string (`theme:'dark'`) is accepted but char-mapped into `{"0":"d","1":"a",...}`, creating junk theme axes in the derived registry that no API can delete. Probe on a throwaway variable name and expect to clean up in raw JSON.
- The theme axis is derived from the variables, not declared. `GetThemes`/`SetThemes` do not exist.
- `theme: {mode:'dark'}` is a node property on any frame. It cascades into children and component instances. Revert with `{mode:'light'}`; `theme: null` throws. You do not need duplicate dark screens: one documentation frame per mode is enough, and everything else previews on demand.
- Variables may reference variables (`{type:'color', value:'$color-accent'}`). This is how aliases work, for `number` and `string` types too.
- Effects accept variable references: `effect:[{type:'shadow', color:'$color-shadow', ...}]`.
- `Update(id, ...)` needs a string id. Passing the result of `Get(...)` (an array) errors.
- A bare `Get({depth:0})` errors. Always pass a visitor or a node id.

## Migration sequence

1. **Read the target system's real token list** (its docs page or package) and build the allowed-name set in code. Diff your variables against it in code, not by eye. Never invent a token (see "Choosing a token").
2. **Probe the theme API** on a throwaway name before designing around it (see the API facts above).
3. **Write the new tokens and keep the old names as aliases** pointing at them (`SetVariables({'bg': {type:'color', value:'$color-background-body'}})`). Existing frames keep resolving while you work. Aliases are temporary: the owner will reject a permanent alias layer as debt, so plan to remove them in the same engagement.
4. **Rewrite every reference, in both trees.** Token-carrying properties: `fill`, `stroke`, `cornerRadius`, `fontFamily`, `fontSize`, and `effect[].color`. Through `execute`, collect targets first and update afterwards; never mutate during a `Get` walk:
   ```js
   targets = [];
   Get(c => { const u = {};
     for (const k of ['fill','stroke','cornerRadius','fontFamily','fontSize']) {
       const v = c[k];
       if (typeof v === 'string' && v[0] === '$' && ALIAS[v.slice(1)]) u[k] = '$' + ALIAS[v.slice(1)];
     }
     if (Object.keys(u).length) targets.push([c.id, u]); });
   for (const [id, u] of targets) Update(id, u);
   ```
   About 4000 nodes take 4 seconds. This does not reach `descendants`, so rewrite those separately. In the raw JSON (after a flush), a fully recursive rewrite covers everything:
   ```python
   def fix(o):
       if isinstance(o, str):
           return '$' + MAP[o[1:]] if o.startswith('$') and o[1:] in MAP else o
       if isinstance(o, dict):  return {k: fix(v) for k, v in o.items()}
       if isinstance(o, list):  return [fix(v) for v in o]
       return o
   ```
   Through the app, plain overrides take `Update(instanceId, {descendants: {childKey: {fill: '$token'}}})`, which merges rather than replaces.
5. **Migrate literal colours** (see the table below).
6. **Audit semantics** (see "Semantic audit").
7. **Verify at every depth before deleting anything.** Run the integrity gate. Dangling references must be 0.
8. **Delete the aliases and old variables last**: flush, strip them from the raw JSON, run the gate again, commit. Re-flush and re-strip if the app autosaved in between.
9. **Verify visually** in both modes (see "Verify").

## Literal colours

A literal hex cannot switch modes. Find `fill`/`stroke`/`effect[].color` values starting with `#` in the raw JSON and classify:

| Kind | Action |
|---|---|
| Flag or logo artwork | Leave literal. A flag is not themeable. |
| `#00000000` transparent | Leave. |
| Shadow ink | `$color-shadow`. Effects accept variable refs. |
| Modal scrim | `$color-overlay`. |
| Text or glyph on the accent fill | `$color-on-accent`, never a surface token. |

The last row hides a bug. A label filled with `$surface` looks right in light (white on blue) and turns near-black on light blue in dark, because the accent lightens. Search for text nodes whose fill is a surface token and whose parent fill is the accent.

Bulk effect migration in one pass:

```js
MAP={'#1b27231f':'$color-shadow'};
ids=[]; Get(c=>{ if(Array.isArray(c.effect)&&c.effect.some(e=>e&&MAP[e.color])) ids.push(c.id) });
for(const id of ids){ const e=Get(id,{depth:0}).effect.map(x=>MAP[x.color]?Object.assign({},x,{color:MAP[x.color]}):x); Update(id,{effect:e}); }
```

## Semantic audit

Renaming is not enough. Nodes use whatever colour existed, not the one that means the right thing. Count usage per token grouped by node name to find the mismatches:

```py
use[tok] += 1; names[tok][node['name']] += 1   # then print the top node names per token
```

Findings that repeat across projects:

- Rating stars on a `warning` or accent colour. A rating is data, not a status (for example `color-icon-yellow`).
- Sale or promo badges on `warning`. Use a categorical family instead (a sale badge is the red family).
- Form errors and destructive actions on `warning`. They are `error`.
- Icons filled with `text-*` tokens. Use `icon-*`; systems separate them on purpose.
- Inset controls (search fields, steppers, summaries) filled with the page background. That is `background-muted`.
- Every stroke on `border-emphasized` while `border` goes unused. The default line has the wrong name.

## Choosing a token

Minting a new token is the tempting wrong answer, and owners push back on it. Values may be tuned to the brand; names may not. When the system has no obvious token, use one of its existing families.

Pale `background-<hue>` tokens are designed to sit on a surface and disappear on photography. For a badge over an image, invert the family's strong pair: `icon-<hue>` as the fill with `background-<hue>` as the label. Both flip in opposite directions between modes, so one definition stays legible in light and dark.

Text on an accent fill is always `on-accent`.

## Dark is not inverted light

Warm light backgrounds go to warm near-black, not grey. Saturated brand colours must lighten to survive on dark: a mid blue at `#235aa6` fails on near-black, `#7aa9e8` works. `on-accent` flips from white to near-black because the accent itself got lighter.

## Rename, not restyle

If the design's type scale or radius scale differs from the target system's, aligning them is a restyle: changing font sizes resizes every screen. Keep the design's own values, document the divergence on the foundations page and in the brand lock, and offer the alignment as a separate approved run.

## Integrity gate

A structural hash diff cannot see either failure: a dangling reference renders black and a literal hex cannot switch modes, yet both hash like legitimate edits. Fold this check into the repo's snapshot script so it exits 1:

```python
FLAGS = {'#00000000', ...}   # colours that must stay literal, e.g. flag artwork
known = set(doc.get('variables', {}))
def audit(o, key=None):
    if isinstance(o, str):
        if o.startswith('$') and o[1:] not in known: dangling[o[1:]] += 1
        elif key in ('fill','stroke') and o.startswith('#') and o not in FLAGS: literals[o] += 1
    elif isinstance(o, dict):
        for k, v in o.items(): audit(v, k)     # reaches `descendants`
    elif isinstance(o, list):
        for v in o: audit(v, key)
audit(doc['children'])
if dangling or literals: sys.exit(1)
```

Prove the gate works by running it against a known-broken commit and watching it fail, not only against the fixed file.

## Repairing a blackened file

The damaged file has lost the original values, so take them from the last good commit. Index that revision by node id, including ids nested inside `descendants`; instances nested inside another instance's override are unreachable from a top-level `children` walk. Restoring all override colours from the good revision is idempotent and safer than diffing for the black ones.

Apply the fix through the app (MCP `execute`), then flush. A raw-JSON fix alone gets reverted by autosave. Apply in three passes, because each shape fails the others:

- **Materialised override nodes** (the override object has its own `id`): `Get` will not visit them, but `Update(id, {fill: ..., stroke: ...})` works on the id directly.
- **Plain prop overrides**: `Update(instanceId, {descendants: {childKey: {prop: value}}})`. It merges.
- **Instances nested inside another instance's override**: found through the index above, then updated by one of the two shapes.

A plain prop map for a child key that pen considers materialised fails with `Node not found for override path: <id>`. The error means the shape is wrong, not that the node is missing: update that node by its own id.

## Keep the diff readable

When you rewrite the JSON in Python, match the original formatting:

```python
json.dump(d, f, ensure_ascii=False, indent=2); f.write('\n')
```

A compact dump collapses the whole file into one line and the diff becomes unreviewable (95,906 deletions in one observed commit).

## Verify

1. Structural gate (frame-tree hash diff) before and after, plus the integrity gate. Node counts stay unchanged except where you added documentation. Call the Skill tool with "pen-dev-gated-iteration" for the snapshot and diff scripts.
2. Screenshot a real screen in both modes, not only colour chips: chips hide contrast failures a real screen shows. `Update(id,{theme:{mode:'dark'}})`, shoot, set back to `{mode:'light'}`.
3. Check text on accent fills, badges over photos, and icon-sized uses of any colour picked for text contrast (dark yellow and orange tokens read as brown at 14 px).
4. Confirm light mode is visually unchanged: that is the mode that ships today.
5. Changing token values or a shared component reflows layout. If the file has a canvas of top-level frames, re-space it and measure every gap rather than trusting a screenshot.
