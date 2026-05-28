# Build Linux

## Prerequisites

The desktop build requires Rust and system libraries (webkit2gtk, gtk3, gstreamer, libappindicator).
On Fedora Atomic (immutable), build inside a Toolbox container with devel packages installed.

Container used for local builds: `damianf` (Fedora 44 Toolbox with all Tauri devel dependencies).

## Web-only build (no Tauri)

```sh
bun install
bun run typecheck
bun run build:web
```

## Desktop build (inside `damianf` toolbox)

```sh
toolbox run --container damianf bash -c "
  cd /var/home/damian/whispering-open
  export WHISPER_DONT_GENERATE_BINDINGS=1
  bun run tauri build --bundles rpm,deb
"
```

This produces:
- `apps/whispering/src-tauri/target/release/whispering-open` — binary
- `apps/whispering/src-tauri/target/release/bundle/rpm/Whispering Open-7.11.0-1.x86_64.rpm`
- `apps/whispering/src-tauri/target/release/bundle/deb/Whispering Open_7.11.0_amd64.deb`

## AppImage

AppImage bundling requires FUSE, which is not available inside Toolbox containers.
Build AppImage in CI (GitHub Actions on Ubuntu) where FUSE is supported.

For local testing, install from the RPM:

```sh
sudo rpm-ostree install ./apps/whispering/src-tauri/target/release/bundle/rpm/Whispering\ Open-7.11.0-1.x86_64.rpm
```

## Release artifact

For Fedora Sway Atomic, the RPM is the primary release format.
The `dotfiles-sway/scripts/setup-whispering-open.sh` can install from RPM, AppImage, or tar.gz.
