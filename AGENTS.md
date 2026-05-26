# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project

This is `whispering-open`: Damian's standalone extraction of Whispering from Epicenter.

The product is `apps/whispering`. Everything else exists only because the app still needs shared workspace packages while it is being separated from Epicenter.

## Required Reading

Before changing files, read:

1. `README.md`
2. `AI_GUIDE.md`
3. `AI_ERRORS.md`
4. `PROJECT_STRUCTURE.md`
5. `docs/FUNCTIONALITY.md`
6. `DAMIAN_NOTES.md`

## Hard Rules

- Keep repository files, documentation, code comments, commit messages, and release notes in English. User-facing conversation with Damian may be Polish, but project artifacts stay English.
- Keep the app buildable after each commit.
- Check `docs/FUNCTIONALITY.md` before removing, keeping, or deferring inherited Epicenter functionality.
- Do not bypass `.githooks/pre-push`.
- Do not commit secrets, API keys, auth tokens, private logs, local app data, or user recordings.
- Preserve AGPL/license files.
- Do not remove `apps/api` or shared packages until `bun run typecheck` and `bun run build:web` pass without them.
- Do not replace the current working Fedora Sway crash workaround without testing on Damian's Sway setup.
- Do not push partial work unless Damian explicitly asks.

## Normal Workflow

```sh
bun install
bun run typecheck
bun run build:web
.githooks/pre-push
git status --short --branch
```

For code changes affecting desktop behavior, also build or run the Tauri app when feasible.

## Edit Scope

Prefer changes in this order:

1. `apps/whispering` for product behavior.
2. `packages/*` only when required by Whispering.
3. root workspace files for scripts/build metadata.
4. documentation files in the same commit as behavior changes.

Avoid broad package renames or monorepo flattening unless the previous step is already verified.

## Public Release Constraint

`dotfiles-sway` downloads release assets from `dmwasielewski/whispering-open`. Release assets should be Linux-friendly first, then Windows later.
