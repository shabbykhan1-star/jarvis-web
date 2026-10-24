# Project JARVIS — Development Log

**Mission:** Build a private, useful iPhone-first AI assistant for the user (default Hinglish voice, addressing user as 'Boss') with secure permissioned task workflows.

**Source of truth:** This repository once the user publishes it. A ChatGPT reminder is not a continuously running development daemon; each session only persists if changes are written to accessible durable storage.

## 2026-10-24 — WEB 1.1 (local artifact, not yet deployed)

**Built:** Voice playback settings for en-IN, ur-PK and hi-IN system voices; manual preview; optional auto-speaking for chat replies; saved preferences; voice feature explanation and updated test list. Preserved prior browser data schema/key to avoid migrations. Bumped service worker cache key.

**Testing:** JS syntax/static UI checks and local Chromium smoke test where available. Actual iPhone Safari/system-voice behavior is NOT verified without a physical iPhone and hosted URL.

**Limitations:** No model backend, no server connection, no live trend verification, no autonomous thumbnail generation, no iPhone-wide control, no always-on microphone, no real human emotions. Browser data is not synced.

**Next priorities:** (1) User publishes or connects a persistent private source repository; (2) test Safari install and voice on device; (3) secure key-protected API server; (4) personal memory syncing with privacy controls; (5) relevant creator tools; (6) proper push notifications with explicit permission.

**Security:** Never put API keys or personal data in public GitHub Pages source. Confirm user permission before external actions.