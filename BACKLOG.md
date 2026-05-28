# Backlog

Items to investigate, fix, or implement. Ordered by priority within each phase.

---

## Phase 2 — Fedora Sway Atomic verification and fixes

### P2-1: Verify "Launch on Startup" works after reboot
**Status:** needs testing  
**What:** Enable "Launch on Startup" in Settings was done (2026-05-28). File
`~/.config/autostart/Whispering Open.desktop` was created and systemd picked it up.  
**Test:** reboot Fedora → check if app launches automatically at login.  
**Pass:** app window appears (or app runs in background) without manually launching it.

---

### P2-2: Tray icon — run app in background without open window
**Status:** ✅ DONE (v7.11.0-4, session 9)  
**What was done:** Implemented `tray.ts` with lazy-init TrayIcon, Show/Hide/Settings/Quit menu,
icon sync with recorder state. Added `core:tray:default` capability and `bundle.resources` for
`recorder-state-icons`. Tray icon visible in Waybar, click → show/hide window.

---

### P2-3: No minimize-to-tray button visible (Sway has no taskbar)
**Status:** ✅ DONE (v7.11.0-4, session 9)  
**What was done:** Close button now hides window to tray via `CloseRequested` handler in
`app.run()`. App does not exit on window close — use Quit from tray menu to exit.

---

### P2-4: Verify core transcription features on Fedora Sway
**Status:** needs testing  
**What:** Verify each output feature works on the actual installed desktop app:
- [ ] Copy transcript to clipboard — does clipboard get populated?
- [ ] Paste transcript at cursor — does it type at the focused app?
- [ ] Press Enter after pasting — does Enter get simulated?
- [ ] Same checks for Transformation output (copy / paste / enter)
**Note:** "Paste at cursor" uses `xdotool` / `libxdo` for key simulation. On Wayland this
may require `GDK_BACKEND=x11` or a Wayland-native alternative (`ydotool`, `wtype`).

---

### P2-5: Sound settings — verify microphone/VAD options work on Fedora Sway
**Status:** needs testing  
**What:** The Sound tab in settings has options (input device, VAD, etc.). These rely on
ALSA/PulseAudio/PipeWire. On Fedora Sway with PipeWire, behavior may differ from upstream.  
**Test:** open Sound settings, select a microphone, record something, verify audio is captured.  
**Known risk:** VAD (voice activity detection) uses WebRTC — may have issues on Wayland.

---

### P2-6: Keyboard shortcuts — verify global hotkeys work on Fedora Sway
**Status:** needs testing  
**What:** The app has configurable keyboard shortcuts (shortcuts settings tab). On Wayland,
global hotkeys (captured while the app is in the background) require special permissions.  
**Test:** set a shortcut in settings, focus another app, press the shortcut — does the app respond?  
**Known risk:** Wayland does not allow apps to capture global input by default. May need
a portal or `tauri-plugin-global-shortcut` with Wayland support.

---

## Phase 2 → Phase 3 boundary

### P2-7: Remove Privacy & Analytics tab and all tracking code
**Status:** ready to start  
**What:** Full analytics infrastructure still exists in TypeScript even though the Rust backend
is disabled (APTABASE_KEY is empty). The frontend still calls `rpc.analytics.logEvent` in many
places and the settings tab is visible.  
**Files to remove/clean:**
- `src/lib/services/analytics/` (desktop.ts, web.ts, types.ts)
- `src/lib/query/analytics.ts`
- `src/lib/query/actions.ts` — remove 3× `rpc.analytics.logEvent` calls
- `src/lib/query/transcription.ts` — remove 5× `rpc.analytics.logEvent` calls
- `src/routes/(app)/+layout.svelte` — remove `app_started` logEvent
- `src/routes/(app)/(config)/settings/analytics/+page.svelte` — delete entire file
- `src/routes/(app)/(config)/settings/SidebarNav.svelte` — remove Analytics nav entry
- `Cargo.toml` — remove `tauri-plugin-aptabase` dependency
- `src-tauri/src/lib.rs` — remove all aptabase code (already guarded but still present)
**Why:** Dead code, external dependency (aptabase.com), privacy hygiene.

---

## Independence from upstream author — fix external dependencies

