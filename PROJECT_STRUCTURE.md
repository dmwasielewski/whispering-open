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

## Temporary App Dependency

```text
apps/api
```

Temporary workspace package needed because shared Svelte utilities still depend on `@epicenter/api`.

Goal: remove this after trimming or replacing the exact utilities Whispering Open needs.

## Shared Packages

```text
packages/ui
packages/svelte-utils
packages/util
packages/constants
packages/workspace
packages/sync
packages/auth
packages/auth-svelte
packages/encryption
packages/server
packages/billing
```

Current purpose:

- `packages/ui` - Svelte UI component library used heavily by Whispering Open.
- `packages/svelte-utils` - persisted state/session/workspace helpers.
- `packages/workspace` - local-first document/table helpers used by Whispering Open state.
- `packages/constants`, `packages/util` - shared constants/utilities.
- `packages/auth`, `packages/auth-svelte`, `packages/encryption`, `packages/server`, `packages/sync`, `packages/billing` - undesirable long term, present because dependency chains still reference them.

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

## Cleanup Direction

Recommended order:

1. Prove local Tauri build and Linux release asset.
2. Remove `apps/api` by isolating the used parts of `packages/svelte-utils`.
3. Remove unused auth/server/billing/sync packages.
4. Rename app identity and package scopes.
5. Replace old workspace links and branding.
6. Add stable release automation.
