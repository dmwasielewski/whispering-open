# Extraction Status

Whispering Open is a staged extraction of `apps/whispering` from the original upstream monorepo.

The current repository is deliberately a mini-workspace, not a fully flattened app. The immediate objective is a working Whispering Open build that can be released independently. Cleanup comes after verification.

## Current State

Included intentionally:

- `apps/whispering` - the product app.
- `packages/ui` - UI components used by Whispering Open.
- `packages/svelte-utils` - Svelte helpers used by state and persistence.
- `packages/util`, `packages/constants`, `packages/workspace` - shared helpers still used by the app.
- `packages/workspace` still carries some legacy non-exported document helpers
  that are being reviewed in small verified cuts.

Still carrying old workspace technical debt:

- package names such as `@epicenter/*`
- analytics service
- remaining references to old upstream release assets where the app still downloads required files
- some non-exported workspace abstractions that may not be needed for a local
  dictation app

## Cleanup Backlog

- Resolve the 11 existing Svelte warnings reported by `bun run typecheck`.
- Review the 21 GitHub Dependabot vulnerabilities reported after push.
- Remove stale source files from `packages/workspace` only after import checks
  and verification.

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

### 2026-05-26: Removed `packages/billing`

The Epicenter billing package was not imported by Whispering Open or by any required shared package. It only remained because the root workspace still included every package under `packages/*`.

Cut made:

- removed the `packages/billing` directory

Expected next step after verification:

- remove stale cloud/auth/sync/encryption source files from `packages/workspace`

### 2026-05-26: Removed unused auth UI exports from `@epicenter/svelte`

Whispering Open imports only the root `@epicenter/svelte` helpers used for local state:

- `fromTable`
- `createPersistedMap`
- `createPersistedState`

The auth-related `createSession`, `account-popover`, and `workspace-gate` utilities were not imported by Whispering Open. They kept auth, UI, icon, and query dependencies attached to `@epicenter/svelte`.

Cut made:

- removed `createSession` from the root `@epicenter/svelte` export
- removed `@epicenter/svelte/account-popover` and `@epicenter/svelte/workspace-gate` package exports
- removed unused auth/UI/query dependencies from `packages/svelte-utils/package.json`

Expected next step after verification:

- inspect whether `packages/server` can be removed

### 2026-05-26: Removed `packages/server`

The shared Hono server package was not imported by Whispering Open or by the active client-side workspace code. It represented hosted/self-hosted Epicenter infrastructure, not the local dictation app.

Cut made:

- removed the `packages/server` directory

Expected next step after verification:

- inspect whether `packages/sync` is still required by active workspace code

### 2026-05-26: Removed `packages/auth-svelte`

The Svelte auth wrapper was no longer imported after the unused auth UI exports were removed from `@epicenter/svelte`.

Cut made:

- removed the `packages/auth-svelte` directory

Expected next step after verification:

- inspect whether the active `@epicenter/workspace` surface can be narrowed enough to remove `packages/sync`

### 2026-05-26: Removed `packages/auth`

The auth core package was no longer imported by Whispering Open or by active shared package code after removing the API app, Svelte auth wrapper, and shared server package.

Cut made:

- removed the `packages/auth` directory

Expected next step after verification:

- inspect whether the active `@epicenter/workspace` surface can be narrowed enough to remove `packages/sync`
- remove stale encrypted helper source files from `packages/workspace`

### 2026-05-26: Narrowed the root `@epicenter/workspace` browser export

Whispering Open imports a small local-first subset from `@epicenter/workspace`: table/KV definitions, table/KV attachments, IndexedDB, BroadcastChannel, `DateTimeString`, and cache/table/KV types used by helper packages.

Cut made:

- narrowed `packages/workspace/src/index.ts` to the browser-safe surface used by Whispering Open
- stopped exporting cloud sync, daemon, auth, encryption, transport, action, timeline, and rich text helpers from the root workspace barrel

Expected next step after verification:

