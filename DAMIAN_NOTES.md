# Damian Notes

## 2026-05-25

Created `/var/home/damian/whispering-open` as a standalone Whispering Open extraction.

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

Changed root `package.json` so the default scripts target Whispering Open instead of unrelated apps.

Verification:

- `bun install` completed.
- `bun run typecheck` passed with warnings.
- `bun run build:web` passed with warnings.

Project rule:

- Always push through `.githooks/pre-push`, the same style of hook used in `dotfiles-sway`. It runs `gitleaks detect --source . --redact --verbose`. Never bypass it.

Next cleanup candidates:

1. Remove `apps/api` by trimming `packages/svelte-utils` imports/dependencies.
2. Remove unused auth/cloud/sync packages after checking actual imports from Whispering Open.
3. Rename package/app identifiers away from old workspace names.
4. Remove analytics/cloud/account UI if not needed.
