# Security and cache policy

`public/_headers` owns static response headers. `src/pages/api/subscribe.ts` applies equivalent API-safe headers because Static Assets rules do not apply to Worker-generated responses.

The CSP denies objects and framing, restricts the base URI and form target, and keeps `script-src` free of `unsafe-inline`. `scripts/finalize-headers.mjs` hashes Astro's emitted inline scripts after every build. `scripts/verify-dist.mjs` confirms that every inline script has an allowed hash.

Fingerprint-named assets use long immutable caching. HTML, 404, feed, sitemap, robots, and `llms.txt` remain revalidatable. HSTS is intentionally absent until both production hosts and the separate `dev.musclehacking.com` service are reviewed.

No analytics or unapproved third-party browser script ships. The future newsletter challenge may require explicit reCAPTCHA or Turnstile origins after the provider decision.
