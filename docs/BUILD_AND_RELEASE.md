# Build and Release

## Overview

This app is built with [Tauri](https://tauri.app/) — a framework that wraps a web frontend
(SvelteKit) inside a native desktop application using Rust as the backend.

The result is a real desktop app: it has its own window, can use system APIs (global
shortcuts, clipboard, tray icon), and ships as a standard Linux package.

---

## How a Release Works (the big picture)

```
You push a git tag  →  GitHub Actions starts  →  Ubuntu runner builds the app
→  AppImage + RPM + DEB are produced  →  uploaded to GitHub Releases
→  dotfiles-sway script downloads and installs it on your Fedora machine
```

You never have to build the app locally to install it. Just tag, push, done.

---

## Local Development Commands

```sh
bun install           # install JavaScript dependencies
bun run typecheck     # type-check the TypeScript/Svelte code
bun run build:web     # build the SvelteKit frontend only (fast, no Rust)
bun run dev           # start the Tauri dev app with hot-reload
```

`build:web` and `typecheck` are the minimum checks before pushing any change.

### Full desktop build (inside Toolbox)

On Fedora Atomic (immutable system), Tauri builds run inside a Toolbox container
named `damianf` which has all the required C/Rust development libraries:

```sh
toolbox run --container damianf bash -c "
  cd /var/home/damian/whispering-open
  export WHISPER_DONT_GENERATE_BINDINGS=1
  bun run tauri build --bundles rpm,deb
"
```

`WHISPER_DONT_GENERATE_BINDINGS=1` skips regenerating Rust FFI bindings for
whisper.cpp — the pre-generated bindings ship with the crate, so this is safe
and much faster locally.

---

## CI/CD — GitHub Actions

### What is GitHub Actions?

GitHub Actions is GitHub's built-in automation system. You describe jobs in YAML
files under `.github/workflows/`. GitHub runs them automatically on a fresh virtual
machine every time a trigger fires (push, tag, manual click).

### What our workflow does

File: `.github/workflows/release.yml`

**Trigger:** either a git tag push (`v*`) or a manual "Run workflow" click on GitHub.

**Runner:** `ubuntu-24.04` — a fresh Ubuntu 24.04 virtual machine provided by GitHub,
thrown away after each run.

---

### Every Step Explained

When you watch a run on GitHub, you see these steps in the left panel. Here is what
each one does and **why** it is needed.

#### 1. Set up job

GitHub automatically sets up the runner — configures the virtual machine, mounts
filesystems, sets environment variables. You do not write any code for this step;
GitHub runs it before anything you define.

#### 2. Checkout

```yaml
uses: actions/checkout@v4
```

Clones your repository onto the runner's disk. Without this, the runner would be an
empty machine with no source code. Everything that follows depends on having the files.

#### 3. Install Linux system dependencies

```yaml
run: |
  sudo apt-get install -y libwebkit2gtk-4.1-dev ...
```

Tauri requires native C/C++ libraries that are not pre-installed on the runner.
These are split into groups by purpose:

| Package group | Why needed |
|---------------|-----------|
| `libwebkit2gtk-4.1-dev` | WebKit is the HTML rendering engine inside the Tauri window (like a built-in browser) |
| `libappindicator3-dev`, `librsvg2-dev` | System tray icon and SVG rendering |
| `patchelf` | Tool that rewrites ELF binary headers — used when packaging AppImage |
| `libssl-dev` | TLS/HTTPS support for network requests from the app |
| `libxdo-dev` | Simulates keyboard/mouse — used by the global hotkey feature |
| `libfuse2t64` | FUSE filesystem — required to run `.AppImage` files during the build |
| `file` | The `file` command — used by the AppImage bundler to identify binary types |
| `gstreamer1.0-*` + `gstreamer1.0-alsa` | Audio pipeline — used for microphone input (recording voice) |
| `libasound2-dev` | ALSA (Linux audio system) development headers — needed to compile the audio crate |
| LunarG PPA + `vulkan-sdk` | Vulkan GPU headers and `glslc` shader compiler — required because `whisper.cpp` enables Vulkan acceleration at compile time, even when no GPU is used at runtime |

> **Why install the Vulkan SDK for a voice app?**
> The `whisper.cpp` library (which does the speech recognition) uses a math library
> called GGML. GGML auto-enables GPU acceleration when it detects Vulkan support.
> Even if no GPU runs at runtime, the Vulkan headers must be present at *compile time*
> or the build fails. Ubuntu's default packages do not include `glslc` (the shader
> compiler), so we install the full LunarG SDK from their own package repository (PPA).

