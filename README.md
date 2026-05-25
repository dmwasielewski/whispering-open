# Whispering Open

Standalone extraction of the Whispering app from the Epicenter monorepo.

This repository intentionally starts as a small workspace rather than a fully flattened app. The first goal is to keep Whispering building and running while removing Epicenter-specific infrastructure in small verified steps.

## Current Layout

- `apps/whispering` - the desktop/web Whispering application.
- `apps/api` - temporary workspace dependency pulled in through shared Svelte utilities.
- `packages/*` - local packages required by Whispering or its shared dependencies.
- `patches/*` - upstream dependency patches used by the lockfile.

## Common Commands

```sh
bun install
bun run typecheck
bun run build:web
bun run dev
```

## Push Policy

Always run the security/pre-push hook before pushing this repository. Do not bypass the hook.

## License

The upstream Whispering/Epicenter code is licensed under AGPL-3.0-or-later or package-specific licenses. Keep the upstream license files and publish source changes when distributing builds.