### IND-1: Parakeet models hosted on private EpicenterHQ repo
**Status:** ready to start  
**What:** Parakeet model files are downloaded from `github.com/EpicenterHQ/epicenter/releases/download/models/parakeet-tdt-0.6b-v3-int8/`. This is the upstream author's private app repo — if it goes private or is deleted, Parakeet downloads break.  
**Files:** `src/lib/services/transcription/local/parakeet.ts`  
**Fix:** Re-host model files on our GitHub releases (`dmwasielewski/whispering-open`) or find the official public source. NVIDIA's Parakeet model is on Hugging Face at `nvidia/parakeet-tdt-0.6b-v2` but the int8-quantised ONNX versions need to be sourced or re-exported.  
**Priority:** medium (works now but fragile)

---

### IND-2: GitHub star counter uses ungh.cc (unofficial third-party proxy)
**Status:** ready to start  
**What:** `src/lib/ui/github-button/index.ts` fetches star count from `https://ungh.cc/repos/{owner}/{repo}`. `ungh.cc` is an unofficial GitHub API caching proxy — not affiliated with GitHub, could disappear.  
**Fix:** Replace with direct GitHub API call (`api.github.com/repos/...`) or remove the star count widget entirely (it shows upstream star count anyway, irrelevant for a fork).  
**Priority:** low (cosmetic only)

---

### IND-3: Chrome Web Store links point to upstream extension
**Status:** ready to start  
**What:** Two pages link to the upstream author's Chrome extension:
- `src/routes/(app)/(config)/desktop-app/+page.svelte`
- `src/routes/(app)/(config)/global-shortcut/+page.svelte`

Link: `chromewebstore.google.com/detail/whispering/oilbfihknpdbpfkcncojikmooipnlglo`

We have no Chrome extension. These links are misleading.  
**Fix:** Remove the links or replace with a note that there is no browser extension for this fork.  
**Priority:** low (cosmetic)

---

### IND-4: YouTube tutorial videos from upstream author
**Status:** ready to start  
**What:** Two pages embed or link to the upstream author's tutorial videos:
- `install-ffmpeg/+page.svelte` — links to upstream's FFmpeg tutorial
- `macos-enable-accessibility/+page.svelte` — **embeds** a YouTube video (`<iframe>`) for macOS setup (irrelevant for Linux)

The macOS accessibility page itself is irrelevant on Fedora.  
**Fix:** Remove the macOS accessibility page from navigation (Linux-only fork), remove/replace YouTube embeds.  
**Priority:** low

---

### IND-5: Evaluate and choose best local models for transcription + translation
**Status:** needs investigation  
**What:** The app supports: Whisper.cpp (tiny/small/medium/large-v3-turbo), Moonshine (base/small), Parakeet. All require local downloads. Need to evaluate:
- Which are fully free and open-source with no usage restrictions?
- Which work best for Polish + English transcription?
- Which support translation (e.g. PL→EN)?
- What are the size/quality/speed trade-offs on Damian's hardware?

**Known model sources:**
| Model | Source | Free? | PL support | Translation |
|-------|--------|-------|-----------|-------------|
| Whisper tiny/small/medium/large-v3-turbo | HuggingFace (ggerganov) | ✅ MIT | ✅ | ✅ |
| Moonshine base/small | HuggingFace (UsefulSensors) | ✅ Apache 2.0 | ❓ (EN-only trained) | ❌ |
| Parakeet tdt-0.6b | EpicenterHQ (private host) | ✅ Apache 2.0 (NVIDIA) | ❌ (EN-only) | ❌ |

**Recommendation to investigate:** Whisper large-v3-turbo is likely best for PL+EN — it's multilingual, fast, MIT licensed, hosted on official HuggingFace. Moonshine and Parakeet are English-only.  
**Priority:** medium (impacts daily use)

---

## Phase 3 — Personalisation

### P3-1: Visual improvements
**Status:** deferred (logic and correctness first)  
**What:** UI/UX improvements tailored to Damian's preferences.  
**When:** after all Phase 2 verification is complete and app runs reliably on Sway.

---

## Deferred (not blocking)

- Upgrade `@sveltejs/vite-plugin-svelte` to v7 + vite 8 (requires vite.config.ts type audit)
- Rename Tauri bundle ID from `com.bradenwong.whispering` (requires dedicated migration — affects app data paths)
- Cosmetic cleanup of remaining bradenwong/Epicenter text in comments and non-import source files