#### 4. Install Rust stable

```yaml
uses: dtolnay/rust-toolchain@stable
```

Downloads and installs the latest stable Rust compiler (`rustc`) and build tool
(`cargo`). The app's backend is written in Rust, so this is required before any Rust
code can be compiled. Using the `dtolnay/rust-toolchain` action (instead of a manual
install script) is the standard way to do this in CI — it is fast, reliable, and
always installs the exact version requested.

#### 5. Cache Rust build artifacts

```yaml
uses: Swatinem/rust-cache@v2
with:
  workspaces: './apps/whispering/src-tauri -> target'
```

Rust compilation is slow — the first full build takes 15–20 minutes because it
compiles every dependency from source (including `whisper.cpp` via CMake). The cache
step saves the compiled output (the `target/` folder) to GitHub's cloud storage after
each run. On the next run, if the `Cargo.lock` has not changed, the cached binaries
are restored and only changed files are recompiled, bringing the build down to ~3
minutes.

> Without caching, every single run would take 15+ minutes and use unnecessary
> compute resources.

#### 6. Install Bun

```yaml
uses: oven-sh/setup-bun@v2
with:
  bun-version: '1.3.3'
```

Installs [Bun](https://bun.sh/) — the JavaScript runtime and package manager used
by this project (instead of Node.js/npm). Bun runs the SvelteKit build and manages
all JavaScript/TypeScript dependencies.

#### 7. Install JavaScript dependencies

```yaml
run: bun install
```

Reads `bun.lock` (the lockfile) and downloads all JavaScript packages listed in
every `package.json` in the monorepo. This is the JS equivalent of `cargo fetch` —
it populates the local `node_modules/` folder that the SvelteKit build reads from.

#### 8. Build Tauri application

```yaml
run: bun run tauri build --bundles appimage,rpm,deb
env:
  TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
  TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
```

This is the main step. It runs three things in sequence:

1. **SvelteKit build** (`bun run build` inside `apps/whispering/`) — compiles the
   TypeScript/Svelte frontend into plain HTML + JS + CSS files in `build/`
2. **Rust compilation** (`cargo build --release`) — compiles the Tauri backend,
   whisper-rs, and all Rust dependencies into a native binary
3. **Bundling** — wraps the binary + frontend into:
   - `.AppImage` — universal Linux app, runs on almost any distro without installing
   - `.rpm` — package for Fedora/RHEL/openSUSE
   - `.deb` — package for Debian/Ubuntu

The `TAURI_SIGNING_PRIVATE_KEY` secret is used here to **sign** the AppImage with
your private key. The signature is embedded in `latest.json`, which the running app
checks when looking for updates. If the signature doesn't match the public key baked
into the app, the update is rejected — this prevents tampered updates from being
installed even if someone compromises GitHub or the CDN.

#### 9. Collect release artifacts

```yaml
run: |
  mkdir -p dist
  find apps/whispering/src-tauri/target/release/bundle \
    -type f \( -name '*.AppImage' -o -name '*.rpm' -o -name '*.deb' -o -name 'latest.json' \) \
    -exec cp {} dist/ \;
```

After the build, the output files are scattered across subdirectories
(`bundle/appimage/`, `bundle/rpm/`, `bundle/deb/`). This step copies them all into a
single flat `dist/` folder so the upload step has one place to look.

#### 10. Upload build artifacts

```yaml
uses: actions/upload-artifact@v4
with:
  name: linux-release-${{ github.sha }}
  path: dist/
  retention-days: 7
```

Uploads the contents of `dist/` to GitHub's artifact storage, attached to this
specific workflow run. You can download the files from the GitHub Actions run page
for 7 days — useful for testing a build before tagging a release. This step runs on
**every** run (tag push or manual trigger).

#### 11. Create GitHub Release

```yaml
if: startsWith(github.ref, 'refs/tags/') || ...
uses: softprops/action-gh-release@v2
with:
  tag_name: ...
  files: dist/*
  generate_release_notes: true
```

This step only runs when a **tag** was pushed (e.g. `v7.11.0-2`) or when the manual
trigger was given a tag name. It:

1. Creates a GitHub Release page at `github.com/.../releases/tag/v7.11.0-2`
2. Attaches all files from `dist/` as downloadable assets
3. Auto-generates release notes from commit messages since the last tag

The `GITHUB_TOKEN` secret is automatically available in every workflow — no setup
needed. It gives the action permission to create releases in your repository.

#### Post-steps (Checkout, Cache, Bun)

After the main steps finish, GitHub automatically runs cleanup for any action that
registered a post-step. The most important one is **Post Cache Rust build artifacts**
— this saves the newly compiled Rust output to the cache so the next run is faster.
The others just clean up temporary files.

---

### Why Ubuntu and not Fedora?

- AppImage requires FUSE, which is not available inside Toolbox containers
- GitHub's hosted runners are Ubuntu only (no Fedora option as of 2026)
- The resulting AppImage and RPM work on Fedora regardless of where they were built

### Why does the Rust build take ~15 minutes?

`whisper.cpp` (the local speech recognition library) is written in C++ and must be
compiled from source via CMake every time the Rust cache misses. Once cached,
subsequent runs that don't change Rust dependencies are much faster (~3 min).

### The Vulkan SDK requirement

`whisper.cpp`'s GGML library auto-detects GPU backends. On Linux it tries to use
Vulkan for hardware acceleration. Even when no GPU is used at runtime, the build
requires the Vulkan SDK headers and `glslc` (GLSL shader compiler) to compile.

We install the full [LunarG Vulkan SDK](https://www.lunarg.com/vulkan-sdk/) via their
Ubuntu PPA because Ubuntu's default repos do not ship `glslc`.

---

## Update Signing (Tauri Updater)

Tauri's built-in auto-updater requires every release to be cryptographically signed.
This prevents a compromised CDN or GitHub from delivering a malicious update.

**How it works:**

1. A keypair is generated once with `tauri signer generate`
2. The **private key** is stored as a GitHub Actions secret (`TAURI_SIGNING_PRIVATE_KEY`)
   — only GitHub Actions can see it, never committed to the repo
3. The **public key** is stored in `tauri.conf.json` (`plugins.updater.pubkey`)
   — this is public and ships with every release
4. At build time, Tauri signs the AppImage with the private key and writes `latest.json`
5. When the running app checks for updates, it downloads `latest.json`, verifies the
   signature with the public key, and only installs if valid

The key format is [minisign](https://jedisct1.github.io/minisign/) (Ed25519).
The `pubkey` field in `tauri.conf.json` is the base64-encoded content of the `.pub` file.

---

## How to Publish a Release

```sh
# 1. Bump version in two files:
#    apps/whispering/src-tauri/Cargo.toml  →  version = "X.Y.Z-N"
#    apps/whispering/src-tauri/tauri.conf.json  →  "version": "X.Y.Z-N"

# 2. Commit
git add apps/whispering/src-tauri/Cargo.toml apps/whispering/src-tauri/tauri.conf.json
git commit -m "Bump version to X.Y.Z-N"

# 3. Tag and push
git tag vX.Y.Z-N
git push origin main && git push origin vX.Y.Z-N
```

GitHub Actions picks up the tag, builds everything, and creates a GitHub Release
with AppImage + RPM + DEB + `latest.json` attached.

### Version format

`{upstream_version}.{our_build_number}` — e.g. `7.11.0-2`

- Upstream version tracks the original Whispering project version
- Build number increments for our own fixes/changes on top

---

## Release Checklist

- [ ] `bun run typecheck` passes (0 errors)
- [ ] `bun run build:web` passes
- [ ] Version bumped in `Cargo.toml` and `tauri.conf.json`
- [ ] `.githooks/pre-push` passes (gitleaks secret scan)
- [ ] Tag pushed → GitHub Actions run is green
- [ ] GitHub Release has: `.AppImage`, `.rpm`, `.deb`, `latest.json`
- [ ] `dotfiles-sway/scripts/setup-whispering-open.sh` can download and install the release

---

## Artifact Locations (after build)

```
apps/whispering/src-tauri/target/release/bundle/
├── appimage/   Whispering Open_X.Y.Z-N_amd64.AppImage
├── rpm/        Whispering Open-X.Y.Z-N-1.x86_64.rpm
└── deb/        Whispering Open_X.Y.Z-N_amd64.deb

dist/           (CI only — copied for GitHub Release upload)
├── *.AppImage
├── *.rpm
├── *.deb
└── latest.json (updater manifest — lists current version + download URLs + signatures)
```
