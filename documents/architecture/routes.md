# Route policy

`src/config/routes.ts` owns the 19 served document routes and the retired legacy URLs in `permanentRedirects`.

- Slash routes: `/`, `/blog/`, `/books/`, `/calorie-calculator/`, `/join/`, `/lose-fat-gain-muscle/`, `/one-last-step/`, `/supplements/`.
- Article routes: the 11 `/blog/<slug>` paths, without a trailing slash.
- Retired: `/blog/calorie-calculator-how-to` and its trailing-slash form return `301` to `/calorie-calculator/`. The legacy article always canonicalised to the calculator; GitHub Pages could not issue a real redirect (human decision, 23 September 2026). The home card and sidebar link now point to `/calorie-calculator/#how-to-use` through `src/config/home.ts`.
- Production GET and HEAD requests to `musclehacking.com` must return `301` to `https://www.musclehacking.com` with the path and query preserved. This is an external Cloudflare cutover requirement, not local Worker behaviour.
- A section without its slash returns `301` with a relative `Location` for the slash form.
- An article with a trailing slash returns the custom body with status `404`.
- An unknown route returns the custom body with status `404`.

`/join/` and `/one-last-step/` are `noindex` and excluded from the sitemap. Every indexable route uses a self-canonical on `https://www.musclehacking.com`. Preview hosts never enter discovery output.

`scripts/shape-routes.mjs` generates the build-only `_redirects` file from this route source, writing `permanentRedirects` first so no route rule can shadow them. Do not add `public/_redirects`; the build overwrites it. Cloudflare HTML auto-routing stays disabled so article trailing-slash requests reach the custom `404` instead of redirecting.

The local Wrangler preview does not redirect an apex `Host` header because only `/api/subscribe` invokes the Worker. Cutover remains blocked until the external apex redirect rule and exact rollback are recorded and approved.
