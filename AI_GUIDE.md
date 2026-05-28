# AI Guide

This repo is a staged extraction of `apps/whispering` from the original monorepo.

Whispering Open should become a standalone speech-to-text desktop app that Damian can build, release, and install automatically from `dotfiles-sway`. The current code still carries old workspace structure and package naming. That is expected at this stage.

## Rules

- Keep all repository artifacts in English: documentation, code comments, commit messages, issue notes, release notes, and user-facing app text unless there is an intentional localization change.
- Preserve a working build at each step.
- Treat `apps/whispering` as the Whispering Open product surface.
- Use `docs/FUNCTIONALITY.md` as the source of truth for which features stay, which inherited Epicenter features should be removed, and which decisions are deferred.
- Treat nonessential shared packages as temporary dependencies to remove only after verification.
- Do not remove license files.
- Do not rename package scopes or Tauri identifiers until build/typecheck passes in the extracted repo.
- Always use the configured `.githooks/pre-push` hook before pushing. It runs `gitleaks detect --source . --redact --verbose`. Do not bypass it.
- Prefer small commits: copy/extract, verify, then simplify.
- Update documentation in the same change when behavior, build, release, packaging, or project direction changes.
- Keep `dotfiles-sway` integration in mind: releases from this repo are consumed by `scripts/setup-whispering-open.sh` there.
- Public repo rule: assume every commit is visible and permanent. Do not commit secrets, local tokens, private logs, or user data.

## Project Goal (three phases)

**Phase 1 — Clean Epicenter extraction (current):**
Remove all remaining Epicenter/bradenwong references. Inline `packages/ui` into the app. Zero errors, clean build throughout.

**Phase 2 — Fedora Sway Atomic adaptation:**
Verify and fix desktop integration on Fedora Sway Atomic (Wayland, Sway WM): global shortcuts, tray icon, rpm-ostree install flow, dotfiles-sway automation.

**Phase 3 — Personal customisation:**
Adapt logic and GUI to Damian's personal needs: recording flow, transcription options, keyboard shortcuts, UI layout.

Work strictly in this order. Do not personalise before cleaning. Do not adapt for Sway before cleaning is done.

## Priority Order

1. Keep the current app buildable.
2. Keep Fedora Sway Atomic desktop behavior working.
3. Remove old workspace dependencies in small reversible steps.
4. Rename/brand after technical dependencies are understood.
5. Add release automation only after local desktop builds are proven.

## Verified Commands

As of 2026-05-28 (session 8):

```sh
bun install
bun run typecheck
bun test apps/whispering/src/lib/utils/workspace/document/create-kv.test.ts apps/whispering/src/lib/utils/workspace/document/create-table.test.ts apps/whispering/src/lib/utils/workspace/document/attach-broadcast-channel.test.ts apps/whispering/src/lib/utils/workspace/document/local-only-recipe.test.ts
bun run build:web
```

Desktop build (inside `damianf` toolbox):

```sh
toolbox run --container damianf bash -c "
  cd /var/home/damian/whispering-open
  export WHISPER_DONT_GENERATE_BINDINGS=1
  bun run tauri build --bundles rpm,deb
"
```

CI release (GitHub Actions — triggers build + GitHub Release upload):

```sh
# Tag-based release (production):
git tag vX.Y.Z-N
git push origin main && git push origin vX.Y.Z-N

# Manual build-only test (no release):
gh workflow run release.yml --repo dmwasielewski/whispering-open --field tag=''
```

`typecheck` reports **0 errors and 0 warnings** (all 11 Svelte warnings fixed).
The focused workspace tests above pass (45 tests, 0 failures).

## Current Extraction Notes

The app currently has no remaining `@epicenter/*` import references.

All packages have been either removed or renamed, then inlined:

- `@epicenter/svelte` → inlined into `$lib/utils/svelte-utils/`
- `@epicenter/workspace` → inlined into `$lib/utils/workspace/`
- `@epicenter/ui` → renamed to `@whispering-open/ui`, then inlined into `$lib/ui/` (session 7)

No remaining shared packages. The workspace now contains only `apps/whispering`.

The only remaining Epicenter-origin identifier is the Tauri app bundle ID:
`com.bradenwong.whispering`. That rename requires a dedicated migration because
it affects app data storage paths and desktop launcher identity.

Known cleanup items (Phase 1 — remaining):

- ~~Inline `packages/ui` (`@whispering-open/ui`) into `apps/whispering/src/lib/` — last shared package.~~ **Done** (session 7).
- Remove remaining Epicenter/bradenwong text references in docs and source comments (non-import, cosmetic).
- Upgrade `@sveltejs/vite-plugin-svelte` to v7 + vite 8 (deferred: vite.config.ts type work needed).
- ~~Add stable release automation (GitHub Actions — AppImage requires Ubuntu CI with FUSE).~~ **Done** (session 8).

Completed:

- Local Tauri desktop build proven + first release published (session 6): RPM (19MB) builds in `damianf` toolbox. Release `v7.11.0-1` published to GitHub. `dotfiles-sway` integration verified — no changes needed there. AppImage deferred to CI (requires FUSE). See BUILD_LINUX.md.
- All 21 Dependabot vulnerabilities resolved (session 5, commit 5402751) — see DAMIAN_NOTES.md for details.
- All 11 Svelte warnings fixed (session 4, commit a4dc7fd):
  - 7 self-closing void element warnings (div, span) in TextPreviewDialog.svelte
    and transcription settings page — replaced with explicit closing tags.
  - 4 `state_referenced_locally` warnings fixed with `untrack()` in
    EditRecordingModal.svelte, KeyboardShortcutRecorder.svelte,
    GlobalKeyboardShortcutRecorder.svelte, LocalKeyboardShortcutRecorder.svelte.

## Documentation Contract

- `AGENTS.md`: short operational rules for AI agents.
- `AI_GUIDE.md`: current strategy and verified commands.
- `AI_ERRORS.md`: mistakes already learned the hard way.
- `DAMIAN_NOTES.md`: chronological project notes and decisions.
- `PROJECT_STRUCTURE.md`: what each folder is for.
- `RELEASES.md`: how GitHub releases should be produced and consumed.
- `docs/FUNCTIONALITY.md`: product scope, feature retention/removal list, and deferred decisions.
