# Newsletter architecture

Every form performs a native `POST` to `/api/subscribe`. The Worker bounds the request and fields, rejects unknown fields, validates source paths and origin, checks a honeypot, and accepts only form content types.

Form placement follows the retained legacy route matrix in `tests/fixtures/legacy/pages.json`. The home page and Join page each render one form, the Blog index and One Last Step page render none, every article plus Books, the fat-loss guide, and Supplements render one end-of-content form, and the calculator renders its end-of-content form plus its floating and exit-intent prompts. `scripts/verify-dist.mjs` checks these counts in built output.

The provider adapter requires all of these runtime secrets or variables:

- `NEWSLETTER_PROVIDER_URL`
- `NEWSLETTER_PROVIDER_TOKEN`
- `NEWSLETTER_AUDIENCE_ID`
- `RECAPTCHA_SECRET`
- `NEWSLETTER_ALLOWED_ORIGIN` for the exact hosted preview origin only

Values must be separate for preview and production. Production does not need `NEWSLETTER_ALLOWED_ORIGIN` because the canonical origin is always accepted. Never store values in Git or logs. The adapter verifies reCAPTCHA first, calls the provider with a timeout, and maps failures to stable redacted responses. It returns a relative `303 Location: /one-last-step/` only after provider success.

The existing PHP handler, provider destination, server-side challenge policy, and credentials were not recoverable from the repository or safe public inspection. The endpoint therefore fails closed with `503 newsletter_unavailable` when configuration is absent. Production cutover remains blocked until a human confirms the existing destination and authorises a sandbox test.

Browser challenge integration is not active. `NewsletterForm.astro` does not create a reCAPTCHA token, and the static CSP does not allow Google challenge resources. Do not configure or enable the provider path until a human approves the challenge provider, public site key, exact CSP origins, and hosted sandbox success test. Until then, a browser-shaped submission remains fail-closed: missing provider configuration returns `newsletter_unavailable`, and an otherwise configured provider rejects the missing challenge before any network request.
