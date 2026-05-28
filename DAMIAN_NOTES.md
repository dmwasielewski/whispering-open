# Damian Notes

## 2026-05-28 (session 8)

Set up GitHub Actions CI/CD for automated Linux release builds (AppImage + RPM + DEB).

### What was done

**Tauri signing keypair generated:**
- New Ed25519 (minisign) keypair generated with `bun run --cwd apps/whispering tauri signer generate`
- Private key stored as `TAURI_SIGNING_PRIVATE_KEY` GitHub Actions secret (never committed)
- Key password stored as `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` secret
- Public key (single-base64-encoded minisign .pub content) stored in `tauri.conf.json → plugins.updater.pubkey`
- Private key file deleted from disk immediately after storing the secret

**`.github/workflows/release.yml` created:**
- Trigger: tag push (`v*`) or manual `workflow_dispatch`
- Runner: `ubuntu-24.04`
- Builds: AppImage + RPM + DEB + `latest.json` (updater manifest)
- Uploads artifacts to GitHub Release on tag push

**CI fixes required (multiple failed runs):**
- Missing JS dependencies: 12 packages from deleted `packages/ui` not in `apps/whispering/package.json` — added them
- Vulkan SDK: `whisper.cpp`/GGML explicitly enables `-DGGML_VULKAN=ON` which requires `glslc` (shader compiler). Ubuntu's repos don't ship `glslc` → installed LunarG Vulkan SDK via their PPA
- ALSA: `libasound2-dev` was missing from the apt-get list
- Pubkey encoding: original pubkey was double-base64 encoded → generated a fresh keypair with correct single-layer base64 encoding

**Documentation:**
- `docs/BUILD_AND_RELEASE.md` — completely rewritten with beginner-friendly CI/CD explanation covering every workflow step, the Vulkan SDK requirement, signing mechanism, and release workflow
- `AI_GUIDE.md` — updated verified commands, marked CI automation done

### Current verified state

- CI run green (first successful end-to-end build): artifacts verified
- `gh workflow run release.yml --repo dmwasielewski/whispering-open --field tag=''` — manual build-only trigger works
- Tag-based release: `git tag vX.Y.Z-N && git push origin vX.Y.Z-N` → GitHub Release created automatically

### Additional fixes during session 8

**Auto-updater URL bug:** `latest.json` had `%20` (space) in the AppImage URL, but GitHub
Releases converts spaces to dots on upload. Fixed in workflow and re-uploaded `latest.json`
to the v7.11.0-2 release.

**Signing key mismatch:** Generating a new keypair in session 8 meant the installed v7.11.0-1
(old pubkey) could not verify v7.11.0-2's signature. The auto-updater showed
`The signature was created with a different key`. Manually installed v7.11.0-2 via RPM extract.
This is a one-time migration — future updates will work automatically.

**`GITHUB_TOKEN` permissions:** Added `permissions: contents: write` to the workflow job.
Removed `generate_release_notes: true` (requires `pull-requests: read`).

### End state of session 8

- CI: green, full release pipeline working
- GitHub Release v7.11.0-2: AppImage + RPM + DEB + sig files + latest.json
- Locally installed: v7.11.0-2 at `~/.local/opt/whispering-open/root/usr/bin/whispering-open`
- Auto-updater: latest.json correct, will work for v7.11.0-2 → future versions
- Docs: AI_ERRORS.md, AI_GUIDE.md, DAMIAN_NOTES.md, BUILD_AND_RELEASE.md all updated

### Remaining known items

- Phase 2: Verify desktop integration on Fedora Sway Atomic — global keyboard shortcuts, tray icon, auto-updater flow (v7.11.0-2 → v7.11.0-3).
- Cosmetic cleanup of remaining bradenwong/Epicenter text references in comments.
- Upgrade `@sveltejs/vite-plugin-svelte` to v7 + vite 8 (deferred — requires vite.config.ts type audit).

## 2026-05-28 (session 7)

