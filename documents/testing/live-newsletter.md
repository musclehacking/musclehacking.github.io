# Live newsletter acceptance

## Browser choice

Confirmed user instruction, 28 October 2026: use **Ego Lite** through `ego-browser-manual` for real submission tests like newsletter signup with a live anti-bot challenge. The user explicitly selected it after the task's headless Chromium received Turnstile `600010` before any form POST. This preference applies to live provider-backed submissions; it does not replace the project lifecycle wrapper or browser owner for hermetic local E2E tests, nor authorise an unapproved recipient.

Use the installed Ego Lite task-space ownership and cleanup rules. Keep the real Turnstile widget, secret, hostname/action verification, and GetResponse double opt-in enabled. Do not treat dummy tokens, an authenticated provider API call, or a mocked redirect as proof that the public form works.

## Authorisation and verification

Before sending, resolve the exact Worker/version, GetResponse list, and approved recipient. Normally use a separate test list. The human explicitly overrides that default for the 28 October acceptance run: use existing list `qwsfu` and the one address in the chat. Do not add other contacts, change confirmation settings, remove existing subscribers, or send repeated requests merely to wait for processing.

1. Read the exact recipient's current membership and list confirmation settings without listing unrelated contacts.
2. Use the deployed review URL and submit through its visible form with real Turnstile. Record the API response status and resulting page without retaining request bodies or tokens.
3. Verify the confirmation email reaches the approved inbox and follow its subscription-confirmation link when authorised. If the inbox is inaccessible, request only that missing user action.
4. Read back the same contact's confirmed list membership and autoresponder day. Provider HTTP `202` means queued, not delivered or confirmed.
5. Check missing/forged tokens, malformed email, bot-trap fields, and disallowed origin without creating additional subscribers. Keep timeout/provider-error simulation isolated; never damage live credentials or production services to induce a failure.
6. Retain one redacted acceptance record under `documents/evidence/newsletter_activation/` and ignored raw results under `.artifacts/newsletter_activation/`. Keep complete addresses, email confirmation URLs, credentials, and challenge tokens out of committed documentation and screenshots.

The newsletter architecture and WPX source discovery remain the behavioural references. Record the existing candidate differences explicitly: duplicate code `1008` is treated as success, and the visitor IP is forwarded to GetResponse. Neither legacy reCAPTCHA nor the candidate can complete a signup without JavaScript; the safe no-token rejection is the applicable compatibility check.
