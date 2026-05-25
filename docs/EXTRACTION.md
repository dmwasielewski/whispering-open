# Extraction Status

Whispering Open is a staged extraction of `apps/whispering` from `EpicenterHQ/epicenter`.

The current repository is deliberately a mini-workspace, not a fully flattened app. The immediate objective is a working Whispering build that can be released independently. Cleanup comes after verification.

## Current State

Included intentionally:

- `apps/whispering` - the product app.
- `packages/ui` - UI components used by Whispering.
- `packages/svelte-utils` - Svelte helpers used by state and persistence.
- `packages/util`, `packages/constants`, `packages/workspace` - shared helpers still used by the app.
- `apps/api` and auth/server/sync/billing-related packages - temporary dependency chain.

Still upstream/Epicenter flavored:

- package names such as `@epicenter/*`
- Tauri identifier `com.bradenwong.whispering`
- updater endpoint pointing to `EpicenterHQ/epicenter`
- analytics service
- links, docs, and UI copy referencing Epicenter
- some workspace/auth/sync abstractions that may not be needed for a local dictation app

## Why `apps/api` Exists

`@epicenter/svelte` currently depends on `@epicenter/api`. Until the exact helpers used by Whispering are isolated, removing `apps/api` breaks workspace dependency resolution.

Do not remove it blindly.

## Safe Cleanup Order

1. Verify current build:
   ```sh
   bun run typecheck
   bun run build:web
   ```
2. Identify exact imports from `@epicenter/svelte`.
3. Move or copy only the needed Svelte helpers into a Whispering-owned package or local module.
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
