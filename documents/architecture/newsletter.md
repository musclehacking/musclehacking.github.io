# Newsletter architecture

Every form performs a native `POST` to `/api/subscribe`. The Worker bounds the request and fields, rejects unknown fields, validates source paths and origin, checks a honeypot, and accepts only form content types. On success it returns a relative `303 Location: /one-last-step/`.

Form placement follows the retained legacy route matrix in `tests/fixtures/legacy/pages.json`. The home page and Join page each render one form, the Blog index and One Last Step page render none, every article plus Books, the fat-loss guide, and Supplements render one end-of-content form, and the calculator renders its end-of-content form plus its floating and exit-intent prompts. `scripts/verify-dist.mjs` checks these counts in built output.

## Flow

This replaces the legacy PHP relay at `https://dev.musclehacking.com/subscription-handler.php` and Google reCAPTCHA v3 (human decision POL-07, 23 September 2026).

The [28 October 2026 WPX discovery](../migration/wpx-newsletter-discovery.md) verifies the hosted PHP source and live GetResponse list settings. The relay calls GetResponse directly; GetResponse sends and handles the email confirmation. The production list is `musclehacking`, API `campaignId=qwsfu`, with API double opt-in enabled. The redacted source and the differences from the Cloudflare candidate are recorded beside the discovery.

1. **Browser challenge.** `src/scripts/newsletter-challenge.ts` holds the first submit, loads `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` once, and renders the invisible Turnstile widget into the form's `[data-turnstile]` container with action `subscribe`. The widget writes a `cf-turnstile-response` field, then the form submits natively. Nothing loads from Cloudflare before a submit. The legacy website loads Google's script earlier and waits until submission to execute the challenge. On a challenge error the reader sees the legacy alert `Submission failed. Please try again.`
2. **Server verification.** `src/features/newsletter/provider.ts` sends the token, secret, and `CF-Connecting-IP` to Turnstile siteverify. It accepts only `success: true` with `hostname` equal to the request host and `action` equal to `subscribe`. Cloudflare's documented dummy secrets skip the host and action binding because they return synthetic values.
3. **Provider.** The Worker calls `POST https://api.getresponse.com/v3/contacts` with `X-Auth-Token: api-key <key>` and `{ email, campaign: { campaignId }, dayOfCycle: "0", ipAddress }`. `dayOfCycle: "0"` preserves the legacy `start_day=0`. GetResponse answers `202` and applies the list's own double opt-in, so it still sends the confirmation email that `/one-last-step/` asks readers to open. `409` with code `1008` (already on the list) is treated as success so the form never reveals list membership.

Without JavaScript the form still posts, but it carries no token and receives `400 challenge_failed`. The legacy reCAPTCHA form had the same requirement.

## Widget

| Field | Value |
| --- | --- |
| Name | `musclehacking-newsletter` |
| Account | `da18a65e27f34f43051b853e509ef411` (holds the `musclehacking.com` zone) |
| Mode | Invisible |
| Hostnames | `musclehacking.com` (includes `www`), `musclehacking-astro-preview.webpop.workers.dev` |
| Sitekey | `0x4AAAAAAFAolLk0PGOQbQuA`, in `site.turnstileSiteKey` (`src/config/site.ts`) |
| Secret | macOS Keychain service `musclehacking-turnstile-secret`; never commit or print it |

One widget covers both hosts so the same built version can be promoted from the review Worker to production without a rebuild. Remove the review hostname from the widget after cutover.

## Runtime configuration

| Name | Kind | Purpose |
| --- | --- | --- |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile siteverify secret |
| `GETRESPONSE_API_KEY` | Secret | GetResponse API key |
| `GETRESPONSE_CAMPAIGN_ID` | Secret or variable | GetResponse list (`campaignId`), separate for preview and production |
| `NEWSLETTER_ALLOWED_ORIGIN` | Variable, preview only | The exact hosted review origin |

The endpoint fails closed. With no `TURNSTILE_SECRET_KEY` it returns `503 newsletter_unavailable` before any network call. With a Turnstile secret but no GetResponse values it verifies the challenge first and then returns `503`, so a hosted preview can prove Turnstile before the provider is connected. Challenge failures return `400 challenge_failed`, and provider failures return `502 provider_unavailable` or `502 provider_timeout`.

The legacy PHP source hardcodes `campaignId=qwsfu`; `GET /v3/campaigns/qwsfu` verified that ID and API double opt-in on 28 October 2026. The production destination is therefore known. Preview must use a separate test list with API double opt-in. The existing API key is recoverable from the WPX configuration through the approved SFTP wrapper; it must never appear in documentation or chat. Discovery did not configure any Cloudflare secret or test a subscription.
