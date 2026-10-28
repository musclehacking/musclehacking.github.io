# Security and cache policy

`public/_headers` owns static response headers. `src/pages/api/subscribe.ts` applies equivalent API-safe headers because Static Assets rules do not apply to Worker-generated responses.

The CSP denies objects and framing, restricts the base URI and form target, and keeps `script-src` free of `unsafe-inline`. `scripts/finalize-headers.mjs` hashes Astro's emitted inline scripts after every build. `scripts/verify-dist.mjs` confirms that every inline script has an allowed hash.

`style-src 'unsafe-inline'` is required by Astro's island wrapper style and existing style attributes. `build.inlineStylesheets: 'never'` keeps bundled stylesheets external after repeated mobile controls found a homepage image-paint cost from small-style inlining. The explicit 4096-byte asset inlining limit retains the existing script/hash policy; it does not override the stylesheet setting. `/llms.txt` has an explicit UTF-8 plain-text header at the Static Assets boundary.

Fingerprint-named assets use long immutable caching. HTML, 404, feed, sitemap, robots, and `llms.txt` remain revalidatable. HSTS is intentionally absent until both production hosts and the separate `dev.musclehacking.com` service are reviewed.

No analytics or unapproved third-party browser script ships. The one approved exception is Cloudflare Turnstile (POL-07): `https://challenges.cloudflare.com` appears in `script-src` and `frame-src` and loads only when a newsletter form is submitted. `scripts/finalize-headers.mjs` appends inline hashes after the authored `script-src` sources. JSON-LD blocks are data and are not hashed. `recaptcha` is a forbidden output string.
