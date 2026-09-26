---
name: vscode-theme-to-zed
description: Port a VS Code or Cursor color theme extension to Zed as a local theme family JSON. Use when the user wants a VS Code, Cursor or Windsurf theme in Zed.
---

# VS Code theme to Zed

1. Locate the extension. Check `~/.vscode/extensions` and the `extensions` folders under `.cursor`, `.vscode-insiders` and `.windsurf` in the home folder. Themes are listed in `package.json` `contributes.themes[]` (`label`; `uiTheme`: `vs`/`hc-light` = light, else dark; `path`).
2. Zed's importer is not a shipped CLI command. Write a small Python converter that produces one family file:
   `{"$schema":"https://zed.dev/schema/themes/v0.2.0.json","name","author","themes":[{"name","appearance","style"}]}`.
   Call the Skill tool with "scratchpad" and keep the converter there, taking `<extension dir> <output json>` as arguments, so it can be rerun for other themes.
3. UI mapping: each Zed key maps to an ordered list of VS Code `colors` keys (first present wins). Key pairs: `background` from sideBar.background, `editor.background`, `editor.active_line.background` from editor.lineHighlightBackground, `element.hover` from list.hoverBackground, `element.selected` from list.activeSelectionBackground, `text` from foreground, `text.muted` from descriptionForeground, `status_bar/title_bar/tab_bar/tab.*`, `terminal.ansi.{color}` / `bright_{color}` from terminal.ansi{Cap}/ansiBright{Cap}, `error/warning/info/hint`, `created/modified/deleted` from gitDecoration.*, `version_control.*` from editorGutter.*. Set `border.transparent` and `ghost_element.background` to `#00000000`.
4. Syntax: flatten `tokenColors` (a scope may be a comma-separated string or an array), then pick the longest-prefix match on simple selectors for each Zed capture (comment, keyword, string, function, type, constant, property, variable, tag, attribute, punctuation.*, title, link_uri, and so on). `fontStyle` italic becomes `font_style: "italic"`; bold becomes `font_weight: 700`.
5. Build `players[0]` from editorCursor.foreground and editor.selectionBackground; build extra players and `accents` from `editorBracketHighlight.foreground1..6`.
6. Write to `~/.config/zed/themes/<name>.json` (hot-reloaded). Validate that every color string matches `^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$`, and grep `~/Library/Logs/Zed/Zed.log` for theme errors.
7. Tell the user the limits: semanticTokenColors and descendant-scope rules are not ported, and tree-sitter captures are coarser than TextMate scopes.
