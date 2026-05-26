# Troubleshooting

## Blank Window Or WebKit Crash On Fedora Sway

Known working launcher environment from Damian's testing:

```sh
GDK_BACKEND=x11
WEBKIT_DISABLE_COMPOSITING_MODE=1
WEBKIT_DISABLE_DMABUF_RENDERER=1
LIBGL_ALWAYS_SOFTWARE=1
```

Do not remove this from `dotfiles-sway` integration until a newer build is tested without it.

## Upstream AppImage/RPM Problems

Upstream Whispering `7.11.0` AppImage and unpacked RPM were unreliable on Fedora Sway Atomic.

Use this repo's patched builds for future release assets.

## Web Build Is Not Desktop Release

`bun run build:web` proves the SvelteKit app builds. It does not prove the Tauri desktop binary works.

Desktop changes require Tauri verification.

## Global Shortcuts On Sway

Global shortcut behavior may differ between X11, Wayland, Sway, and desktop portals. Test on Damian's actual Sway session before claiming shortcut support.

## Local Model Downloads

Local transcription model links may still point to upstream Epicenter assets. Audit download URLs before publishing a release that claims local model support.

## Analytics And API Keys

Analytics settings and cloud provider API key inputs still exist. Review network behavior before claiming the app is fully local-only.
