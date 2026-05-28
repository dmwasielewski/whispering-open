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
**Status:** needs investigation + code change  
**What:** There is no tray icon near the clock. The user does not want the window always
open on screen — the app should run silently in the background and be reachable via tray.  
**Context:** Sway has no traditional taskbar. Waybar is used. `tauri-plugin-autostart`
starts the app but opens the full window.  
**Options to investigate:**
- Does `tauri-plugin-system-tray` / `tauri-plugin-tray-icon` already exist in the codebase?
- Can the app start minimized / hidden to tray on launch?
- Can the app be configured to show only a tray icon and hide the window by default?
**Goal:** app runs in background, tray icon visible in Waybar, click icon → show window.

---

### P2-3: No minimize-to-tray button visible (Sway has no taskbar)
**Status:** blocked by P2-2  
**What:** Standard minimize button hides to taskbar. Sway has no taskbar, so minimizing
loses the window. The tray icon (P2-2) is the correct solution — close button should
hide to tray, not kill the app.  
**Depends on:** P2-2 (tray icon must exist first).

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
**What:** The app has a "Privacy & Analytics" settings tab inherited from upstream Epicenter.
This includes telemetry, analytics tracking, and data collection features.  
**Action:** 
1. Find all analytics/telemetry code (imports, services, settings keys, UI components)
2. Remove completely — do not leave dead code behind
3. Remove the settings tab from the UI
4. Verify typecheck and build still pass after removal  
**Why:** Personal fork — no analytics needed. Cleaner codebase for future customization.

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
