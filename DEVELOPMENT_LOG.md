# Project JARVIS — Development Log

## 2026-10-24 — iPhone PWA online refresh / offline fallback patch

**Changes:** Public shell requests in `sw.js` now use network-first responses and update the offline cache after successful online loads. Offline requests fall back to the cached shell. Cache keys ignore query parameters. Only six known same-origin public shell paths are intercepted; POST, cross-origin and arbitrary same-origin requests are bypassed. Service worker cache name changed to force refresh. Existing localStorage schema/key and all saved notes/tasks are untouched. Added `tests/sw.test.cjs` and README guidance.

**Tests:** Locally ran `node --check sw.js`, `node --check tests/sw.test.cjs` and `node tests/sw.test.cjs`: passed simulated install/activate, online freshness, offline fallback, query normalization, bypass and cache cleanup. The connector does not run remote CI; no iPhone Safari or deployed-site test was performed.

**Limitations:** Network-first may take longer to fall back on poor connections. Cached content can still be lost if Safari clears site data. No live AI backend, always-on voice, or notifications were added.

**Next priority:** Test an online refresh, Home Screen offline launch and return-online update on the user's iPhone; then validate imported JSON backups more strictly before allowing restore.


**Mission:** Build a private, useful iPhone-first AI assistant for the user (default Hinglish voice, addressing user as 'Boss') with secure permissioned task workflows.

**Source of truth:** This repository once the user publishes it. A ChatGPT reminder is not a continuously running development daemon; each session only persists if changes are written to accessible durable storage.

## 2026-10-24 — WEB 1.1 (local artifact, not yet deployed)

**Built:** Voice playback settings for en-IN, ur-PK and hi-IN system voices; manual preview; optional auto-speaking for chat replies; saved preferences; voice feature explanation and updated test list. Preserved prior browser data schema/key to avoid migrations. Bumped service worker cache key.

**Testing:** JS syntax/static UI checks and local Chromium smoke test where available. Actual iPhone Safari/system-voice behavior is NOT verified without a physical iPhone and hosted URL.

**Limitations:** No model backend, no server connection, no live trend verification, no autonomous thumbnail generation, no iPhone-wide control, no always-on microphone, no real human emotions. Browser data is not synced.

**Next priorities:** (1) User publishes or connects a persistent private source repository; (2) test Safari install and voice on device; (3) secure key-protected API server; (4) personal memory syncing with privacy controls; (5) relevant creator tools; (6) proper push notifications with explicit permission.

**Security:** Never put API keys or personal data in public GitHub Pages source. Confirm user permission before external actions.

## 2026-10-24 — WEB 1.2 response quality fix + optional AI Brain

**User feedback:** The iPhone website loaded, but entering `Tu zyada bolta ni` returned the same rigid offline fallback. This is a valid product failure; version 1.1 was not a real conversational model.

**Work completed locally:** Improved message routing and direct response to feedback, added optional AI Brain configuration in Setup (Worker URL, session-only access token, opt-in sharing of saved notes/tasks), async requests with timeouts, useful error messages, and optional Cloudflare Worker `worker/worker.mjs` that can call OpenAI Responses API using server secrets. Updated the offline cache version and usage documentation.

**Verification:** Node syntax checks and local Node tests passed for mock conversational gateway, origin enforcement, unauthorized access, request handling, no default private-context sharing, and the exact complaint from the iPhone screenshot. Chromium was blocked by sandbox administrator; the Worker has NOT been deployed and no live model has been called. Device acceptance test is still needed.

**Remaining:** User must deploy private backend and configure permitted API credentials (separate budget/permission) before calling this a real conversational AI. Set Cloudflare rate limits/budgets; browser does not get access to server's paid API key. No automatic phone control, browsing, or thumbnail image generation yet.