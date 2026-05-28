# Extraction Status

Whispering Open is a staged extraction of `apps/whispering` from the original upstream monorepo.

The current repository is deliberately a mini-workspace, not a fully flattened app. The immediate objective is a working Whispering Open build that can be released independently. Cleanup comes after verification.

## Current State

Included intentionally:

- `apps/whispering` - the product app. Owns all workspace and svelte-utils code directly.
- `packages/ui` (`@whispering-open/ui`) - UI components used by Whispering Open.

Inlined into the app (no longer separate packages):

- `apps/whispering/src/lib/utils/svelte-utils/` - was `packages/svelte-utils` (`@epicenter/svelte`).
- `apps/whispering/src/lib/utils/workspace/` - was `packages/workspace` (`@epicenter/workspace`).

No remaining `@epicenter/*` references in source code or package metadata.

Still carrying old Epicenter-origin identifiers:

- Tauri bundle ID `com.bradenwong.whispering` — rename is a dedicated migration
- Analytics service (Aptabase) — deferred decision on removal vs. keep as opt-in
- Some upstream release asset URLs for local model downloads

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

### 2026-05-27: Updated local package metadata

Several retained local packages still described themselves as general Epicenter
monorepo packages even though they are now compatibility packages for
Whispering Open.

Cut made:

- updated package descriptions and repository metadata for retained local
  packages
- replaced stale `packages/constants` and `packages/svelte-utils` READMEs with
  extraction-focused notes
- clarified that old workspace cloud-sync documentation is historical unless
  active exports import it

Expected next step after verification:

- inspect stale constants and Svelte utility exports that are no longer imported
  by Whispering Open

### 2026-05-27: Removed stale constants and AI chat Svelte helper

Whispering Open used `@epicenter/constants` only for Vite/dev-server URL
metadata. The remaining constants exported auth, OAuth, billing, request-guard,
asset, API route, version, and AI chat helpers from the old hosted workspace.
`@epicenter/svelte` also still exported `createAiChatFetch`, which depended on
those AI chat constants but was not imported by the app.

Cut made:

- removed the unused `createAiChatFetch` export and source file
- removed `@epicenter/constants` from `@epicenter/svelte`
- narrowed `@epicenter/constants` to `./apps` and `./vite`
- removed unused constants source files and stale package dependencies
- removed the unused root dependency on `@epicenter/constants`

Expected next step after verification:

- inspect whether `@epicenter/constants` is still useful as a package or should
  be replaced by app-local constants in a small dedicated change

### 2026-05-27: Replaced constants package with app-local constants

After stale constants were removed, the remaining `@epicenter/constants` package
only provided the Whispering Open dev-server port and app URL. Those values are
owned by `apps/whispering`, so keeping a workspace package for them added more
dependency surface than value.

Cut made:

- moved the Vite dev-server port into `apps/whispering/vite.config.ts`
- moved `WHISPERING_URL` resolution into
  `apps/whispering/src/lib/constants/app/urls.ts`
- removed the `@epicenter/constants` dependency from the app
- removed `packages/constants`
- refreshed `bun.lock`

Expected next step after verification:

- inspect `@epicenter/util` usage and remove or inline it if the app no longer
  needs a separate utility package

### 2026-05-27: Removed util package

`@epicenter/util` only exported a trailing-edge `debounce` helper, and the app
only used it in the keyboard shortcut recorder. Keeping a workspace package for
that single local behavior added an unnecessary dependency edge.

Cut made:

- inlined the recorder's debounce helper in
  `create-key-recorder.svelte.ts`
- removed the `@epicenter/util` dependency from the app
- removed `packages/util`
- refreshed `bun.lock`

Expected next step after verification:

- inspect the remaining retained package boundaries for stale exports,
  metadata, and docs before package scope renaming

### 2026-05-27: Removed unused Svelte helper exports

