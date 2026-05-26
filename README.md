# Whispering Open

Whispering Open is Damian's standalone fork/extraction of a speech-to-text app from the original Epicenter monorepo.

The goal is not to rewrite the app from scratch. The goal is to keep a working desktop/web dictation app while gradually removing old cloud, billing, account, sync, analytics, and branding pieces.

This repository intentionally starts as a small workspace rather than a fully flattened app. Stability comes first: make one simplification, verify, document it, then commit.

## Current Layout

- `apps/whispering` - the desktop/web Whispering Open application.
- `packages/*` - local packages required by Whispering Open or its shared dependencies.
- `patches/*` - upstream dependency patches used by the lockfile.

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for the current ownership map and cleanup direction.

## Common Commands

```sh
bun install
bun run typecheck
bun run build:web
bun run dev
```

## AI Documentation

Start here before changing the project:

- [AGENTS.md](AGENTS.md) - required rules for AI coding agents.
- [AI_GUIDE.md](AI_GUIDE.md) - project context, priorities, and workflows.
- [AI_ERRORS.md](AI_ERRORS.md) - known mistakes and traps to avoid.
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - repository layout and ownership.
- [RELEASES.md](RELEASES.md) - release and packaging expectations.
- [docs/FUNCTIONALITY.md](docs/FUNCTIONALITY.md) - product scope, features to keep, features to remove, and deferred decisions.
- [docs/EXTRACTION.md](docs/EXTRACTION.md) - current extraction status and dependency cleanup plan.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - architecture entry points.
- [docs/BUILD_AND_RELEASE.md](docs/BUILD_AND_RELEASE.md) - build/release workflow.
- [docs/DOTFILES_SWAY_INTEGRATION.md](docs/DOTFILES_SWAY_INTEGRATION.md) - how Damian's install automation consumes releases.
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - known Linux/Sway/Tauri issues.

## Push Policy

This repo uses the same secret-scan push policy as `dotfiles-sway`:

```sh
git config core.hooksPath .githooks
```

Before every `git push`, `.githooks/pre-push` runs:

```sh
gitleaks detect --source . --redact --verbose
```

If `gitleaks` is missing or detects a secret, the push is blocked. Do not bypass the hook.

## License

The upstream code is licensed under AGPL-3.0-or-later or package-specific licenses. Keep the upstream license files and publish source changes when distributing builds.
