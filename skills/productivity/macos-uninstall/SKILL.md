---
name: macos-uninstall
description: "Completely uninstall a macOS app (Homebrew cask or manual install), including support dirs, caches, prefs and the stray CLI symlinks that brew leaves behind. Use when the user wants an app fully removed from a Mac, not just its bundle."
---

# macOS uninstall

Goal: remove every artifact of an app, not just the bundle. `brew uninstall --cask` is **not** sufficient unless the cask declares a `zap` stanza.

## 1. Inventory before removing

Run one combined probe so you know what actually exists (never guess paths):

```bash
APP=Zed   # bundle-name fragment
BID=zed   # bundle-id / dir-name fragment

brew list --cask 2>/dev/null | grep -i "$BID"
which "$BID" 2>/dev/null; readlink "$(which "$BID" 2>/dev/null)"
ls -d /Applications/*"$APP"* ~/Applications/*"$APP"* /opt/homebrew/Caskroom/*"$BID"* 2>/dev/null
ls -d ~/.config/"$BID" \
      ~/Library/Application\ Support/*"$APP"* \
      ~/Library/Caches/*"$APP"* \
      ~/Library/Logs/*"$APP"* \
      ~/Library/Preferences/*"$BID"* \
      ~/Library/Saved\ Application\ State/*"$BID"* \
      ~/Library/HTTPStorages/*"$BID"* 2>/dev/null
ls ~/Library/LaunchAgents /Library/LaunchAgents /Library/LaunchDaemons 2>/dev/null | grep -i "$BID"
pgrep -fl "$APP"
```

Size the support tree with `du -sh`. It is routinely far larger than the app, and its size is the honest headline for the user.

## 2. Check whether the cask self-cleans

```bash
brew cat --cask <name> | sed -n '/zap/,$p'
```

- **Output non-empty**: `brew uninstall --zap --cask <name>` does the whole job. Stop here.
- **Empty**: the cask only removes the app, its Caskroom entry and linked binaries. Continue to step 4.

## 3. Quit the app first

Run `pgrep -fl "$APP"`. Removing files under a running app leaves it rewriting state on exit. Filter carefully: other Electron apps (Cursor, VS Code) match loose patterns.

## 4. Uninstall, then sweep leftovers

```bash
brew uninstall --cask <name>          # or: rm -rf "/Applications/<App>.app"
rm -f /usr/local/bin/<cli>            # manual "install CLI" symlinks brew never made
rm -rf ~/.config/<name> \
       ~/Library/Application\ Support/<App> \
       ~/Library/Caches/<App> \
       ~/Library/Logs/<App> \
       ~/Library/Preferences/<bundle-id>*.plist
```

Only pass paths that step 1 actually printed.

## 5. Back up small hand-authored config first

Settings and keymaps are usually a few hundred KB and expensive to recreate, while caches and language servers are gigabytes of re-downloadable data. Cheap insurance:

```bash
tar -czf ~/<name>-config-backup-$(date +%Y%m%d).tar.gz -C ~/.config <name>
```

Tell the user the path and the one-line restore command. Skip only if they explicitly want zero trace.

## 6. Verify, then report

Re-run the step-1 probe verbatim. Every section must print nothing. Report as a table of artifact and action, plus the total space reclaimed.

## Gotchas

- **Editor CLI shims live outside Homebrew's prefix.** Apps with an "Install CLI in PATH" command drop symlinks in `/usr/local/bin`; `brew uninstall` leaves them dangling. `/usr/local/bin` is often world-writable, so no `sudo` is needed. Check `ls -ld` rather than assuming.
- **Stale prefs reveal a second channel.** A `dev.foo.Foo.plist` next to `dev.foo.Foo-Preview.plist` means stable *and* preview were installed; sweep both bundle IDs.
- **`--zap` is destructive and unprompted.** It deletes user data with no confirmation, so only reach for it after the user has asked for a *complete* removal.
- Auto-updating casks (`auto_updates true`) may have a version on disk newer than the Caskroom record. Uninstall still works, but do not trust `brew info` for the on-disk version.
