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

### P2-6: Keyboard shortcuts — verify global hotkeys and installation defaults on Fedora Sway
**Status:** needs testing  

**Three separate concerns to verify:**

**6a — Are shortcuts GLOBAL (system-wide) or only LOCAL (app window must be focused)?**

Suspicion: shortcuts may only trigger when the app window is active, not when another app
is in the foreground. On Wayland, global input capture is restricted.

The app uses `tauri-plugin-global-shortcut` which registers system-wide shortcuts. However:
- The app runs with `GDK_BACKEND=x11` (XWayland mode), so Tauri's shortcut plugin uses
  the X11 global hotkey API (`XGrabKey`) via XWayland
- `XGrabKey` DOES work for global shortcuts even on Sway/Wayland via XWayland
- BUT: if Sway is running in pure Wayland mode and XWayland is not active, it will fail

**Test:** open a text editor, type something, then press `Control+Shift+;` — does the app
react (start recording) even though another window is focused?

**6b — Do default shortcuts get installed at system/session level at startup?**

Shortcuts are NOT installed at package install time. They are registered at runtime when
the app starts, via `tauri-plugin-global-shortcut`. This means:
- Shortcuts only work while the app is RUNNING (even if hidden to tray) ✅ (expected)
- Shortcuts do NOT work if the app is not running ✅ (expected — not a bug)
- If the app crashes/is killed, shortcuts are automatically unregistered

**Test:** confirm the app registers shortcuts on startup (before any user interaction).
Check `register-commands.ts` — are shortcuts registered in the app init flow?

**6c — Conflict check: do default shortcuts clash with Sway or other system shortcuts?**

Default global shortcuts (Linux, `CommandOrControl` = `Control`):
| Shortcut | Action | Sway conflict? |
|----------|--------|----------------|
| `Control+Shift+;` | Toggle recording | ✅ None — Sway uses `Super` (`Mod4`) |
| `Control+Shift+'` | Cancel recording | ✅ None |
| `Control+Shift+X` | Stop and transcribe | ✅ None |
| `Control+Shift+R` | Toggle transformation | ✅ None |

**Checked 2026-05-28:** `~/.config/sway/config` uses `set $mod Mod4` (Super/Win key). All Sway
bindings use `$mod+...` — zero conflicts with `Control+Shift+*`.

**Source:** `apps/whispering/src/lib/state/device-config.svelte.ts`

**Still needs manual test:** each shortcut while Firefox/terminal/VS Code is in focus.

**6d — XWayland limitation: global shortcuts may not capture from Wayland-native apps**

The app runs with `GDK_BACKEND=x11` (XWayland). `tauri-plugin-global-shortcut` on Linux
uses `XGrabKey` (X11 API). On Sway:
- `XGrabKey` via XWayland captures keys from **XWayland apps** (Firefox in XWayland, Electron apps)
- `XGrabKey` may **NOT** capture keys from **Wayland-native apps** (native Wayland terminals,
  Wayland-native Firefox, wl-clipboard tools) when they are focused

This is a known Wayland limitation — X11 global grabs do not extend to Wayland clients.

**Workaround if needed:** `ydotool` or a Sway keybinding that calls the app's IPC. But test first —
the impact may be small if most apps in use are XWayland-based.

**Pass criteria:**
- [ ] All 4 shortcuts trigger from any focused window (at minimum: XWayland apps)
- [ ] No conflicts with Sway's built-in shortcuts ✅ confirmed
- [ ] App registers shortcuts immediately at startup (not only after visiting Settings)
- [ ] Document whether Wayland-native apps are a problem in practice

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

## Independence from upstream author — full clean-up

**Goal:** The app must look and behave as if it was written by Damian from scratch. No traces of upstream author (Braden Wong / Epicenter), no private sources, no fragile third-party services. Every external resource must be: free, open-source, officially hosted by the original model/tool author, and stable.

---

### IND-0: Deep independence audit — run before starting IND-1 through IND-5
**Status:** ready to start  
**What:** A thorough automated audit of the entire codebase to find all remaining traces of upstream identity, private infrastructure, or fragile external dependencies.  
**Why:** The quick audit in session 9 found obvious cases. A deep audit needs to cover every file including UI text, comments, configs, assets, and build scripts.

**Agent instructions for this task:**

Scan the entire repository at `/var/home/damian/whispering-open` and produce a categorised report. For each finding, state: file path + line number, the exact string/URL, and the recommended action.

**Category A — Author identity (must remove/replace):**
- Any mention of "Braden Wong", "bradenwong", "BradenWong" in source code, UI text, comments, configs
- Any mention of "Epicenter", "EpicenterHQ", "epicenter-hq" outside of git history
- Bundle ID `com.bradenwong.whispering` — where does it still appear?
- App store / extension links pointing to upstream's published apps
- Any "about" page, footer, or credits referencing upstream author

**Category B — Private or fragile external URLs (must replace):**
- All `github.com/EpicenterHQ/*` URLs — private repo, could disappear
- All `ungh.cc/*` URLs — unofficial third-party proxy
- Any URL not from: GitHub (public repos), HuggingFace (official model authors), official API providers (OpenAI, Groq etc.), official tool authors (ffmpeg, etc.)
- YouTube links — whose channel? Could be deleted

**Category C — Non-free or non-official model sources:**
- For each model download URL, verify: is it hosted by the original model creator on an official platform (HuggingFace, official GitHub)?
- Are the model licences free for personal use? (MIT, Apache 2.0, CC-BY)
- Flag any model hosted on a third-party mirror or private account

**Category D — Analytics and telemetry (must remove):**
- Any call to `logEvent`, `trackEvent`, `analytics`, `aptabase`
- Any network call to analytics endpoints
- Any settings UI related to analytics/privacy/telemetry
- Any feature flags or remote config calls

**Category E — Platform-specific content irrelevant for Linux:**
- macOS-only pages/sections still shown on Linux (e.g. accessibility setup, macOS permissions)
- Windows-only instructions in the UI
- iOS/Android references

**Category F — Text and UI strings with upstream branding:**
- App name references that should be "Whispering Open" not "Whispering"
- Any UI text linking to upstream's website, docs, or support channels
- Any hardcoded upstream version numbers in UI text

**Output format for the agent:**
```
CATEGORY A — Author identity
  [REMOVE] apps/whispering/src/routes/.../+page.svelte:81
    "https://chromewebstore.google.com/detail/whispering/oilbfihknpdbpfkcncojikmooipnlglo"
    → Remove link, we have no extension

CATEGORY B — Private URLs
  [REPLACE] apps/whispering/src/lib/services/transcription/local/parakeet.ts:12
    "https://github.com/EpicenterHQ/epicenter/releases/download/models/..."
    → Re-host on dmwasielewski/whispering-open releases or find official HuggingFace source
...
```

After the report: do NOT apply fixes automatically. Present the full report first, then wait for approval before making any code changes.

---

### IND-0b: Apply independence fixes (after audit approved)
**Status:** blocked by IND-0  
**What:** After the IND-0 audit report is reviewed and approved, apply all fixes in one focused session. Group by category: fix all URLs first, then remove analytics, then clean up UI text, then verify build passes.  
**Verification after each group:**
1. `toolbox run --container damianf bash -c "cd apps/whispering/src-tauri && cargo check"`
2. `toolbox run --container damianf bash -c "cd apps/whispering && bun run typecheck"`
3. `toolbox run --container damianf bash -c "cd apps/whispering && bun run build:web"`
4. Local build + smoke test (app starts, tray visible, transcription works)

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
