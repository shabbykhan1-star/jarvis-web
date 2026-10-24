# JARVIS WEB 1.1 — iPhone-only starter

**What this is:** A usable, no-Mac, iPhone-friendly Progressive Web App (PWA). It includes a responsive dashboard, Wednesday/Sunday upload schedule, local task manager, creator idea bank and thumbnail briefs, private notes/preferences, command-based chat, optional voice playback, and JSON export/import.

**What it is NOT yet:** It does **not** contain an AI model; it cannot browse live trends, autonomously create thumbnail images, or deliver background push notifications. The mood selector only adapts wording. Don't put sensitive passwords or secrets in notes. Storage is local to the browser/device and not synced.

## Publish using only iPhone (GitHub Pages)

1. Create a GitHub account if needed. In Safari open https://github.com/new and make a **public** repository named `jarvis-web`. (Free GitHub Pages is supported for public repositories.)
2. In Files on iPhone, unzip `JARVIS-iPhone-Web.zip`. GitHub must receive the **contents of the folder at the repository root**, not the ZIP itself.
3. In your repo, use **Add file → Upload files** (desktop site view in Safari if needed). Upload `index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, and the icons into an `icons` folder. Important: icon paths must stay `icons/jarvis-192.png` and `icons/jarvis-512.png`. If adding folders via the mobile upload UI is awkward, first upload the four top-level files and then create `icons` folder/file paths in GitHub. No icons means the app mostly works, but install branding/offline cache may break.
4. Open **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → Folder: /(root) → Save**.
5. Wait for the Pages site URL to appear in Settings → Pages: `https://YOUR-USERNAME.github.io/jarvis-web/`. It may take several minutes to publish.
6. Open the published HTTPS website in **Safari** → Share → Add to Home Screen → turn on **Open as Web App** → Add.
7. Test tasks, reload persistence, ideas, notes, export/import. On first visit keep internet on; afterward cache enables basic offline behavior if service worker installed.

### Alternative

A web developer or static hosting provider can host this folder on any HTTPS static site. You can open `index.html` in Files for a rough preview if your browser supports it, but install/offline mode typically requires HTTPS hosting; don't rely on opening an HTML file from Files for the final test.

### Data & safety

* GitHub Pages public repository means **source code is public**, but tasks/notes in your browser's localStorage are **not uploaded** by this app. No credentials or personal notes are in repository files.
* Browser storage can be cleared; use Settings → Export backup. Store backups privately.
* PWA push notifications require an additional push server and explicit permission. This version does not send them. Existing ChatGPT automation can handle daily reminders separately.
* HTML/JS/CSS are self-contained and use no API keys.

### Quick smoke-test checklist

- [ ] App loads from `https://...` on iPhone.
- [ ] Dashboard has correct Pakistan-time Wednesday and Sunday dates.
- [ ] Add task, reload, verify persistence; mark done and delete.
- [ ] Cycle idea cards; use one to add task.
- [ ] Save note and preference; reload.
- [ ] Ask "next upload", "thumbnail idea", "add task: shoot intro", "yaad rakho: no fake face".
- [ ] Export JSON file; import it.
- [ ] Add to Home Screen and verify full-screen display.
- [ ] Go offline after first hosted load and check cached UI.

Next implementation phase: authenticated private backend for LLM + trend tools, generated image thumbnail workflow, properly configured web push. Never place a paid API key in JavaScript source or a public repo.

## Update: 2026-10-24 — WEB 1.1

- Voice options in JARVIS tab: en-IN, ur-PK or hi-IN (best available iOS system voice); test spoken output.
- Optional automatic spoken replies to user-triggered chat commands. Off by default.
- Preferences persist in browser localStorage and are included in the app backup; previous v1 storage key is preserved.
- Service-worker cache version bumped to load the update.
- Limitations: system TTS pronunciation may vary; no continuous wake word, no true AI conversation or server-side code sync.

See `DEVELOPMENT_LOG.md` for ongoing progress.