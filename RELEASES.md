# Releases

`dotfiles-sway` installs Whispering Open from GitHub releases in this repository.

Repository:

```text
https://github.com/dmwasielewski/whispering-open
```

## Required Asset Shape

The `dotfiles-sway` installer currently accepts these release asset formats:

- `.AppImage`
- `.rpm`
- `.tar.gz`, `.tar.xz`, `.tar.bz2`, `.tgz`
- `.zip`

Linux asset names should include searchable terms such as:

```text
linux
x86_64
amd64
appimage
rpm
tar
zip
```

Example names:

```text
whispering-open-linux-x86_64.AppImage
whispering-open-linux-x86_64.tar.gz
whispering-open-7.11.0-1.x86_64.rpm
```

## Current Build Commands

Web build:

```sh
bun install
bun run typecheck
bun run build:web
```

Desktop development:

```sh
bun run dev
```

Desktop build:

```sh
bun run tauri build
```

If Tauri binding generation causes local issues, the previous working source-build test used:

```sh
WHISPER_DONT_GENERATE_BINDINGS=1 bun run --cwd apps/whispering tauri build --no-bundle
```

## Release Checklist

Before publishing a release:

1. run `bun run typecheck`
2. run `bun run build:web`
3. build the Linux desktop artifact
4. launch on Fedora Sway Atomic if possible
5. confirm the app renders, navigation works, and settings open
6. confirm microphone recording/transcription path if the release claims it
7. run `.githooks/pre-push`
8. tag/release on GitHub
9. ensure the asset can be downloaded by `dotfiles-sway/scripts/setup-whispering-open.sh`

## Do Not Claim Support Prematurely

Windows release support is planned later. Do not document Windows as working until a Windows 11 build and install have been tested.
