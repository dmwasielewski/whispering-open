# Inline packages/ui Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inline `packages/ui` (`@whispering-open/ui`) into `apps/whispering/src/lib/ui/`, removing the last shared workspace package.

**Architecture:** Copy the entire `packages/ui/src/` tree into `apps/whispering/src/lib/ui/`, rewrite all 79 import sites from `@whispering-open/ui/xxx` to `$lib/ui/xxx`, then remove the package from the workspace. The `$lib` alias is already set up by SvelteKit and points to `apps/whispering/src/lib/` — no config changes needed.

**Tech Stack:** Bun, SvelteKit (Svelte 5), TypeScript, `sed`/`rg` for bulk import replacement.

---

## File Map

**Copy (whole tree):**
- `packages/ui/src/**` → `apps/whispering/src/lib/ui/**` (verbatim copy)

**Modify:**
- `apps/whispering/package.json` — remove `@whispering-open/ui` devDependency
- `packages/ui/src/hooks/use-combobox.svelte.ts` — has a JSDoc self-reference (`@whispering-open/ui`) that needs updating before copy
- All 79 files in `apps/whispering/src/` that import from `@whispering-open/ui`

**Remove:**
- `packages/ui/` directory (entire package)
- `packages/ui` entry from root `package.json` workspaces (already covered by `packages/*` glob — no change needed)

---

### Task 1: Copy packages/ui/src into apps/whispering/src/lib/ui

**Files:**
- Create: `apps/whispering/src/lib/ui/` (entire subtree from `packages/ui/src/`)

- [ ] **Step 1: Copy the source tree**

```bash
cp -r /var/home/damian/whispering-open/packages/ui/src /var/home/damian/whispering-open/apps/whispering/src/lib/ui
```

- [ ] **Step 2: Verify the copy**

```bash
ls /var/home/damian/whispering-open/apps/whispering/src/lib/ui/
```

Expected: directories like `button/`, `dialog/`, `sonner/`, `sidebar/`, etc. and files `app.css`, `utils.ts`, `prose.css`.

- [ ] **Step 3: Fix the JSDoc self-reference inside the copied file**

The copied file `apps/whispering/src/lib/ui/hooks/use-combobox.svelte.ts` has a JSDoc comment referencing `@whispering-open/ui`. Update it:

```bash
sed -i 's|@whispering-open/ui|@lib/ui|g' /var/home/damian/whispering-open/apps/whispering/src/lib/ui/hooks/use-combobox.svelte.ts
```

(This is a doc comment only — no functional import to fix here.)

---

### Task 2: Rewrite all import sites in apps/whispering/src

**Files:**
- Modify: all 79 `.svelte` / `.ts` files in `apps/whispering/src/` that import from `@whispering-open/ui`

- [ ] **Step 1: Bulk-replace all imports**

```bash
cd /var/home/damian/whispering-open
rg -l '@whispering-open/ui' apps/whispering/src | xargs sed -i "s|'@whispering-open/ui/|'\$lib/ui/|g; s|\"@whispering-open/ui/|'\$lib/ui/|g"
```

Note: The CSS import `import '@whispering-open/ui/app.css'` uses no subpath after `/app.css` — handle it:

```bash
rg -l '@whispering-open/ui' apps/whispering/src | xargs sed -i "s|'@whispering-open/ui/app\.css'|'\$lib/ui/app.css'|g; s|\"@whispering-open/ui/app\.css\"|'\$lib/ui/app.css'|g"
```

- [ ] **Step 2: Verify no remaining @whispering-open/ui imports in src**

```bash
rg '@whispering-open/ui' /var/home/damian/whispering-open/apps/whispering/src
```

Expected: zero lines of output.

- [ ] **Step 3: Verify $lib/ui imports look correct (spot-check)**

```bash
grep -r '\$lib/ui' /var/home/damian/whispering-open/apps/whispering/src/routes/+layout.svelte
```

Expected output includes lines like:
```
import { Toaster } from '$lib/ui/sonner';
import '$lib/ui/app.css';
import * as Tooltip from '$lib/ui/tooltip';
```

