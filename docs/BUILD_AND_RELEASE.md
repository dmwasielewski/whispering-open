# Build And Release

## Local Verification

```sh
bun install
bun run typecheck
bun run build:web
.githooks/pre-push
```

`typecheck` and `build:web` are the minimum checks before pushing most changes.

## Desktop Development

```sh
bun run dev
```

This runs the Tauri development app from `apps/whispering`.

## Desktop Build

```sh
bun run tauri build
```

If local Tauri binding generation causes problems, the previously working local test used:

```sh
WHISPER_DONT_GENERATE_BINDINGS=1 bun run --cwd apps/whispering tauri build --no-bundle
```

## Linux Release Assets

`dotfiles-sway` can consume these formats from GitHub releases:

- AppImage
- RPM
- tar archive
- zip archive

Recommended first release asset:

```text
whispering-open-linux-x86_64.AppImage
```

Alternative:

```text
whispering-open-linux-x86_64.tar.gz
```

## Release Checklist

1. Confirm `main` is clean.
2. Run typecheck and web build.
3. Build a Linux desktop artifact.
4. Launch on Fedora Sway Atomic if possible.
5. Confirm app renders and navigation works.
6. Confirm settings page opens.
7. Confirm microphone/transcription path if claiming transcription support.
8. Run `.githooks/pre-push`.
9. Create GitHub release and upload asset.
10. Test `dotfiles-sway/scripts/setup-whispering-open.sh` against the release.

## Not Yet Guaranteed

- Windows 11 builds
- automatic updater
- renamed app identity/data migration
- fully local-only mode
- complete removal of Epicenter cloud/auth/sync dependencies
