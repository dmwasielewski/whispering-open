# Extraction Status

Whispering Open is a staged extraction of `apps/whispering` from the original upstream monorepo.

The current repository is deliberately a mini-workspace, not a fully flattened app. The immediate objective is a working Whispering Open build that can be released independently. Cleanup comes after verification.

## Current State

Included intentionally:

- `apps/whispering` - the product app.
- `packages/ui` - UI components used by Whispering Open.
- `packages/svelte-utils` - Svelte helpers used by state and persistence.
- `packages/util`, `packages/constants`, `packages/workspace` - shared helpers still used by the app.
- `apps/api` and auth/server/sync/billing-related packages - temporary dependency chain.

Still carrying old workspace technical debt:

- package names such as `@epicenter/*`
- analytics service
- remaining references to old upstream release assets where the app still downloads required files
- some workspace/auth/sync abstractions that may not be needed for a local dictation app

## Why `apps/api` Exists

`@epicenter/svelte` currently depends on `@epicenter/api`. Until the exact helpers used by Whispering Open are isolated, removing `apps/api` breaks workspace dependency resolution.

Do not remove it blindly.

## Safe Cleanup Order

1. Verify current build:
   ```sh
   bun run typecheck
   bun run build:web
   ```
2. Identify exact imports from `@epicenter/svelte`.
3. Move or copy only the needed Svelte helpers into a Whispering Open-owned package or local module.
4. Remove `@epicenter/api` from `packages/svelte-utils`.
5. Remove `apps/api`.
6. Repeat for `auth`, `server`, `billing`, `sync`, and other unused packages.
7. Rename package scopes after dependency graph is small.
8. Rename Tauri identity and release metadata in a dedicated migration.

## Verification Rule

Every dependency removal must end with:

```sh
bun install
bun run typecheck
bun run build:web
.githooks/pre-push
```

For desktop-affecting changes, also run a Tauri dev/build check when feasible.