- inspect whether `packages/sync` can be removed after the app no longer traverses cloud sync exports
- inspect whether `packages/encryption` can be removed after the app no longer traverses encryption exports

### 2026-05-26: Removed `@epicenter/sync` from the active workspace dependency graph

Whispering Open uses local-only BroadcastChannel sync, not the cloud WebSocket sync protocol. `attachBroadcastChannel` only needed a BroadcastChannel origin marker to avoid echo loops, so it no longer imports the shared sync protocol package.

Cut made:

- moved the BroadcastChannel origin guard into `attach-broadcast-channel.ts`
- removed `@epicenter/sync` from `packages/workspace/package.json`

Expected next step after verification:

- remove stale cloud sync source files in `packages/workspace` if no active export still uses them

### 2026-05-26: Removed `packages/sync`

The sync protocol package was no longer imported by Whispering Open or by the active `@epicenter/workspace` browser surface after `attachBroadcastChannel` stopped importing the shared sync origin markers.

Cut made:

- removed the `packages/sync` directory

Expected next step after verification:

- remove stale cloud sync source files in `packages/workspace`
- inspect whether encrypted workspace helper source files can be removed from `packages/workspace`

### 2026-05-26: Removed `packages/encryption`

Whispering Open does not import encrypted workspace helpers. After the root `@epicenter/workspace` export was narrowed to the local browser surface, the encryption package was no longer part of the active app dependency graph.

Cut made:

- narrowed `packages/workspace/package.json` exports to the root browser surface
- removed `@epicenter/encryption` from `packages/workspace/package.json`
- removed the `packages/encryption` directory

Expected next step after verification:

- remove stale encrypted helper source files from `packages/workspace`

### 2026-05-26: Removed stale encrypted workspace helper source files

The app already used the local browser workspace surface only. After removing
`packages/encryption`, the old encrypted IndexedDB, keyring, and local-storage
helpers in `packages/workspace/src` were dead source files with dangling
references to the removed package.

Cut made:

- removed encrypted workspace helper source and tests
- changed table/KV tests and benchmarks to use the local `YKeyValueLww` store
- refreshed document API notes to describe the local-only Whispering Open
  surface

Expected next step after verification:

- inspect the remaining workspace daemon, collaboration, and sync source files
  that are still not part of the active Whispering Open browser surface

### 2026-05-26: Removed unused workspace daemon runtime

The `@epicenter/workspace/node` daemon runtime was no longer exported by
`packages/workspace/package.json` and was not imported by Whispering Open. It
belonged to the old Epicenter workspace infrastructure rather than the local
dictation app.

Cut made:

- removed the unused workspace daemon, daemon client, project config loader,
  and daemon workspace app startup code
- removed package dependencies that were only used by that daemon runtime
- refreshed `bun.lock` with `bun install`

Expected next step after verification:

- inspect remaining timeline, rich-text, markdown, SQLite materializer, Yjs log,
  and AI helper files for actual Whispering Open usage

### 2026-05-26: Removed stale collaboration and sync source files

The remaining collaboration files in `packages/workspace/src/document` belonged
to cloud sync and remote action dispatch. They were not exported by the root
browser surface and were not imported by Whispering Open.

Cut made:

- removed `open-collaboration`, sync supervisor, transport URL, dispatch
  protocol, presence protocol, device id, owner-scoped Yjs key, and local-update
  helpers
- removed the now-unused `@epicenter/constants` workspace dependency
- updated comments that still described the removed collaboration layer

Expected next step after verification:

- inspect remaining timeline, rich-text, markdown, SQLite materializer, Yjs log,
  and AI helper files for actual Whispering Open usage

### 2026-05-27: Removed unused workspace AI bridge

The `packages/workspace/src/ai` bridge converted workspace action registries
into TanStack AI tools. Whispering Open does not import that bridge, and the
root workspace export does not expose it.

Cut made:

- removed the unused workspace AI bridge source and tests
- removed the now-unused `@tanstack/ai` dependency from `@epicenter/workspace`
- refreshed `bun.lock` with `bun install`

