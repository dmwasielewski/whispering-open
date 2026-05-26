# Architecture

This file is an index. Do not duplicate the detailed upstream architecture docs unless they become stale.

## Product App

Main app:

```text
apps/whispering
```

Useful existing docs:

- `apps/whispering/ARCHITECTURE.md`
- `apps/whispering/src/lib/services/README.md`
- `apps/whispering/src/lib/query/README.md`
- `apps/whispering/src/lib/state/README.md`
- `apps/whispering/src/lib/services/transcription/README.md`

## Layer Boundaries

Expected direction:

- Services perform platform/API work and should return typed results.
- Query layer coordinates services and maps failures into app-facing errors.
- State files hold persisted/reactive state.
- Svelte components should stay mostly UI-focused.

Do not move business logic into Svelte components just to remove a package faster.

## Desktop Shell

Tauri files:

```text
apps/whispering/src-tauri
```

Important responsibilities:

- desktop permissions
- global shortcuts
- tray integration
- local recording path
- bundle metadata
- updater config

## Known Architecture Debt

- `@epicenter/*` package scopes remain.
- Some cloud/auth/sync packages may be unused at runtime but still present through workspace dependency chains.
- Updater and release metadata should point at Whispering Open releases.
- Analytics settings and Aptabase integration still exist and need review.
- Local model/download URLs may still point at upstream release assets.