`@epicenter/svelte` still carried general workspace bindings that Whispering
Open does not import. The active app uses table bindings and persisted storage
helpers only.

Cut made:

- removed unused `fromKv`
- removed unused `fromDisposableCache`
- updated the package README to list only app-used helpers

Expected next step after verification:

- continue reviewing retained package exports and metadata before package scope
  renaming

## 2026-05-27 Session Stop Point (session 1)

Last completed pushed commit:

- `76326de Update workspace package metadata`

The working tree was clean after that push. Gitleaks reported no leaks during
push. GitHub still reported 21 Dependabot vulnerabilities.

---

### 2026-05-27: Inlined packages/svelte-utils into apps/whispering

`@epicenter/svelte` exported only three helpers used by the app: `fromTable`,
`createPersistedState`, and `createPersistedMap`. Keeping a shared workspace
package for three functions added more dependency surface than value.

Cut made:

- copied `packages/svelte-utils/src/` to `apps/whispering/src/lib/utils/svelte-utils/`
- updated 9 import sites from `@epicenter/svelte` to `$lib/utils/svelte-utils`
- removed `@epicenter/svelte` from `apps/whispering/package.json`
- removed `packages/svelte-utils`
- refreshed `bun.lock`

Expected next step after verification:

- inline `packages/workspace` into the app

### 2026-05-27: Inlined packages/workspace into apps/whispering

`@epicenter/workspace` provided table/KV helpers, IndexedDB, and
BroadcastChannel binding used in 5 app files. With svelte-utils removed, this
was the last remaining `@epicenter` package dependency besides UI.

Before removing, `packages/ui` was also importing `DateTimeString` type from
`@epicenter/workspace`. That type was moved into
`packages/ui/src/natural-language-date-input/datetime-string.ts` using
`wellcrafted/brand` (already a devDependency of `packages/ui`), so `packages/ui`
no longer depends on workspace.

Cut made:

- copied `packages/workspace/src/` to `apps/whispering/src/lib/utils/workspace/`
- updated 6 import sites from `@epicenter/workspace` to `$lib/utils/workspace`
- fixed two test files where `ydoc.getArray()` needed an explicit type parameter
  (`YKeyValueLwwEntry<unknown>`) for the stricter svelte-check environment
- removed `@epicenter/workspace` from `apps/whispering/package.json`
- removed `@epicenter/workspace` from `packages/ui/package.json`
- removed `packages/workspace`
- refreshed `bun.lock`

Expected next step after verification:

- rename `@epicenter/ui` → `@whispering-open/ui` (or inline into app)

## 2026-05-27 Session Stop Point (session 2)

Last completed pushed commits:

- `ace4825 Inline packages/svelte-utils into apps/whispering`
- `8e59f6c Inline packages/workspace into apps/whispering`

The working tree was clean after those pushes. Gitleaks reported no leaks.
GitHub still reported 21 Dependabot vulnerabilities.

**Start next session here:**

The only remaining shared package with an Epicenter name is `packages/ui`
(`@epicenter/ui`). Recommended next steps in order:

1. Rename `@epicenter/ui` → `@whispering-open/ui`:
   - update `packages/ui/package.json` name field
   - update `apps/whispering/package.json` devDependency
   - update ~79 import sites in `apps/whispering/src/` that import from `@epicenter/ui`
   - verify: `bun install`, `bun run typecheck`, `bun run build:web`
2. Rename Tauri identifier (`com.bradenwong.whispering` → `io.github.dmwasielewski.whisperingopen`)
   — only after package rename is verified and stable, as a separate dedicated commit.

Verify commands:
```sh
bun run typecheck
bun test apps/whispering/src/lib/utils/workspace/document/create-kv.test.ts apps/whispering/src/lib/utils/workspace/document/create-table.test.ts apps/whispering/src/lib/utils/workspace/document/attach-broadcast-channel.test.ts apps/whispering/src/lib/utils/workspace/document/local-only-recipe.test.ts
bun run build:web
```

