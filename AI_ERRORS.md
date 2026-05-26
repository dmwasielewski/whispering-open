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

## Do Not Install Raw Cargo Builds As Desktop Releases

A raw `cargo build --release` binary is not a valid installed Tauri release for this app.

Observed failure:

- Installing the raw Rust binary caused the app window to show `Could not connect to localhost: Connection refused`.
- That happened because the binary expected the Tauri dev server instead of using a packaged frontend.

Rules:

- Use `bun tauri build` or another verified Tauri packaging path before replacing `~/.local/bin/whispering-open`.
- If a full AppImage build fails late in bundling, verify whether RPM/DEB artifacts and the release binary are valid before installing anything.
- Never replace Damian's working launcher with an unverified binary.
- After installing, launch the exact desktop entry used by `Super+D` and check that it renders the real app, not a localhost error page.

## One Change, One Test, Then Push

For this app, use a strict programmer/tester workflow:

1. Make one small behavior change.
2. Run the smallest relevant static checks.
3. Build the exact artifact that will be installed.
4. Install or launch only that artifact.
5. Verify it on Damian's Fedora Sway session.
6. Update documentation with the result.
7. Run `.githooks/pre-push`.
8. Push only after the tested behavior works.

Do not combine risky desktop behavior changes with launcher cleanup, packaging changes, or dependency cleanup in the same commit.

## Do Not Reintroduce Minimize To Tray Without Runtime Testing

The first minimize-to-tray attempt was reverted because it was not verified end-to-end before being installed and pushed.

Future tray work must be done in smaller steps:

- First verify the existing tray icon appears in Waybar.
- Then test a simple explicit `Hide` action without intercepting window close.
- Only after that test close-request interception.
- Keep `Quit` in the tray as the only real app exit path.
- Do not push tray behavior until Damian confirms the installed app can hide, restore, and quit correctly.

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
