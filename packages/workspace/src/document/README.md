# Workspace Document API

This directory contains the local-first Yjs document primitives used by
Whispering Open.

## Active Surface

- `defineTable` and `defineKv` describe typed app data.
- `attachTable`, `attachTables`, and `attachKv` bind those definitions to a
  `Y.Doc`.
- `attachIndexedDb` persists the local `Y.Doc` in browser IndexedDB.
- `attachBroadcastChannel` syncs the same local document between same-origin
  windows.
- `YKeyValueLww` provides the keyed last-write-wins store underneath table and
  KV helpers.

The previous Epicenter cloud storage, encrypted local storage, keyring, and
collaboration helpers have been removed from the Whispering Open extraction.
Do not reintroduce auth, server sync, or encryption dependencies here unless a
new Whispering Open feature explicitly needs them and is documented first.

## Pattern

```typescript
import * as Y from 'yjs';
import { type } from 'arktype';
import { attachIndexedDb, attachTable, defineTable } from '@epicenter/workspace';

const recordings = defineTable(
	type({ id: 'string', title: 'string', _v: '1' }),
);

const ydoc = new Y.Doc({ guid: 'whispering-open' });
const idb = attachIndexedDb(ydoc);
const table = attachTable(ydoc, 'recordings', recordings);

await idb.whenLoaded;
table.set({ id: 'first', title: 'First recording', _v: 1 });
```

## Rules

- Keep this API local-first and browser-safe.
- Keep table rows lean; larger per-row content should live in separate Yjs docs.
- Migrate on read instead of rewriting all existing local data.
- Validate reads and surface invalid rows; TypeScript handles write shape during
  development.
- Add tests next to the implementation when changing storage semantics.