Inlined packages/ui into apps/whispering.

Copied `packages/ui/src/` to `apps/whispering/src/lib/ui/`. Updated 79
import sites from `@whispering-open/ui` to `$lib/ui`. Removed `packages/ui`.

No remaining shared packages. The workspace now contains only `apps/whispering`.

Current verified state:

- `bun run typecheck`: 0 errors, 0 warnings
- `bun run build:web`: passes
- 45 workspace tests pass + 1 datetime-string test pass
- Commit: `f6677ef`

Remaining known items:

- Add stable release automation (GitHub Actions — AppImage requires FUSE on Ubuntu runner).
- ~~Manually reinstall on host using v7.11.0-1 release.~~ **Done** (session 7 followup — see below).
- Upgrade `@sveltejs/vite-plugin-svelte` to v7 + vite 8 (deferred — requires vite.config.ts type audit).
- Cosmetic cleanup of remaining bradenwong/Epicenter text references in comments and source files.

### Host reinstall (session 7 followup)

Replaced old May-26 binary with v7.11.0-1 from GitHub release:

- Downloaded `Whispering.Open-7.11.0-1-1.x86_64.rpm` (19MB) from GitHub releases API
- Extracted with `rpm2cpio | cpio -idm`
- Binary: `~/.local/opt/whispering-open/root/usr/bin/whispering-open` (45MB Tauri ELF)
- Symlink: `~/.local/bin/whispering-open` → binary
- Desktop file: `~/.local/share/applications/whispering-open.desktop` unchanged
- `~/.local/opt/whispering-open/version`: `v7.11.0-1`

## 2026-05-28 (session 6)

Proven local Tauri desktop build, published first GitHub Release, verified dotfiles-sway integration.

Build command (inside `damianf` Fedora 44 Toolbox):

```sh
toolbox run --container damianf bash -c "
  cd /var/home/damian/whispering-open
  export WHISPER_DONT_GENERATE_BINDINGS=1
  bun run tauri build --bundles rpm,deb
"
```

Artifacts produced:

- `apps/whispering/src-tauri/target/release/whispering-open` — binary (Tauri desktop app)
- `apps/whispering/src-tauri/target/release/bundle/rpm/Whispering Open-7.11.0-1.x86_64.rpm` (19MB)
- `apps/whispering/src-tauri/target/release/bundle/deb/Whispering Open_7.11.0_amd64.deb` (19MB)

AppImage deferred: Toolbox containers lack FUSE support — `tauri build --bundles appimage` downloads
`linuxdeploy-x86_64.AppImage`, which is itself an AppImage requiring FUSE. AppImage will be built in
GitHub Actions (Ubuntu runners have FUSE). For Fedora Atomic Sway, the RPM is sufficient.

**Version convention established:**
- Internal version (Cargo/semver): `{upstream}-{our_build}`, e.g. `7.11.0-1`
- GitHub release tag matches: `v7.11.0-1`
- Next upstream update `7.12.0` → release `v7.12.0-1`

**First release published:** `v7.11.0-1` at https://github.com/dmwasielewski/whispering-open/releases/tag/v7.11.0-1
- Asset: `Whispering.Open-7.11.0-1-1.x86_64.rpm` (19MB)
- RPM extracts cleanly with `rpm2cpio`, binary launches on Fedora Sway Atomic

**dotfiles-sway integration verified:**
- `scripts/setup-whispering-open.sh` already points to `dmwasielewski/whispering-open`
- Picks up RPM asset automatically from GitHub releases API
- Desktop file at `applications/whispering-open.desktop` already present
- No changes needed to dotfiles-sway

Updated: BUILD_LINUX.md (accurate build steps), AI_GUIDE.md (verified commands, completed items).

Remaining known items:

- Add stable release automation (GitHub Actions CI/CD — AppImage requires Ubuntu runner with FUSE).
- Manually reinstall on host using new v7.11.0-1 release (old binary from May 26 still at ~/.local/opt/whispering-open/).

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
