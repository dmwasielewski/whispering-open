# @epicenter/svelte

`@epicenter/svelte` is a temporary compatibility package kept while
Whispering Open is extracted from the old workspace.

The active app uses this package for local Svelte helpers:

- `fromTable`
- `fromKv`
- `fromDisposableCache`
- `createPersistedMap`
- `createPersistedState`

The package name is intentionally unchanged for now. Rename package scopes only
in a dedicated migration after the dependency graph is smaller and verified.

## Usage

```ts
import { fromTable } from '@epicenter/svelte';
import { createPersistedState } from '@epicenter/svelte';
```

## Cleanup Notes

This package should stay small and app-facing. Do not add auth, billing,
hosted sync, or hosted dashboard helpers back here for Whispering Open.
