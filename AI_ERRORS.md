# AI_ERRORS.md

Known mistakes, traps, and decisions for AI agents. Add to this file when a real lesson is learned.

## Do Not Automate Upstream Whispering Binaries

Upstream Whispering `7.11.0` AppImage and unpacked RPM were tested on Damian's Fedora Sway Atomic setup.

Observed problems:

- AppImage opened a blank white/light window.
- RPM binary rendered further but crashed or froze on interaction.
- WebKitGTK/Mesa crash paths appeared in coredumps.

Decision:

- Do not base automation on upstream AppImage/RPM binaries.
- Use this repo's patched `whispering-open` builds for future releases.

## Fedora Sway WebKit Workaround

The local source build became usable after two important UI/navigation changes:

- removed the global SvelteKit `onNavigate(...)` / `document.startViewTransition(...)` wrapper from `apps/whispering/src/routes/+layout.svelte`
- changed main sidebar navigation in `apps/whispering/src/routes/(app)/_components/VerticalNav.svelte` from direct `<a href=...>` links to `goto(...)` button navigation

Do not revert these without testing on Damian's actual Sway/WebKitGTK environment.

Launcher environment used by `dotfiles-sway`:

```sh
GDK_BACKEND=x11
WEBKIT_DISABLE_COMPOSITING_MODE=1
WEBKIT_DISABLE_DMABUF_RENDERER=1
LIBGL_ALWAYS_SOFTWARE=1
```

## Gitleaks Test Fixture False Positives

`gitleaks` flagged deterministic test fixtures named `keyBytesBase64` in auth/encryption tests.

Resolution:

- `.gitleaks.toml` allowlists only those pinned test fixture paths and only matches containing `keyBytesBase64`.
- Do not weaken the pre-push hook.
- Do not add broad allowlists.

## Do Not Remove Temporary Workspace Packages Blindly

`apps/api` and packages such as `auth`, `server`, `sync`, and `billing` are undesirable long term, but some are currently pulled through workspace dependency chains.

Before removing any local package:

1. check `package.json` workspace dependencies
2. check imports with `rg '@epicenter/'`
3. run `bun install`
4. run `bun run typecheck`
5. run `bun run build:web`

## Do Not Rename Tauri Identifier Early

The current Tauri identifier is still upstream:

```text
com.bradenwong.whispering
```

Rename it only in a dedicated change that also handles app data migration, release identity, desktop launcher behavior, and documentation.

## Do Not Claim Desktop Tray Runtime Until Tested

Minimize-to-tray behavior is implemented in the desktop app, but runtime behavior must be tested on Fedora Sway before claiming it is fully verified.

Expected behavior:

- sidebar `Minimize to Tray` hides the main window
- window-manager close requests hide the main window
- Waybar tray icon restores the window
- tray menu `Quit` exits the process

As of 2026-05-25, `bun run typecheck` and `bun run build:web` pass. Full `cargo check` is blocked by existing local toolchain/dependency issues: missing `cc` on the host, and a `whisper-rs` binding mismatch inside toolbox.

## Public Repo Means No Private Runtime Data

Never commit:

- `~/.local/share/com.bradenwong.whispering`
- `~/.local/share/whispering`
- `~/.cache/whispering`
- recordings or transcripts
- API keys
- local model downloads
- `.env` files

## Release Assets Must Match dotfiles-sway

`dotfiles-sway` expects GitHub release assets from `dmwasielewski/whispering-open` and prefers Linux assets with names matching:

```text
linux|x86_64|amd64|appimage|rpm|tar|zip
```

If release asset naming changes, update `dotfiles-sway/scripts/setup-whispering-open.sh` or document the required override.
