# Extraction Status

Whispering Open is a staged extraction of `apps/whispering` from the original upstream monorepo.

The current repository is deliberately a mini-workspace, not a fully flattened app. The immediate objective is a working Whispering Open build that can be released independently. Cleanup comes after verification.

## Current State

Included intentionally:

- `apps/whispering` - the product app.
- `packages/ui` - UI components used by Whispering Open.
- `packages/svelte-utils` - Svelte helpers used by state and persistence.
- `packages/util`, `packages/constants`, `packages/workspace` - shared helpers still used by the app.
- auth/server/sync/billing-related packages - legacy shared packages still on disk until their dependency chains are verified and cleaned.

Still carrying old workspace technical debt:

- package names such as `@epicenter/*`
- analytics service
- remaining references to old upstream release assets where the app still downloads required files
- some workspace/auth/sync abstractions that may not be needed for a local dictation app

## Completed Cuts

### 2026-05-26: Removed `@epicenter/api` from `@epicenter/svelte`

Whispering Open uses `@epicenter/svelte` for local Svelte helpers:

- `fromTable`
- `createPersistedMap`
- `createPersistedState`

The `packages/svelte-utils` source did not import `@epicenter/api`, but its package metadata still declared `@epicenter/api` as a workspace dependency. That dependency kept `apps/api` connected to the active dependency graph.

Cut made:

- removed `@epicenter/api` from `packages/svelte-utils/package.json`

Expected next step after verification:

- narrow the root workspace from `apps/*` to `apps/whispering`
- then remove `apps/api` if `bun install`, `bun run typecheck`, and `bun run build:web` still pass

### 2026-05-26: Narrowed root app workspace to `apps/whispering`

The root workspace no longer includes every directory under `apps/*`.

Cut made:

- changed the root workspace package list from `apps/*` to `apps/whispering`

Expected result after `bun install`:

- `apps/api` should disappear from `bun.lock` as a workspace package
- `@epicenter/api` should disappear from `bun.lock`

Expected next step after verification:

- remove the `apps/api` directory from the repository

### 2026-05-26: Removed `apps/api`

The Epicenter API app was removed after the previous cuts proved it was no longer part of the active workspace or lockfile.

Cut made:

- removed the `apps/api` directory

Expected next step after verification:

- inspect remaining shared packages for unused auth/server/billing/sync dependency chains

## Safe Cleanup Order

1. Verify current build:
   ```sh
   bun run typecheck
   bun run build:web
   ```
2. Identify exact imports from `@epicenter/svelte`.
3. Remove unused package metadata dependencies from `packages/svelte-utils`.
4. Narrow the root workspace so only `apps/whispering` remains under `apps`.
5. Remove `apps/api`.
6. Inspect and remove unused auth/server/billing/sync packages.
7. Move or copy only the needed Svelte helpers into a Whispering Open-owned package or local module.
8. Rename package scopes after dependency graph is small.
9. Rename Tauri identity and release metadata in a dedicated migration.

## Verification Rule

Every dependency removal must end with:

```sh
bun install
bun run typecheck
bun run build:web
.githooks/pre-push
```

For desktop-affecting changes, also run a Tauri dev/build check when feasible.