### 2026-05-27: Renamed @epicenter/ui to @whispering-open/ui

All `@epicenter/*` package names have been removed from source code and
package metadata. The only remaining Epicenter-origin identifier is the Tauri
bundle ID.

Cut made:

- updated `packages/ui/package.json` name from `@epicenter/ui` to `@whispering-open/ui`
- updated `apps/whispering/package.json` devDependency
- updated 79 import sites in `apps/whispering/src/`
- updated JSDoc self-reference in `packages/ui/src/hooks/use-combobox.svelte.ts`
- updated LICENSE index entry
- removed 3 dead commented-out `@epicenter/extension` imports from source files
- refreshed `bun.lock`

Expected next step after verification:

- rename Tauri bundle ID from `com.bradenwong.whispering` to
  `io.github.dmwasielewski.whisperingopen` in a dedicated migration

## 2026-05-27 Session Stop Point (session 3)

Last completed pushed commit:

- `32c2346 Rename @epicenter/ui to @whispering-open/ui`

The working tree was clean after that push. Gitleaks reported no leaks.
GitHub still reported 21 Dependabot vulnerabilities.

**Start next session here:**

No `@epicenter/*` references remain in source code or package metadata.
The only remaining Epicenter-origin identifier is the Tauri bundle ID.

Recommended next steps in order:

1. **Rename the Tauri bundle ID** — dedicated migration:
   - Change `identifier` in `apps/whispering/src-tauri/tauri.conf.json` from
     `com.bradenwong.whispering` to `io.github.dmwasielewski.whisperingopen`
   - Update any references to the old identifier in Rust source, capabilities,
     updater config, and desktop entry files
   - Test that the installed app still launches correctly on Fedora Sway
   - Do NOT do this without verifying the installed app after the change
2. Resolve the 11 existing Svelte warnings from `bun run typecheck`.
3. Review the 21 GitHub Dependabot vulnerabilities.

Verify commands:
```sh
bun run typecheck
bun test apps/whispering/src/lib/utils/workspace/document/create-kv.test.ts apps/whispering/src/lib/utils/workspace/document/create-table.test.ts apps/whispering/src/lib/utils/workspace/document/attach-broadcast-channel.test.ts apps/whispering/src/lib/utils/workspace/document/local-only-recipe.test.ts
bun run build:web
```

### 2026-05-28: Inlined packages/ui into apps/whispering

`@whispering-open/ui` provided all UI components (shadcn-svelte based, Tailwind CSS).
With `svelte-utils` and `workspace` already inlined, this was the last remaining
shared workspace package.

Cut made:

- copied `packages/ui/src/` to `apps/whispering/src/lib/ui/`
- updated 79 import sites from `@whispering-open/ui` to `$lib/ui`
- removed `@whispering-open/ui` from `apps/whispering/package.json`
- removed `packages/ui` directory
- refreshed `bun.lock`
- fixed JSDoc example in `use-combobox.svelte.ts` to use `$lib/ui`

No remaining shared packages. The workspace now contains only `apps/whispering`.

Expected next step after verification:

- Add GitHub Actions CI/CD for automated AppImage builds (Ubuntu runner required for FUSE).

## Safe Cleanup Order

1. Rename Tauri bundle ID (see above — dedicated migration, requires runtime test on Fedora Sway).
2. Resolve the 11 existing Svelte warnings.
3. Review the 21 GitHub Dependabot vulnerabilities.
4. Prove local Tauri build and Linux release asset.
5. ~~Inline `packages/ui` into `apps/whispering/src/lib/ui/`.~~ **Done** (session 7). Phase 1 complete.

## Verification Rule

Every dependency removal must end with:

```sh
bun install
bun run typecheck
bun run build:web
.githooks/pre-push
```

For desktop-affecting changes, also run a Tauri dev/build check when feasible.
