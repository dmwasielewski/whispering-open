# Workspace Package

`@epicenter/workspace` is currently kept as an internal compatibility package
for Whispering Open. The extraction goal is to keep only the local-first table
and key-value primitives that the app actually uses.

## Active Surface

The root export in `src/index.ts` is intentionally narrow and browser-safe:

- `defineTable`, `attachTable`, `attachTables`
- `defineKv`, `attachKv`
- `attachIndexedDb`
- `attachBroadcastChannel`
- `createDisposableCache`
- `DateTimeString`

These helpers compose around a caller-owned `Y.Doc`. Whispering Open uses them
for recordings, settings, transformations, runs, and local persistence.

## Removed Upstream Scope

This package no longer carries the old Epicenter cloud workspace runtime:

- no auth package dependency
- no server or sync protocol package dependency
- no encryption package dependency
- no collaboration runtime
- no markdown or SQLite materializers
- no daemon runtime
- no benchmark/reference storage tooling

Do not reintroduce those systems unless Whispering Open has a concrete local
runtime need and the dependency graph is reviewed first.

## Verification

After changing this package, run:

```sh
bun run typecheck
bun test packages/workspace/src/document/create-kv.test.ts packages/workspace/src/document/create-table.test.ts packages/workspace/src/document/attach-broadcast-channel.test.ts packages/workspace/src/document/local-only-recipe.test.ts packages/workspace/src/index.browser-safe.test.ts
bun run build:web
```

The existing Svelte warnings are tracked in the project cleanup backlog.
