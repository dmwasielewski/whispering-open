# Damian Notes

## 2026-05-28 (session 5)

Resolved all 21 Dependabot security vulnerabilities. `bun audit` now reports 0 vulnerabilities.

Changed:

**Package updates (direct dependencies):**
- `svelte` ^5.45.2 → ^5.55.10 (SSR XSS, ReDoS)
- `@sveltejs/kit` ^2.49.0 → ^2.61.1 (query batch, redirect DoS)
- `vite` ^7.2.4 → ^7.3.2 (path traversal, arbitrary file read)
- `@sveltejs/vite-plugin-svelte` kept at ^6.2.4 (v7 requires vite 8 — deferred)
- `svelte-check` ^4.3.4 → ^4.4.8
- `turbo` ^2.8.19 → ^2.9.15 (CSRF, local code execution)
- `dompurify` ^3.3.1 → ^3.4.7 (multiple XSS bypasses)
- `@ricky0123/vad-web` ^0.0.24 → ^0.0.30 (drops protobufjs critical CVE)

**Overrides in root `package.json` (transitive, no upstream fix available):**
- `ws` → ^8.20.1 (memory disclosure via openai/mistralai/wrangler)
- `cookie` → ^0.7.0 (out-of-bounds chars via kit/wrangler)
- `qs` → ^6.15.2 (stringify DoS via elevenlabs)
- `uuid` → ^11.1.1 (buffer bounds check via vite-plugin-devtools-json)
- `dompurify` → ^3.4.7 (nested dep under @types/dompurify)

**Removed:**
- `@types/dompurify` — DOMPurify 3.x bundles its own TypeScript types.
- Root `dependencies` section added erroneously by `bun update` — removed.

**Code changes:**
- `apps/whispering/src/lib/state/vad-recorder.svelte.ts` — migrated to `@ricky0123/vad-web@0.0.30` API:
  `stream` option → `getStream: async () => stream`; `trySync(start/destroy)` → `await tryAsync`.
- `apps/whispering/vite.config.ts` — converted async config factory to plain object
  (no actual async ops; removes TypeScript overload depth error from new package types).

Pitfalls encountered during this session:
- `bun update` added a spurious `"dependencies"` section to root `package.json` with vite 8 — had to remove manually.
- `@sveltejs/vite-plugin-svelte@7.x` requires vite 8; kept at v6 to stay on vite 7.
- Stale `apps/whispering/node_modules/vite@7.3.1` caused dual-module TypeScript conflict — fixed by `rm -rf apps/whispering/node_modules && bun install`.
- `@types/dompurify@3.2.0` had its own nested `dompurify@3.3.3` — fixed by removing `@types/dompurify` (types are bundled in the main package).

Current verified state:

- `bun audit`: 0 vulnerabilities.
- `bun run typecheck`: 0 errors, 0 warnings.
- `bun run build:web`: passes.
- Push went through gitleaks hook.
- GitHub Dependabot will re-scan on next run; count will drop from 21.

Remaining known items:

- Upgrade to `@sveltejs/vite-plugin-svelte@7.x` + vite 8 (requires vite.config.ts type audit).
- Prove local Tauri build and Linux release asset.
- Add stable release automation.

## 2026-05-27 (session 4)

Fixed all 11 Svelte typecheck warnings. `bun run typecheck` now reports 0 errors and 0 warnings.

Changed:

- `apps/whispering/src/lib/components/copyable/TextPreviewDialog.svelte` — fixed self-closing `<div />` → `<div></div>`
- `apps/whispering/src/routes/(app)/(config)/settings/transcription/+page.svelte` — fixed 6 self-closing `<span />` → `<span></span>`
- `apps/whispering/src/routes/(app)/(config)/recordings/row-actions/EditRecordingModal.svelte` — wrapped `recording.id` capture in `untrack()` to silence `state_referenced_locally` warning; intent (non-reactive teardown capture) preserved
- `apps/whispering/src/routes/(app)/(config)/settings/shortcuts/keyboard-shortcut-recorder/KeyboardShortcutRecorder.svelte` — wrapped initial `rawKeyCombination` prop access in `untrack()` for `manualValue` initial state
- `apps/whispering/src/routes/(app)/(config)/settings/shortcuts/keyboard-shortcut-recorder/GlobalKeyboardShortcutRecorder.svelte` — wrapped `createKeyRecorder(...)` call in `untrack()` to silence prop-captured-locally warning for `pressedKeys`
- `apps/whispering/src/routes/(app)/(config)/settings/shortcuts/keyboard-shortcut-recorder/LocalKeyboardShortcutRecorder.svelte` — same as above

Current verified state:

- `bun run typecheck` passes with **0 errors and 0 warnings**.
- `bun run build:web` passes.
- Push went through gitleaks pre-push hook.

Current known backlog:

- GitHub reports 21 Dependabot vulnerabilities.
- Tauri identifier rename: `tauri.conf.json` already uses `io.github.dmwasielewski.whisperingopen`; capabilities files and `Cargo.toml` still use old value — dedicated migration needed.

Recommended next cleanup candidates:

1. Finish Tauri identifier rename (capabilities + Cargo.toml).
2. Review 21 Dependabot vulnerabilities.
3. Prove local Tauri build and Linux release asset.

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

## 2026-05-27 (session 3)

Renamed `@epicenter/ui` → `@whispering-open/ui`.

Changed:

- `packages/ui/package.json` name field
- `apps/whispering/package.json` devDependency
- 79 import sites in `apps/whispering/src/`
- JSDoc self-reference in `packages/ui/src/hooks/use-combobox.svelte.ts`
- LICENSE index entry
- Removed 3 dead commented-out `@epicenter/extension` imports from source files

Current verified state:

- `bun install` passed.
- `bun run typecheck` passed with 0 errors and 11 known Svelte warnings.
- `bun run build:web` passed.

No remaining `@epicenter/*` references exist in source code or package metadata.

Remaining Epicenter-origin identifier: Tauri bundle ID `com.bradenwong.whispering`.
That rename is a dedicated migration (affects data path, desktop launcher).

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
