# IndexNow preparation

Status: prepared locally; production cutover and submission remain unapproved. No submission or deployment runs during a build, test, preview upload, or ordinary invocation.

## Ownership and release boundary

`public/indexnow.txt` contains the stable public ownership code. It is public proof, not an account credential. `scripts/indexnow.mjs` reads the canonical origin from `src/config/site.ts` and the generated sitemap from `dist/client/sitemap.xml`. Directory URLs map to `index.html`; extensionless article URLs map to `.html`, following `scripts/shape-routes.mjs`. HTML robots declarations exclude new noindex pages. A formerly indexed page that becomes noindex remains a removal candidate.

The production branch remains `master`. The review Worker remains `musclehacking-astro-preview`; source configuration names `musclehacking-astro`. The cutover runbook owns the current account-access checkpoint. Release authority, generated Wrangler configuration, bindings, commands, and domains are unchanged. No deploy wrapper or provider job is installed because a verified production release controller does not yet exist. Automatic after-publication integration is an explicit activation gap for the approved cutover packet.

## Isolated verification

Write notifier cases before adapting executable code. Browser E2E cannot safely expose ownership mismatches, stale publication, HTTP retry ordering, comparison timeouts, or accidental submission against real production services. Unit tests use temporary generated sites and an injected fake transport. Expected outcomes: only canonical changed/add/remove URLs qualify; no POST precedes ownership, crawler-policy and byte verification; failed/stale reads prevent submission; retries are bounded; preview branches and missing cutover authority cause zero requests. There is no deployment operation to mock or invoke.

## Local review

After a normal project build, list eligible local pages without network calls:

```bash
pnpm --dir /Users/sacino/musclehacking indexnow --plan
```

Read-only comparison with production (no deployment or POST):

```bash
pnpm --dir /Users/sacino/musclehacking indexnow --dry-run
```

This comparison includes additions, changed HTML, removed pages and formerly indexed pages now marked noindex. An unavailable individual page counts as changed; an unreadable live ownership file or sitemap fails the comparison visibly. Missing live ownership selects the one-time initial migration batch.

## Unexecuted after-cutover procedure

Only after human approval of the exact production cutover and notification target:

1. Publish the approved release through its established controller. Confirm the exact commit, production Worker/account and successful publication. Confirm `www.musclehacking.com` serves that release, and indexing is allowed by robots.txt, HTML metadata and response headers.
2. On `master`, build that exact approved release. Confirm the built ownership file matches `public/indexnow.txt`.
3. Check GET and HEAD `/indexnow.txt` through Wrangler and the authorised production host: 200, plain text, no redirect/authentication, matching GET bytes. Confirm the ownership file is absent from sitemap and llms inventories.
4. Review `--dry-run`, including retired canonical URLs from the cutover packet. The first migration submission includes every eligible migrated page once, plus exact retired URLs. Do not include the separate books host or preview hosts.
5. Execute the explicit external-action command below only under that approval. Append retired canonical URLs individually when needed; the script verifies their 301/302/307/308/404/410 responses. A retained noindex route is verified against its local HTML bytes.

```bash
pnpm --dir /Users/sacino/musclehacking indexnow --submit-all --after-cutover
```

The command refuses branches other than `master`, verifies the live public ownership code, Bing crawler permissions, current page bytes and indexing response headers, then submits to the single shared IndexNow endpoint. It never deploys. For recovery, use the same command and approved removed URLs after confirming the intended release remains live. Do not schedule repeated whole-site submissions.

Record exact release commit, candidate count and response status separately from deployment success. HTTP 200 means accepted, not indexed; 202 means received with key validation pending. Network errors, 429 and 5xx receive at most three attempts with bounded Retry-After handling. Other HTTP failures fail immediately. Notification failure leaves the successful release intact. Keep Google Search Console sitemap submission and representative URL checks as separate cutover tasks.

Protocol reference: [IndexNow documentation](https://www.indexnow.org/documentation).