Expected next step after verification:

- inspect remaining timeline, rich-text, markdown, SQLite materializer, and Yjs
  log files for actual Whispering Open usage

### 2026-05-27: Removed unused editor document primitives

Whispering Open uses table/KV storage for recordings, transformations, runs,
and settings. It does not import the old workspace editor primitives for plain
text, rich text, timeline documents, or Y.Text diffing.

Cut made:

- removed unused plain-text, rich-text, and timeline document primitives and
  their tests
- removed the edit-history benchmark that depended on timeline documents
- removed the now-unused `diff` and `@types/diff` dependencies from
  `@epicenter/workspace`
- refreshed `bun.lock` with `bun install`

Expected next step after verification:

- inspect remaining markdown, SQLite materializer, Yjs log, links, workspace
  paths, and shared action/id helpers for actual Whispering Open usage

### 2026-05-27: Removed unused workspace materializer tooling

Whispering Open writes recording markdown through its own Tauri-side
`recording-materializer`, not the old workspace materializer package. The
workspace markdown/SQLite materializers, Yjs update log, SQLite readers, link
helpers, workspace path helpers, and shared action/id helpers were not imported
by Whispering Open and were not exported from the workspace root.

Cut made:

- removed unused workspace markdown and SQLite materializer source and tests
- removed unused Yjs log, SQLite reader, workspace path, link, action, and id
  helpers
- removed stale materializer dependencies from `@epicenter/workspace`
- refreshed `bun.lock` with `bun install`

Expected next step after verification:

- inspect remaining benchmark-only files and any remaining non-exported shared
  helpers for actual Whispering Open usage

### 2026-05-27: Removed unused workspace benchmarks

The remaining workspace benchmark suite and raw Yjs scripts documented old
storage tradeoffs, but they were not imported by Whispering Open and were not
part of the production workspace export. The historical positional `YKeyValue`
reference implementation only existed for those comparisons.

Cut made:

- removed `packages/workspace/src/__benchmarks__`
- removed raw workspace benchmark/demo scripts
- removed the non-exported positional `YKeyValue` reference implementation
- removed the stale `bench` package script

Expected next step after verification:

- inspect remaining non-exported workspace helpers and stale package metadata
  for actual Whispering Open usage

### 2026-05-27: Updated workspace package metadata

The workspace package README and package metadata still described the removed
Epicenter cloud workspace runtime, including encryption, collaboration,
materializers, and upstream repository links.

Cut made:

- narrowed the package description and keywords to the local Whispering Open
  table/KV surface
- pointed package repository metadata at the Whispering Open repository
- replaced the stale upstream README with extraction-focused package notes

Expected next step after verification:

- inspect remaining package source helpers for actual Whispering Open usage

### 2026-05-27: Removed unused workspace helper leftovers

The remaining non-exported helper files in `packages/workspace/src` were
reviewed for actual Whispering Open usage. They belonged to removed workspace
runtime areas: content document GUIDs, stable script client IDs, extension error
types, branded project paths, an old Standard Schema JSON converter, and a
test-only table factory. None were exported from the browser surface or imported
by the app.

Cut made:

- removed `document/doc-guid.ts`
- removed `shared/client-id.ts` and its test
- removed `shared/test-utils.ts`, `shared/errors.ts`, `shared/types.ts`, and
  `shared/standard-schema.ts`
- removed `src/__tests__/create-tables.ts`

Expected next step after verification:

- inspect remaining package metadata and docs that still describe old Epicenter
  surfaces before package scope renaming

## 2026-05-27 Session Stop Point

Last completed pushed commit:

- `76326de Update workspace package metadata`

The working tree was clean after that push. Gitleaks reported no leaks during
push. GitHub still reported 21 Dependabot vulnerabilities.

Start the next session from the cleanup backlog above. Do not start with Tauri
identifier renaming; that should remain a dedicated later migration after the
remaining dependency graph and package metadata are smaller.

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
6. Inspect and remove unused auth/server/sync/encryption packages.
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
