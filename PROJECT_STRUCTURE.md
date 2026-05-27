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
packages/svelte-utils
packages/workspace
```

Current purpose:

- `packages/ui` - Svelte UI component library used heavily by Whispering Open.
- `packages/svelte-utils` - persisted state/session/workspace helpers.
- `packages/workspace` - local-first document/table helpers used by Whispering Open state.
- No cloud/auth/sync/encryption shared package should be treated as required unless the active app imports it.

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
2. Resolve the 11 existing Svelte warnings from `bun run typecheck`.
3. Review the 21 GitHub Dependabot vulnerabilities reported after push.
4. Remove stale cloud/auth/sync/encryption source files from `packages/workspace`.
5. Rename app identity and package scopes.
6. Replace old workspace links and branding.
7. Add stable release automation.
