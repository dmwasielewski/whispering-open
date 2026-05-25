# AI Guide

This repo is a staged extraction of `apps/whispering` from Epicenter.

Whispering Open should become a standalone speech-to-text desktop app that Damian can build, release, and install automatically from `dotfiles-sway`. The current code still carries Epicenter workspace structure and naming. That is expected at this stage.

## Rules

- Keep all repository artifacts in English: documentation, code comments, commit messages, issue notes, release notes, and user-facing app text unless there is an intentional localization change.
- Preserve a working build at each step.
- Treat `apps/whispering` as the product surface.
- Treat `apps/api` and nonessential shared packages as temporary dependencies to remove only after verification.
- Do not remove license files.
- Do not rename package scopes or Tauri identifiers until build/typecheck passes in the extracted repo.
- Always use the configured `.githooks/pre-push` hook before pushing. It runs `gitleaks detect --source . --redact --verbose`. Do not bypass it.
- Prefer small commits: copy/extract, verify, then simplify.
- Update documentation in the same change when behavior, build, release, packaging, or project direction changes.
- Keep `dotfiles-sway` integration in mind: releases from this repo are consumed by `scripts/setup-whispering-open.sh` there.
- Public repo rule: assume every commit is visible and permanent. Do not commit secrets, local tokens, private logs, or user data.

## Priority Order

1. Keep the current app buildable.
2. Keep Fedora Sway Atomic desktop behavior working.
3. Remove Epicenter dependencies in small reversible steps.
4. Rename/brand after technical dependencies are understood.
5. Add release automation only after local desktop builds are proven.

## Verified Commands

As of 2026-05-25:

```sh
bun install
bun run typecheck
bun run build:web
```

`typecheck` and `build:web` pass. Svelte reports upstream warnings, but no errors.

## Current Extraction Notes

The app currently still imports:

- `@epicenter/ui`
- `@epicenter/svelte`
- `@epicenter/util`
- `@epicenter/constants`
- `@epicenter/workspace`

`@epicenter/svelte` depends on `@epicenter/api`, so `apps/api` is present for workspace completeness. A good next step is to split only the Svelte helpers that Whispering actually uses and then remove `apps/api`.

## Documentation Contract

- `AGENTS.md`: short operational rules for AI agents.
- `AI_GUIDE.md`: current strategy and verified commands.
- `AI_ERRORS.md`: mistakes already learned the hard way.
- `DAMIAN_NOTES.md`: chronological project notes and decisions.
- `PROJECT_STRUCTURE.md`: what each folder is for.
- `RELEASES.md`: how GitHub releases should be produced and consumed.
