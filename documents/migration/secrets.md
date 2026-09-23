# Secret operations

Store newsletter values as Cloudflare Worker secrets or protected build variables. Never commit, print, persist in shell profiles, or copy them into screenshots or logs.

Required names are `TURNSTILE_SECRET_KEY`, `GETRESPONSE_API_KEY`, and `GETRESPONSE_CAMPAIGN_ID` (see `documents/architecture/newsletter.md`). The Turnstile secret lives in the macOS Keychain service `musclehacking-turnstile-secret`; pipe it into `wrangler secret put` without echoing it. Set `NEWSLETTER_ALLOWED_ORIGIN` only on preview to its exact version-preview origin. Preview and production must use separate values and destinations.

Before setting any secret, verify the exact Cloudflare account and Worker. Use a human-approved sandbox recipient for the single hosted success test. Production subscriber data is out of scope for testing.
