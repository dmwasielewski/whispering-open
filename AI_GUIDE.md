# AI Guide

This repo is a staged extraction of `apps/whispering` from Epicenter.

## Rules

- Preserve a working build at each step.
- Treat `apps/whispering` as the product surface.
- Treat `apps/api` and nonessential shared packages as temporary dependencies to remove only after verification.
- Do not remove license files.
- Do not rename package scopes or Tauri identifiers until build/typecheck passes in the extracted repo.
- Prefer small commits: copy/extract, verify, then simplify.

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
