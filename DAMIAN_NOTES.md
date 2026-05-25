# Damian Notes

## 2026-05-25

Created `/var/home/damian/whispering-personal` as a standalone Whispering extraction.

Copied:

- `apps/whispering`
- `apps/api` as a temporary technical dependency
- `packages/auth`
- `packages/auth-svelte`
- `packages/billing`
- `packages/constants`
- `packages/encryption`
- `packages/server`
- `packages/svelte-utils`
- `packages/sync`
- `packages/ui`
- `packages/util`
- `packages/workspace`
- root build/config files and `patches`

Preserved local edits from the source tree:

- `apps/whispering/src/routes/+layout.svelte`
- `apps/whispering/src/routes/(app)/_components/VerticalNav.svelte`

Changed root `package.json` so the default scripts target Whispering instead of unrelated Epicenter apps.

Verification:

- `bun install` completed.
- `bun run typecheck` passed with warnings.
- `bun run build:web` passed with warnings.

Next cleanup candidates:

1. Remove `apps/api` by trimming `packages/svelte-utils` imports/dependencies.
2. Remove unused auth/cloud/sync packages after checking actual imports from Whispering.
3. Rename package/app identifiers away from Epicenter.
4. Remove analytics/cloud/account UI if not needed.