---

### Task 3: Remove @whispering-open/ui from apps/whispering/package.json

**Files:**
- Modify: `apps/whispering/package.json`

- [ ] **Step 1: Remove the devDependency**

Open `apps/whispering/package.json` and delete the line:
```json
"@whispering-open/ui": "workspace:*",
```

- [ ] **Step 2: Run bun install to refresh lockfile**

```bash
cd /var/home/damian/whispering-open && bun install
```

Expected: no errors. `bun.lock` refreshes without `@whispering-open/ui`.

---

### Task 4: Run typecheck to verify

**Files:** (read-only verification)

- [ ] **Step 1: Run typecheck**

```bash
cd /var/home/damian/whispering-open && bun run typecheck
```

Expected: **0 errors, 0 warnings**.

If there are errors about missing imports, check that the `$lib/ui/` path exists and the index.ts for that component is present.

---

### Task 5: Run build:web to verify

- [ ] **Step 1: Run web build**

```bash
cd /var/home/damian/whispering-open && bun run build:web
```

Expected: build completes with no errors.

---

### Task 6: Remove packages/ui directory

**Files:**
- Remove: `packages/ui/`

- [ ] **Step 1: Delete the package directory**

```bash
rm -rf /var/home/damian/whispering-open/packages/ui
```

- [ ] **Step 2: Re-run bun install (workspace rescan)**

```bash
cd /var/home/damian/whispering-open && bun install
```

Expected: no errors. The `packages/*` glob in root `package.json` will no longer find `packages/ui`.

- [ ] **Step 3: Re-run typecheck to confirm nothing broke**

```bash
cd /var/home/damian/whispering-open && bun run typecheck
```

Expected: **0 errors, 0 warnings**.

- [ ] **Step 4: Re-run build:web**

```bash
cd /var/home/damian/whispering-open && bun run build:web
```

Expected: clean build.

---

### Task 7: Run focused workspace tests

- [ ] **Step 1: Run the workspace unit tests**

```bash
cd /var/home/damian/whispering-open && bun test apps/whispering/src/lib/utils/workspace/document/create-kv.test.ts apps/whispering/src/lib/utils/workspace/document/create-table.test.ts apps/whispering/src/lib/utils/workspace/document/attach-broadcast-channel.test.ts apps/whispering/src/lib/utils/workspace/document/local-only-recipe.test.ts
```

Expected: 45 tests pass, 0 failures.

Also run the `packages/ui` datetime test that was moved into the copied tree:

```bash
cd /var/home/damian/whispering-open && bun test apps/whispering/src/lib/ui/natural-language-date-input/datetime-string.test.ts
```

Expected: all tests pass.

---

### Task 8: Run pre-push hook and commit

- [ ] **Step 1: Run gitleaks hook**

```bash
cd /var/home/damian/whispering-open && .githooks/pre-push
```

Expected: no secrets detected.

- [ ] **Step 2: Check git status**

```bash
cd /var/home/damian/whispering-open && git status --short --branch
```

- [ ] **Step 3: Stage and commit**

```bash
cd /var/home/damian/whispering-open && git add -A
git commit -m "$(cat <<'EOF'
Inline packages/ui into apps/whispering

Copies packages/ui/src/ to apps/whispering/src/lib/ui/ and rewrites
all 79 import sites from @whispering-open/ui to \$lib/ui. Removes the
packages/ui workspace package. No remaining shared packages.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Update documentation

**Files:**
- Modify: `AI_GUIDE.md` — mark packages/ui inline as completed, note current state
- Modify: `DAMIAN_NOTES.md` — add session 7 entry
- Modify: `PROJECT_STRUCTURE.md` — remove packages/ui entry, update cleanup direction
- Modify: `docs/EXTRACTION.md` — add completed cut entry
- Modify: `CHANGELOG.md` — add unreleased entry

- [ ] **Step 1: Update AI_GUIDE.md**

In the "Known cleanup items (Phase 1 — remaining)" section, mark `packages/ui` inline as done:
```
- ~~Inline `packages/ui` (`@whispering-open/ui`) into `apps/whispering/src/lib/` — last shared package.~~ **Done** (session 7).
```

Also update "Current Extraction Notes" to say there are no remaining shared packages.

- [ ] **Step 2: Add session entry to DAMIAN_NOTES.md**

Add a new section at the top of DAMIAN_NOTES.md:
```markdown
## 2026-05-28 (session 7)

