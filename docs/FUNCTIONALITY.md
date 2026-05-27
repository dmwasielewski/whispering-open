# Whispering Open Functionality Scope

This document is the product contract for Whispering Open while it is being extracted from Epicenter.

Use it before removing code, renaming packages, changing settings, touching release automation, or deciding whether an inherited Epicenter feature should stay.

## Product Goal

Whispering Open is a standalone desktop-first speech-to-text application.

The app should let Damian start recording quickly, transcribe speech, optionally transform the text with AI, and place the result where he needs it. It should work reliably on Fedora Sway Atomic first, with Windows support later.

## Core Features To Keep

These features define the app and should remain unless Damian explicitly changes the product direction.

- Desktop speech recording.
- Manual recording mode.
- Voice activated recording mode, if it works reliably.
- Uploading an audio file for transcription.
- Local and cloud transcription providers.
- API key settings for user-owned providers.
- Local model support where already implemented and practical to maintain.
- Text transformations using AI providers.
- Copying, pasting, or inserting the resulting text.
- Recording history.
- Recording metadata and transcripts.
- Configurable recording device and output folder.
- Configurable keyboard shortcuts.
- Global shortcut support on desktop.
- Local shortcut support inside the app window.
- Sound feedback settings.
- Privacy and analytics settings, with analytics easy to disable or remove.
- Tauri desktop packaging.
- GitHub release distribution.
- Fedora Sway Atomic install integration through `dotfiles-sway`.

## Desktop Behavior To Preserve

These behaviors matter for Damian's daily workflow.

- The app launches from Damian's Sway launcher as `whispering-open`.
- The user-facing product name is `Whispering Open`.
- The app should remain usable under Damian's current Fedora Sway/WebKitGTK workaround.
- Closing, hiding, minimizing, tray behavior, and autostart must be changed only after direct runtime testing on Fedora Sway.
- The app must not show a blank white window or a localhost connection error in the installed desktop build.
- A tested local binary should be installed only after a successful Tauri build path has produced a valid packaged frontend.

## Features To Remove Or Avoid

These features came from Epicenter or upstream product direction and are not part of Damian's desired standalone app unless explicitly re-approved.

- Epicenter billing.
- Epicenter credits.
- Epicenter subscription plans.
- Epicenter hosted dashboard.
- Epicenter account management as a required app feature.
- Cloud-only login requirements.
- Forced sync to Epicenter services.
- Hosted Epicenter control plane integration.
- Marketing site code.
- PostHog reverse proxy infrastructure.
- Unrelated Epicenter apps.
- Any dependency on paid Epicenter services for normal local desktop use.
- Any release or update path that points to upstream Epicenter instead of `dmwasielewski/whispering-open`.

## Temporary Dependencies

These pieces may remain only because the current build still needs them.

- `@epicenter/ui`
- `@epicenter/svelte`
- `@epicenter/workspace`
- other `packages/*` copied from the original workspace

Before removing or replacing any temporary dependency:

1. Check direct imports with `rg`.
2. Check workspace package dependencies.
3. Remove the smallest dependency edge first.
4. Run `bun install` if package metadata changed.
5. Run `bun run typecheck`.
6. Run `bun run build:web`.
7. For desktop-facing changes, build and launch the Tauri app on Fedora Sway.

## Deferred Decisions

These are known questions. Do not solve them accidentally inside unrelated changes.

- Whether updater signing should be enabled for public releases.
- How GitHub release auto-update should work.
- Whether analytics should be removed entirely or kept as an opt-in local setting.
- Whether the app should hide to tray on close.
- Whether autostart should open a window or start hidden in tray.
- When to rename the Tauri identifier from the upstream value.
- How to migrate existing app data when the Tauri identifier changes.
- Whether to flatten the workspace into a single app package.
- Which local transcription models should be officially supported.
- How Windows packaging should be produced.

## Decision Rules

When a feature is unclear, classify it before coding:

- Keep if it directly supports recording, transcription, text transformation, history, settings, desktop shortcuts, packaging, or Damian's install flow.
- Remove if it exists only for Epicenter billing, hosted accounts, hosted control plane, unrelated apps, or marketing.
- Defer if removing it could break build, data storage, shortcuts, packaging, or Fedora Sway runtime behavior.
- Document the decision in this file or `AI_ERRORS.md` when the lesson is operational.

## Verification Rules

For functionality changes:

- One behavior change per commit.
- Run the smallest relevant static check.
- Run `bun run typecheck` for Svelte/TypeScript changes.
- Run `bun run build:web` for UI or routing changes.
- Build and launch Tauri for desktop behavior changes.
- Verify the installed app, not only the source tree.
- Push only through the configured pre-push hook.

## Current Known Product State

As of 2026-05-26:

- The repository is public at `dmwasielewski/whispering-open`.
- The product name is `Whispering Open`.
- The app is still a mini-workspace, not a fully flattened standalone package.
- Fedora Sway local runtime uses a launcher workaround for WebKitGTK/Mesa stability.
- GitHub release installation is expected to be consumed by `dotfiles-sway`.
- Updater signing is not configured for local builds because `TAURI_SIGNING_PRIVATE_KEY` is intentionally not stored in the repo.
