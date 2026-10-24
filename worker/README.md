# JARVIS Brain — Optional Cloudflare Worker (iPhone-compatible setup)

This is a **backend template**, not a deployed AI service. JARVIS Web 1.2's frontend lives on GitHub Pages; static GitHub Pages cannot safely hold a private AI API key. A separate server/Worker is necessary.

## Using only an iPhone

1. Open [Cloudflare Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) in Safari and sign in, or create an account if eligible. Select **Create application > Worker** and create one named `jarvis-brain` (dashboard terminology may vary). Do not grant repository permissions beyond what is necessary.
2. Choose **Edit code**, replace starter Worker code with the **complete source of `worker/worker.mjs`** in this repo, then **Deploy**. It uses Cloudflare's module Worker format.
3. Open your Worker **Settings > Variables and Secrets**, and add these as **Secret** values, *not plain text*:
   - `OPENAI_API_KEY`: an API key for an OpenAI developer account with available usage budget. This is distinct from ChatGPT subscriptions; obtain/handle account billing only with appropriate authorization.
   - `JARVIS_ACCESS_TOKEN`: generate a long unique random access code (minimum ~32 unpredictable characters). Do NOT use a personal password or public token.
   - `ALLOWED_ORIGIN`: `https://shabbykhan1-star.github.io` (no trailing slash, no `/jarvis-web` path).
   - Optional non-secret text variable `OPENAI_MODEL`: `gpt-4.1-mini`. Ensure model is available in your API account.
4. Deploy the secrets/settings. Copy only the **Worker URL** (like `https://jarvis-brain.<your-subdomain>.workers.dev`).
5. Open [JARVIS WEB](https://shabbykhan1-star.github.io/jarvis-web/) in Safari, go to **Setup > AI Brain**, enter the Worker URL and **JARVIS_ACCESS_TOKEN** (not the API key) and Save.
6. In **JARVIS** chat, try `Tu zyada bolta ni`. It should respond via the AI backend, not with scripted offline text. In an iPhone Home Screen install, you may need to enter the temporary access code again after restarting.

## Security and limits

- This repository is **public**. Never paste secret values into GitHub commits, GitHub Pages JavaScript, screenshots or chats. Secret values live only in the Worker config and on the user's private iPhone session. The browser persists only the Worker URL, not the token. The token in sessionStorage is readable by scripts on this origin; avoid third-party scripts and clear browser data if the device is lost.
- **CORS is not authentication.** The Worker also checks a private access token; still set Cloudflare rate limits and budget caps to control costs and abuse, and rotate token on suspected leaks.
- Chat messages are sent to the Worker/OpenAI when AI mode is used. Saved notes/tasks are NOT sent unless 'Allow AI to read my saved notes...' is turned on.
- No iPhone system control, background mic, automatic thumbnails, synced cloud memory or live browser tools yet.
- The Worker deliberately never accesses GitHub, private files, or external task APIs. Conversation only.
- `OPENAI_API_KEY` is for separate pay-as-you-go API usage and does not come automatically with a ChatGPT subscription.

## Troubleshooting

- **Offline assistant**: Open Setup and verify Worker HTTPS URL and temporary access code.
- **401 error**: Secret `JARVIS_ACCESS_TOKEN` must exactly match the code in Setup.
- **403 Origin not allowed**: Secret `ALLOWED_ORIGIN` must exactly equal `https://shabbykhan1-star.github.io`.
- **502/504**: Check Worker logs, API account quota, available model and connectivity. Do not copy secrets into troubleshooting screenshots.
- **API too expensive**: Disable Worker/rotate token and configure rate limits/caps. Client sends a small conversation window and Worker caps output to 450 tokens to help manage usage.

Reference docs: https://developers.cloudflare.com/workers/get-started/dashboard/ and https://developers.cloudflare.com/workers/configuration/secrets/ and https://developers.openai.com/api/reference/resources/responses/methods/create