Inlined packages/ui into apps/whispering.

Copied packages/ui/src/ to apps/whispering/src/lib/ui/. Updated 79
import sites from @whispering-open/ui to $lib/ui. Removed packages/ui.

No remaining shared packages. The workspace now contains only:
- apps/whispering — the product app

Current verified state:
- bun run typecheck: 0 errors, 0 warnings
- bun run build:web: passes
- All workspace and UI tests pass

Remaining known items:
- Add stable release automation (GitHub Actions — AppImage requires FUSE on Ubuntu runner)
- Manually reinstall on host using v7.11.0-1 release
- Upgrade @sveltejs/vite-plugin-svelte to v7 + vite 8 (deferred)
- Cosmetic cleanup of remaining bradenwong/Epicenter text references in comments
```

- [ ] **Step 3: Update PROJECT_STRUCTURE.md**

In "Shared Packages" section, replace `packages/ui` entry with:
```
No remaining shared packages. All code is now owned by `apps/whispering`.
```

In "Cleanup Direction", mark item 5 (or add new item) as done:
```
5. ~~Inline `packages/ui` into `apps/whispering/src/lib/ui/`.~~ **Done** (session 7).
```

- [ ] **Step 4: Update docs/EXTRACTION.md**

Add a new completed cut section for this session:

```markdown
### 2026-05-28: Inlined packages/ui into apps/whispering

`@whispering-open/ui` provided all UI components (shadcn-svelte based).
With svelte-utils and workspace already inlined, this was the last
remaining shared package.

Cut made:

- copied `packages/ui/src/` to `apps/whispering/src/lib/ui/`
- updated 79 import sites from `@whispering-open/ui` to `$lib/ui`
- removed `@whispering-open/ui` from `apps/whispering/package.json`
- removed `packages/ui` directory
- refreshed `bun.lock`

No remaining shared packages. The workspace now contains only `apps/whispering`.

Expected next step after verification:

- Add GitHub Actions CI/CD for automated AppImage builds
```

- [ ] **Step 5: Update CHANGELOG.md**

Add to the Unreleased section:
```
- Inlined `packages/ui` (`@whispering-open/ui`) into `apps/whispering/src/lib/ui/`.
```

- [ ] **Step 6: Commit documentation**

```bash
cd /var/home/damian/whispering-open && git add AI_GUIDE.md DAMIAN_NOTES.md PROJECT_STRUCTURE.md docs/EXTRACTION.md CHANGELOG.md
git commit -m "$(cat <<'EOF'
Update documentation after packages/ui inline

Records session 7 work in DAMIAN_NOTES, marks Phase 1 cleanup
complete in AI_GUIDE, updates PROJECT_STRUCTURE and EXTRACTION.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**Spec coverage:**
- [x] Copy `packages/ui/src/` to `apps/whispering/src/lib/ui/` — Task 1
- [x] Update all 79 import sites — Task 2
- [x] Remove devDependency from `apps/whispering/package.json` — Task 3
- [x] `bun install` to refresh lockfile — Task 3 Step 2
- [x] `bun run typecheck` passes — Task 4
- [x] `bun run build:web` passes — Task 5
- [x] Remove `packages/ui` directory — Task 6
- [x] Re-verify after removal — Task 6 Steps 2-4
- [x] Run tests — Task 7
- [x] Pre-push hook + commit — Task 8
- [x] Documentation updates — Task 9

**No placeholders:** All steps contain actual commands.

**Type consistency:** The import rewrite uses `$lib/ui/xxx` consistently throughout all steps.
