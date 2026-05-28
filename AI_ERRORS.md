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

## Tray Icon and Hide-to-Tray — Verified Working (session 9)

Tray icon + hide-to-tray are fully working as of v7.11.0-4. The implementation is in:

- `apps/whispering/src/lib/services/desktop/tray.ts` — lazy-init TrayIcon, menu, icon sync
- `apps/whispering/src-tauri/src/lib.rs` — `CloseRequested` handler in `app.run()`
- `apps/whispering/src-tauri/capabilities/default.json` — `core:tray:default` permission required
- `apps/whispering/src-tauri/tauri.conf.json` — `bundle.resources` for `recorder-state-icons`

Required files on disk (alongside installed binary):
```
~/.local/opt/whispering-open/root/usr/lib/Whispering Open/recorder-state-icons/
  studio_microphone.png
  red_large_square.png
  arrows_counterclockwise.png
```

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

## GitHub Actions CI/CD — Lessons from Session 8

### GitHub Releases converts spaces to dots in asset filenames

When a file named `Whispering Open_7.11.0-2_amd64.AppImage` (with a space) is uploaded
to GitHub Releases, GitHub stores and serves it as `Whispering.Open_7.11.0-2_amd64.AppImage`
(space → dot). Any generated URL that uses `%20` or a literal space will return 404.

Fix: use `appimage_name.replace(' ', '.')` when constructing download URLs in `latest.json`.

### GITHUB_TOKEN needs `permissions: contents: write` to create releases

Without an explicit `permissions` block on the job, `GITHUB_TOKEN` may lack the right to
create GitHub Releases. Error message: `Resource not accessible by integration`.

Fix: add to the job definition:
```yaml
permissions:
  contents: write
```

### `generate_release_notes: true` requires `pull-requests: read`

`softprops/action-gh-release` with `generate_release_notes: true` calls the GitHub API
to auto-generate notes from pull request titles. Without `pull-requests: read` permission
this fails with `Resource not accessible by integration`. Since this is a personal project
without pull requests, just omit `generate_release_notes`.

### NEVER change the Tauri signing keypair — it permanently breaks auto-update for existing users

The Tauri auto-updater works by comparing the signature in `latest.json` against the public key
**baked into the running app binary**. If the signing keypair changes:

- New builds are signed with the new private key → `latest.json` has new signature
- Old running app has the old public key → verification fails
- Error: `The signature was created with a different key than the one provided`
- The only recovery is a **manual reinstall** — the auto-updater cannot fix itself

**The current keypair (set up in session 8, 2026-05-28) is permanent. Never regenerate it.**

Rules:
- `TAURI_SIGNING_PRIVATE_KEY` GitHub secret → never replace with a new key
- `plugins.updater.pubkey` in `tauri.conf.json` → never change
- If the private key is lost: generate new keypair, publish a new version, document that
  existing users must manually reinstall that one version, then future updates work again

The signing keypair is a one-way commitment: changing it requires a manual migration for every
existing installation.

### Tauri pubkey must be single-base64-encoded, not double-encoded

The `plugins.updater.pubkey` field in `tauri.conf.json` must contain the **raw base64 content**
of the `.pub` file — the file itself is already base64. Do not base64-encode the file again.

To verify: `cat file.pub | base64 -d` should decode to a readable string starting with
`untrusted comment: minisign public key`. If it decodes to binary garbage, the key is
double-encoded.

### `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` must be a GitHub secret, not hardcoded

Do not hardcode the password as an empty string (`''`) or any value in the workflow YAML.
Store it as a GitHub Actions secret and reference it as `${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}`.

### Vulkan SDK required for whisper.cpp on Ubuntu — use LunarG PPA

`whisper-rs-sys` explicitly enables `-DGGML_VULKAN=ON` at build time on Linux. This requires
the full Vulkan SDK including `glslc` (GLSL shader compiler). Ubuntu 24.04's default repos
do not ship `glslc`. Solution:

```yaml
- name: Install Linux system dependencies
  run: |
    wget -qO- https://packages.lunarg.com/lunarg-signing-key-pub.asc | sudo tee /etc/apt/trusted.gpg.d/lunarg.asc
    sudo wget -qO /etc/apt/sources.list.d/lunarg-vulkan-noble.list https://packages.lunarg.com/vulkan/lunarg-vulkan-noble.list
    sudo apt-get update
    sudo apt-get install -y vulkan-sdk
```

### Missing JS dependencies after deleting a shared package

When a shared workspace package (e.g. `packages/ui`) is deleted and its code is inlined,
its npm dependencies must also be manually added to `apps/whispering/package.json`. The
workspace `bun install` succeeds locally (stale node_modules), but CI fails with "module
not found" on a fresh install.

Fix: before deleting a package, run `grep -rh "from '"` across all its source files and
cross-check every external import against the app's `package.json`.

### `latest.json` is not auto-generated by `tauri build` — must be created manually

In Tauri v2, `tauri build` with `createUpdaterArtifacts: true` creates `.sig` signature
files but does NOT produce `latest.json`. That file must be generated separately in CI,
reading the version from `tauri.conf.json`, the signature from the `.sig` file, and
constructing the download URL from the tag and asset name (with spaces replaced by dots).

## SIGILL in Release Binary — Use Single match event with ref Patterns

`panic = "abort"` in `[profile.release]` converts Rust panics to `ud2` = SIGILL.
A `match &event { ... }` borrow followed by `match event { ... }` move in the same
scope compiled without error but caused SIGILL at runtime in the release binary.

Fix: consolidate into a single `match event` using `ref` to borrow inner fields:

```rust
// WRONG — compiles but SIGILLs in release mode
match &event { ... }
if condition { match event { ... } }

// CORRECT
match event {
    SomeVariant { ref field, .. } => { field.method(); }
    _ => {}
}
```

## Local Build Workflow — Always Test Locally Before CI

CI builds take 13 minutes (cold) or 5-8 minutes (warm cache). Use the local toolbox instead:

```sh
# Syntax check — 2.8 seconds
toolbox run --container damianf bash -c \
  "cd /var/home/damian/whispering-open/apps/whispering/src-tauri && cargo check"

# Full release binary — ~37 seconds Rust + 30s frontend
toolbox run --container damianf bash -c \
  "cd /var/home/damian/whispering-open/apps/whispering && bun run tauri build --bundles rpm"

# Install (no sudo needed)
cp --remove-destination \
  apps/whispering/src-tauri/target/release/whispering-open \
  ~/.local/opt/whispering-open/root/usr/bin/whispering-open
```

Push to CI only for final tagged releases (CI adds AppImage + signing).

**AppImage cannot be built in toolbox** — requires FUSE which toolbox containers lack.

## Running the App Does Not Rebuild It

Launching Whispering Open from the desktop entry or `Super+D` runs the currently
installed binary. It does not automatically rebuild from the latest source code.

Rules:

- Source changes become visible in the installed desktop app only after building
  and installing a new Tauri artifact.
- `bun run build:web` verifies the web frontend bundle, but it does not replace
  the installed desktop app by itself.
- `bun run dev` / Tauri dev mode can show current source during development, but
  that is not the same as the installed app launched from Sway.
- Before saying a runtime fix is installed, verify the exact launcher or desktop
  entry Damian uses.
