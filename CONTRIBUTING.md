# Contributing

This project is in an extraction phase.

## Before You Start

Read:

- `README.md`
- `AGENTS.md`
- `AI_GUIDE.md`
- `AI_ERRORS.md`
- `docs/EXTRACTION.md`
- `docs/ARCHITECTURE.md`

## Change Rules

- Keep changes small.
- Keep build verification tied to each meaningful change.
- Update documentation in the same change when behavior or workflow changes.
- Do not remove temporary packages without proving they are unused.
- Do not change Tauri identity, updater endpoints, package scopes, or app data paths in drive-by commits.

## Verification

Minimum:

```sh
bun run typecheck
bun run build:web
.githooks/pre-push
```

For desktop changes, also run a Tauri dev/build check when feasible.

## Commit Style

Use direct, descriptive commit messages:

```text
Document extraction workflow
Remove unused API package dependency
Fix Sway navigation crash
```

Do not include unrelated local changes in the same commit.
