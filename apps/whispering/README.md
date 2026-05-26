# Whispering Open App

Whispering Open is a desktop/web speech-to-text app built with Svelte 5 and Tauri.

The app lets you press a shortcut, speak, transcribe audio, optionally transform the text with AI, and paste or copy the result. This repository is a standalone extraction intended to remove old workspace-specific cloud, billing, account, sync, analytics, and branding code in small verified steps.

## Current Status

- The product name is `Whispering Open`.
- The Linux desktop binary is `whispering-open`.
- The Tauri identifier is `io.github.dmwasielewski.whisperingopen`.
- The app still uses some local workspace packages with `@epicenter/*` names. Those are technical dependencies and should be removed only after replacing the imports safely.
- Some local model downloads still use upstream release assets until equivalent assets are published under this repository.

## Development

Run commands from the repository root unless a task specifically requires this directory.

```sh
bun install
bun run typecheck
bun run build:web
bun run tauri build --bundles rpm
```

For local desktop development:

```sh
cd apps/whispering
bun run tauri dev
```

## Architecture

The app follows a three-layer pattern:

- Service layer: platform-specific and platform-neutral business logic.
- Query layer: TanStack Query wrappers, state, and error conversion.
- UI layer: Svelte routes and components.

Keep business logic out of Svelte components where possible. Services should return typed `Result<T, E>` values, and the query layer should convert service errors into the app's UI error type.

## Branding Rules

Use `Whispering Open` for user-facing product text, window titles, documentation, release notes, and installer text.

Do not mechanically rename technical symbols such as `WhisperingError`, `WhisperingErr`, `WhisperingRecordingState`, `WhisperingSoundNames`, `openWhispering`, or `whisperingKv` unless you are intentionally doing a dedicated internal API rename with a full typecheck.

## Release Notes

Public releases should be produced from this repository and consumed by Damian's `dotfiles-sway` automation. Pushes must go through the configured pre-push hook, which runs `gitleaks`.

## License

This app is based on AGPL-3.0-or-later upstream code. Keep license notices intact and publish source changes when distributing builds.
