# Damian Notes

## 2026-05-25

Created `/var/home/damian/whispering-open` as a standalone Whispering Open extraction.

Copied:

- `apps/whispering`
- `apps/api` as a temporary technical dependency
- `packages/auth`
- `packages/auth-svelte`
- `packages/billing`
- `packages/encryption`
- `packages/server`
- `packages/svelte-utils`
- `packages/sync`
- `packages/ui`
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

## 2026-05-27 (session 2)

Continued inline extraction of shared packages into `apps/whispering`.

Removed and pushed:

- `packages/svelte-utils` — inlined into `apps/whispering/src/lib/utils/svelte-utils/`.
  Nine import sites updated from `@epicenter/svelte` to `$lib/utils/svelte-utils`.
- `packages/workspace` — inlined into `apps/whispering/src/lib/utils/workspace/`.
  Five app import sites updated from `@epicenter/workspace` to `$lib/utils/workspace`.
  One import in the inlined `from-table.svelte.ts` also updated.
  `DateTimeString` type moved to `packages/ui/src/natural-language-date-input/datetime-string.ts`
  so `packages/ui` no longer depends on workspace.
- Empty leftover `packages/constants/src` and `packages/util/src` directories cleaned up locally.

Current verified state:

- `bun install` passed.
- `bun run typecheck` passed with 0 errors and 11 known Svelte warnings.
- `bun run build:web` passed.
- 45 inlined workspace tests pass.
- Pushes went through the configured gitleaks pre-push hook.

Current repository structure after these cuts:

- `apps/whispering` — the app (now owns all workspace and svelte-utils code)
- `packages/ui` — the only remaining shared package, still named `@epicenter/ui`

Current known backlog:

- GitHub still reports 21 Dependabot vulnerabilities.
- The 11 Svelte warnings remain.
- `packages/ui` is still named `@epicenter/ui` — rename is deferred.

Recommended next cleanup candidates:

1. Rename `@epicenter/ui` to `@whispering-open/ui` (or flatten into app) — package scope rename.
2. Rename the Tauri identifier from `com.bradenwong.whispering` — dedicated migration after rename.
3. Resolve 11 Svelte warnings.
4. Review 21 Dependabot vulnerabilities.

## 2026-05-27

Continued the staged extraction and cleanup of Whispering Open.

Removed and pushed:

- unused workspace materializer tooling
- unused workspace benchmarks
- old reference storage tooling
- stale workspace package metadata that still described removed Epicenter cloud
  runtime pieces

Current verified state:

- `bun install` passed during dependency cleanup.
- `bun run typecheck` passed with 0 errors and 11 known Svelte warnings.
- focused `packages/workspace` tests passed.
- `bun run build:web` passed.
- pushes went through the configured gitleaks pre-push hook.

Current known backlog:

- GitHub reports 21 Dependabot vulnerabilities after push.
- The 11 Svelte warnings remain.
- Some package names still use `@epicenter/*`.
- Tauri identifier rename is intentionally deferred.

Recommended next cleanup candidates:

1. Inspect the remaining `@epicenter/svelte`, `@epicenter/ui`, and
   `@epicenter/workspace` package boundaries for stale exports or metadata.
2. Keep package scope renaming as a dedicated migration after dependency cleanup.
3. Run typecheck, focused tests, and build before pushing.
