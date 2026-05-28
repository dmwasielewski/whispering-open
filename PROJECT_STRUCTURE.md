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

```text
packages/ui
```

Current purpose:

- `packages/ui` - Svelte UI component library used by Whispering Open. Still named `@epicenter/ui`; rename is deferred.
- `packages/svelte-utils` and `packages/workspace` have been inlined into `apps/whispering/src/lib/utils/`.

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

1. Rename `@epicenter/ui` → `@whispering-open/ui` (dedicated migration, ~80 import sites).
2. Rename the Tauri identifier after package rename is stable.
3. Resolve the 11 existing Svelte warnings from `bun run typecheck`.
4. Review the 21 GitHub Dependabot vulnerabilities.
5. Prove local Tauri build and Linux release asset.
6. Add stable release automation.
