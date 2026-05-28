# Project Structure

This repository is a staged extraction. It is intentionally not fully clean yet.

## Product App

```text
apps/whispering
```

The user-facing app: SvelteKit frontend plus Tauri desktop shell.

Important areas:

- `src/routes` - app pages and layouts.
- `src/lib/services` - platform services for recording, transcription, clipboard/text delivery, notifications, analytics, and desktop integration.
- `src/lib/state` - reactive app state.
- `src/lib/components` - app-level UI components.
- `src-tauri` - Rust/Tauri desktop application.

## Shared Packages

No remaining shared packages. All UI components and utilities are owned by `apps/whispering`:

- `apps/whispering/src/lib/ui/` — UI components (was `packages/ui`, `@whispering-open/ui`)
- `apps/whispering/src/lib/utils/svelte-utils/` — Svelte helpers (inlined earlier)
- `apps/whispering/src/lib/utils/workspace/` — Yjs/IndexedDB helpers (inlined earlier)

## Root Files

- `package.json` - workspace scripts and catalog versions.
- `bun.lock` - dependency lockfile.
- `turbo.json` - task graph.
- `biome.jsonc` - formatting/lint rules.
- `.githooks/pre-push` - gitleaks secret scan.
- `.gitleaks.toml` - narrow test fixture allowlist.

## Documentation Files

- `README.md` - human overview and commands.
- `AGENTS.md` - operational instructions for AI agents.
- `AI_GUIDE.md` - strategy and current context.
- `AI_ERRORS.md` - known mistakes and traps.
- `DAMIAN_NOTES.md` - chronological decisions.
- `BUILD_LINUX.md` - Linux build notes.
- `RELEASES.md` - release expectations.
- `CHANGELOG.md` - user-facing change history.

## App-local workspace helpers

```text
apps/whispering/src/lib/utils/svelte-utils/
apps/whispering/src/lib/utils/workspace/
```

These were previously shared packages. Now owned entirely by the app:

- `src/lib/utils/svelte-utils/` - `fromTable`, `createPersistedState`, `createPersistedMap`.
- `src/lib/utils/workspace/` - Yjs table/KV helpers, IndexedDB, BroadcastChannel, `DateTimeString`.

## Cleanup Direction

Recommended order:

1. ~~Rename the Tauri identifier.~~ Already done in source (`tauri.conf.json`, capabilities).
2. ~~Resolve the 11 existing Svelte warnings from `bun run typecheck`.~~ **Done** (session 4).
3. ~~Review the 21 GitHub Dependabot vulnerabilities.~~ **Done** (session 5) — `bun audit` 0 vulnerabilities.
4. ~~Prove local Tauri build and Linux release asset.~~ **Done** (session 6) — RPM + DEB proven in `damianf` toolbox. AppImage deferred to GitHub Actions (requires FUSE).
5. ~~Inline `packages/ui` into `apps/whispering/src/lib/ui/`.~~ **Done** (session 7). Phase 1 extraction complete.
