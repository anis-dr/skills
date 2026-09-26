---
name: logo-surface-board
description: "Judge AI-generated logo candidates by rendering them on the surfaces that decide a mark (favicon sizes, reversed, app tile, nav lockup, mock product pages) in a switchable HTML board, rather than on the generator's 2K canvas. Use when a user must pick between generated logo marks."
---

# Logo candidates on surfaces board

The generator's 2K preview flatters every candidate; small-size and reversed rendering is what kills marks.

## Procedure

1. Generate 3 candidates with identical params from a vector-capable image model (e.g. Recraft V4.1 with `--model_type vector`, `--colors @colors.json`, `--background_color`, 1:1, 2k). Run them in parallel (e.g. a `ThreadPoolExecutor` calling the generator CLI). If you generate through Higgsfield, call the Skill tool with "higgsfield-generate". If "higgsfield-generate" isn't installed, ask the user to run npx skills add higgsfield-ai/skills --skill higgsfield-generate, then continue.
2. Audit each SVG deterministically: `re.findall(r'fill="(rgb\([^)]*\))"')`. If the mark fill is not the locked hex, repair the fill token only (`re.sub` on non-background fills). Never regenerate for a colour miss; regenerate only for geometry.
3. Rasterize 32px and 120px with `rsvg-convert`; build a strip with `magick ... ( 32px -filter point -resize 400% ) +append` and LOOK at it. Marks that turn into UI icons (link chain, cog, viewfinder, bucket) at 32px are dead regardless of the 2K render.
4. Crop each mark to a transparent square viewBox: drop `<metadata>` and the first background-filled path, rasterize, `magick -trim -format '%w %h %X %Y'`, pad 8%, rewrite `viewBox`, remove width/height, set `preserveAspectRatio="xMidYMid meet"`.
5. Write one throwaway `index.html` with an `<article data-mark>` per candidate: primary, reversed (CSS `.rev .mark path{fill:bg}`), app tile, 16/24/32/48 favicons, nav lockup with the wordmark (plus the second-script wordmark, e.g. Arabic, when the brand uses one), and mock home + product-detail pages in the brand palette. A fixed bottom bar switches via `?mark=` search param.
6. Serve with `python3 -m http.server <port> --directory <dir>` as a background process. Open it in a dedicated browser tab and keep that tab's id; target that tab on every later browser command so another agent session sharing the worktree is not disturbed. Verify with an evaluate in the page: shown article, svg count, none zero-size, no overflowX, bar text. Then screenshot that tab.
   - With Orca's browser: `orca tab create --url ... --json` returns a `browserPageId`; pass `--page <id>` on every later `orca eval` and `orca screenshot`. If "orca-cli" isn't installed, ask the user to run npx skills add stablyai/orca --skill orca-cli, then continue.
7. Commit the board to `prototype/<name>` from a temp worktree, push, remove the worktree, and post a table (mark, mechanism, 32px verdict, SVG links, branch link) on the ticket. Stop for the human's pick; never self-approve.

## Gotchas

- A retried mechanism that fails twice is retired, kept on the board labelled retired.
- Four-corner marks with a busy centre have failed at 32px in every round; do not propose again without a simplified centre.
- Recraft sometimes ignores the colour lock; that is a fill-token repair, not a defect in the mark.
