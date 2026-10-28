# Cloudflare cutover and rollback runbook

Status: draft only. No cutover authority has been granted.

## Current checkpoint - 28 October 2026

The active isolated review version is `df904b43-5cbd-4978-9b57-3020d20f9784`. It is a secrets-only copy of the tested `8cb22fb7-b3d9-4a80-957c-fb98699d7108` version (application commit `13743d0`), with identical Worker code ETag and assets binding. Under the human's exact-recipient approval, real Turnstile signup, success redirect, email delivery, completed confirmation, day-0 enrolment and duplicate handling now pass against the existing `qwsfu` list. [The newsletter acceptance record](../evidence/newsletter_activation/acceptance.md) owns that completed gate. Redeploying `8cb22fb7-b3d9-4a80-957c-fb98699d7108` restores the same review application without provider credentials.

Production access is available. On 28 October, the human completes GitHub authorisation and the non-promoting build setup creates Worker `musclehacking-astro`, tag `b3f90363c5d24147a9c12262ed9a8c07`, in the zone's account. It has no active deployment, custom domain or zone Worker route; its regular workers.dev endpoint is disabled. `www` still points to GitHub Pages. No DNS, custom domain, GitHub visibility or live traffic setting changes. The September before-state below must still be refreshed immediately before an approved write.

Workers Builds job `119eeb31-61a0-411f-b3a5-f1f8197317ed` passes on existing remote commit `b0ef37717a7dcde41d63003c3ccbee1a9664c25f` and uploads inactive candidate `178fb1b7-ce58-42f2-bfb6-cebd38dafd37`. The exact legacy tree `9bf25d0` is uploaded first as inactive rollback version `dc51d5dc-94da-432a-bbbd-ed1b9b3ec0cc`. [Build acceptance](../evidence/workers_builds/acceptance.md) records the preview URLs, source/output proof, UI checks and exact unchanged DNS readback. Newer local optimisation commits remain unpushed, so this pair is preparation evidence rather than the final approved cutover target. The final redirect operations, production secrets and executable approved packet remain incomplete. Older missing-access, missing-Git-connection and missing-target-Worker reports are superseded.

The complete five affected DNS records are re-read on 28 October after newsletter confirmation and compared with the full JSON snapshot below. Every returned field and record ID matches exactly; no before-state field is reconstructed from public DNS. The current production custom-domain list is also empty. This refresh supports preparation only; re-query again immediately before an approved write and stop on drift.

## Verified source state

- Audited legacy commit: `9bf25d0`
- Candidate branch: `codex/astro-cloudflare-migration`
- Repository: `musclehacking/musclehacking.github.io`, public, default branch `master`
- Candidate Worker source name: `musclehacking-astro`
- Isolated review Worker: `musclehacking-astro-preview`
- Isolated review URL: `https://musclehacking-astro-preview.webpop.workers.dev`
- Isolated review version: `df904b43-5cbd-4978-9b57-3020d20f9784` (28 October secrets-only activation); configuration rollback: `8cb22fb7-b3d9-4a80-957c-fb98699d7108` (22 October tested build without GetResponse credentials). Older versions remain retained.
- Isolated legacy rollback version: `e9e4425e-eb64-493f-a05e-dfbf99a5a388`
- Isolated legacy version preview: `https://legacy-9bf25d0-musclehacking-astro-preview.webpop.workers.dev`
- Production canonical: `https://www.musclehacking.com`

## Authority gate

Do not promote a version, bind a custom domain, change DNS, make the repository private, or retire GitHub Pages until this file contains the exact candidate commit, candidate and legacy Worker version IDs, preview evidence, authoritative DNS snapshot, proposed DNS diff, and inverse rollback, and the human explicitly approves this exact packet.

## Authoritative before-state - 23 September 2026

Queried read-only through the Cloudflare API as `jake.sacino@gmail.com` after the account invitation. Re-query immediately before any approved write and stop on any drift.

| Field | Value |
| --- | --- |
| Account | `da18a65e27f34f43051b853e509ef411` ("Jake.sacino@live.com.au's Account") |
| Zone | `musclehacking.com`, ID `325308665734cda0d51e001f336becca`, Free plan, active |
| SSL/TLS mode | `full`, edge certificate `active` |
| Always Use HTTPS | `off` |
| Minimum TLS | `1.0` |
| Workers in account | none |
| Worker routes on zone | none |
| Zone rulesets | Cloudflare managed only (normalization, managed free WAF, DDoS L7); no custom redirect rules |

### Affected records: every field returned by the API

The apex A records and the `www` CNAME are DNS-only (`proxied: false`), so GitHub Pages serves both hosts today and performs the apex-to-`www` redirect itself.

```json
[
  {
    "id": "d6309731b81a59ac2560e64607df518a",
    "name": "musclehacking.com",
    "type": "A",
    "content": "185.199.108.153",
    "proxiable": true,
    "proxied": false,
    "ttl": 1,
    "settings": {},
    "meta": {},
    "comment": null,
    "tags": [],
    "created_on": "2018-06-03T01:19:58.827889Z",
    "modified_on": "2018-06-03T01:19:58.827889Z"
  },
  {
    "id": "713320b13a1094779e1e72018cdba75c",
    "name": "musclehacking.com",
    "type": "A",
    "content": "185.199.109.153",
    "proxiable": true,
    "proxied": false,
    "ttl": 1,
    "settings": {},
    "meta": {},
    "comment": null,
    "tags": [],
    "created_on": "2018-06-03T01:19:58.412602Z",
    "modified_on": "2018-06-03T01:19:58.412602Z"
  },
  {
    "id": "e856dbc9dc8208a7ad8894bf71d24849",
    "name": "musclehacking.com",
    "type": "A",
    "content": "185.199.110.153",
    "proxiable": true,
    "proxied": false,
    "ttl": 1,
    "settings": {},
    "meta": {},
    "comment": null,
    "tags": [],
    "created_on": "2018-06-03T01:19:57.657062Z",
    "modified_on": "2018-06-03T01:19:57.657062Z"
  },
  {
    "id": "c954edffd55370d603860f70bface537",
    "name": "musclehacking.com",
    "type": "A",
    "content": "185.199.111.153",
    "proxiable": true,
    "proxied": false,
    "ttl": 1,
    "settings": {},
    "meta": {},
    "comment": null,
    "tags": [],
    "created_on": "2018-06-03T01:19:56.679661Z",
    "modified_on": "2018-06-03T01:19:56.679661Z"
  },
  {
    "id": "49a112e934ad8c7deed7924c764c0c3e",
    "name": "www.musclehacking.com",
    "type": "CNAME",
    "content": "musclehacking.github.io",
    "proxiable": true,
    "proxied": false,
    "ttl": 1,
    "settings": {
      "flatten_cname": false
    },
    "meta": {},
    "comment": null,
    "tags": [],
    "created_on": "2018-06-03T11:51:46.213616Z",
    "modified_on": "2018-06-03T11:51:46.213616Z"
  }
]
```

### Page rules: every field returned by the API

Rule `4e0a9ac3…` is active but has no effect today, because page rules apply only to proxied traffic and the apex is DNS-only. The other two rules are disabled.

```json
[
  {
    "id": "4e0a9ac33acaf78c4176a85401f358e3",
    "targets": [
      {
        "target": "url",
        "constraint": {
          "operator": "matches",
          "value": "https://musclehacking.com/*"
        }
      }
    ],
    "actions": [
      {
        "id": "forwarding_url",
        "value": {
          "url": "https://www.musclehacking.com/$1",
          "status_code": 301
        }
      }
    ],
    "priority": 3,
    "status": "active",
    "created_on": "2018-06-02T11:57:16.000000Z",
    "modified_on": "2020-05-23T03:40:03.000000Z"
  },
  {
    "id": "2c99aede9ae5b0139d9b52cc83bd7806",
    "targets": [
      {
        "target": "url",
        "constraint": {
          "operator": "matches",
          "value": "http://www.musclehacking.com/"
        }
      }
    ],
    "actions": [
      {
        "id": "always_use_https"
      }
    ],
    "priority": 2,
    "status": "disabled",
    "created_on": "2018-06-02T11:56:10.000000Z",
    "modified_on": "2018-06-03T01:11:28.000000Z"
  },
  {
    "id": "39760c85c4bacd4b68432456bd2bdd4b",
    "targets": [
      {
        "target": "url",
        "constraint": {
          "operator": "matches",
          "value": "https://www.musclehacking.com/"
        }
      }
    ],
    "actions": [
      {
        "id": "cache_level",
        "value": "cache_everything"
      }
    ],
    "priority": 1,
    "status": "disabled",
    "created_on": "2018-06-02T11:59:06.000000Z",
    "modified_on": "2020-05-23T03:24:46.000000Z"
  }
]
```

### Preserved records (must not change)

| ID | Type | Name | Content | TTL | Proxied | Comment |
| --- | --- | --- | --- | --- | --- | --- |
| `78eb67675e67cf0c91bcb6c6b4a880c0` | A | `books.musclehacking.com` | `147.182.236.38` | 1 | false | Digital Ocean. Set up on 04/07/24. |
| `4aeb215b57100f8d17ab15f1390937f4` | A | `dev.musclehacking.com` | `198.60.193.15` | 1 | true | This is at WPX. Only Used For reCAPTCHA Verification. |
| `1b9c8b32b3a8a30812fe5cb9408e85c3` | MX | `musclehacking.com` | `aspmx.l.google.com` | 300 | false |  |
| `bdbf4bac5e1b7ae3896e98f4437a49e0` | MX | `musclehacking.com` | `alt1.aspmx.l.google.com` | 300 | false |  |
| `d7dd5cd88a382418432b5ea63ea759c9` | MX | `musclehacking.com` | `alt2.aspmx.l.google.com` | 300 | false |  |
| `465fec3a51971c01b42c354988b9ef0b` | MX | `musclehacking.com` | `alt3.aspmx.l.google.com` | 300 | false |  |
| `8d10a65654ad145315c5c96e6c25a3bf` | MX | `musclehacking.com` | `alt4.aspmx.l.google.com` | 300 | false |  |
| `9746eead21ea559668ad83e3582e8fe0` | TXT | `744ad01d._domainkey.musclehacking.com` | `k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD…` | 1 | false | DKIM record from GetResponse |
| `7c5b365d64323706cd3fda749e2a74c9` | TXT | `_dmarc.musclehacking.com` | `v=DMARC1; p=none; rua=mailto:jay@musclehacking.c…` | 1 | false |  |
| `1a613f3b956b7a98d451aabfdc2dfd3b` | TXT | `google._domainkey.musclehacking.com` | `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ…` | 1 | false |  |
| `5df271e162d54d54ce5379fa040e8e1a` | TXT | `musclehacking.com` | `google-site-verification=clWlPOYYY5A3WhOzZeihn5s…` | 300 | false |  |
| `1104c5bcadb35d11f29b2392f2b9b2b0` | TXT | `musclehacking.com` | `google-site-verification=7fLnG9OrB87YCZsZ29PMalx…` | 1 | false |  |
| `687a0f30687f070eb81bfa2d3748a5a1` | TXT | `musclehacking.com` | `v=spf1 include:_spf.google.com ~all` | 3600 | false |  |

`dev.musclehacking.com` (WPX) is commented "Only Used For reCAPTCHA Verification". Turnstile replaces it, so it can be retired after cutover, but only with a separate approval. `books.musclehacking.com` is the separate Writebook droplet and is out of scope.

### Draft cutover operations (not approved, not executed)

This draft is for review. It needs an approved candidate version and a completed newsletter test before it can become the approval packet.

1. Create Worker `musclehacking-astro` in account `da18a65e27f34f43051b853e509ef411` from the approved commit, with `workers_dev` off. This matches the source Wrangler name. Record its version ID.
2. Delete CNAME `49a112e934ad8c7deed7924c764c0c3e` (`www` → `musclehacking.github.io`), then attach the Workers Custom Domain `www.musclehacking.com` to Worker `musclehacking-astro`. Cloudflare creates the proxied record and certificate.
3. Change the four apex A records (`d6309731…`, `713320b1…`, `e856dbc9…`, `c954edff…`) to `proxied: true`. Page rule `4e0a9ac3…` then returns `301` from `https://musclehacking.com/*` to `https://www.musclehacking.com/$1` at the edge. Plain `http://musclehacking.com/*` still reaches GitHub Pages, which redirects to `https://www.musclehacking.com` (a second hop). Decide before approval whether to add a matching `http://` rule instead.

Inverse, in reverse order:

1. Set the four apex A records back to `proxied: false`.
2. Detach the `www.musclehacking.com` custom domain, then recreate `CNAME www.musclehacking.com → musclehacking.github.io`, `proxied: false`, `ttl: 1`.
3. Leave the Worker in place; it serves no hostname once detached.

## Current public observation, not rollback data

On 31 August 2026, public DNS reported Cloudflare nameservers `jill.ns.cloudflare.com` and `ken.ns.cloudflare.com`, four GitHub Pages apex A values, and `www.musclehacking.com` as a CNAME to `musclehacking.github.io`. These observations are not authoritative rollback data.

Superseded on 23 September 2026 by the authoritative before-state above. Before that date, the configured Cloudflare key could not list the `musclehacking.com` zone, so record IDs, full record fields, custom-host binding method, certificate state, active production Worker version, and exact production rollback operations remain unavailable. No write to a production zone, route, domain, or Worker was attempted; all documented writes target only the isolated review Worker.

The candidate uses Static Assets first and invokes the Worker only for `/api/subscribe`. This intentionally removes apex redirect handling from `src/worker.ts`. The local Wrangler preview therefore cannot prove the required apex-to-`www` redirect. Cutover remains blocked until the authoritative zone is available and this packet records the exact external Cloudflare redirect rule, affected resource identifiers, execution order, and inverse rollback for explicit approval.

## Required completion sequence

1. Obtain read and write access to the exact account containing `musclehacking.com`.
2. Record the full authoritative apex and `www` records, including IDs and every returned field. Record unrelated records as preserved.
3. Record the exact account, zone, Worker, legacy version, candidate version, and version preview URL.
4. Attach local and hosted route, visual, accessibility, security, discovery, performance, and newsletter evidence.
5. Write exact ordered DNS or custom-domain operations and exact inverse operations.
6. Request approval of this completed file.
7. After approval only, re-query all targets and stop on any drift before applying the approved operations.

The PHP endpoint, `dev` record, GitHub Pages source, public repository, and legacy Worker version must remain available until separate retirement approval.

## Local candidate evidence

Evidence recorded on 4 September 2026 from branch `codex/astro-cloudflare-migration`, Node 22.23.2 and pnpm 11.24.0, after the AUD-01 and AUD-02 `/join/` fixes. It supersedes the 31 August figures.

- `pnpm check`: 115 files, 0 errors, 0 warnings, and 5 deprecation hints.
- `pnpm test`: 97 unit tests passed in 16 files.
- `pnpm build` and `pnpm verify:dist`: 21 HTML files and 20 public routes passed route, discovery, CSP, link, image, forbidden-string, and JavaScript-budget checks.
- `scripts/run-e2e-local.sh --workers=3`: 286 desktop and mobile browser cases against the local Wrangler Static Assets preview; 264 passed, 22 were intentional single-project skips, 0 failed.
- `pnpm test:agent-a11y`: 6 representative pages had no serious accessibility violations, with **no** `color-contrast` exception left in `tests/a11y/site.spec.ts` after the A11Y-01 and A11Y-02 decisions in `documents/migration/human-review-packet.md`.
- Full 20-route document heights at 1440px and 390px: 38 of 40 within tolerance, with `/supplements/` at -4px and -46px as the two recorded exceptions. Zero horizontal overflow on every route at 1440px, 414px, 390px, 375px, and 320px.
- `pnpm test:visual`: all 46 captures pass or use an existing approval, after the human-approved VIS-01 regeneration of the 23 mobile baselines from the audited legacy tree at commit `9bf25d0`. The highest unapproved evaluated mismatch is 1.20 percent.

## Isolated hosted review evidence

On 4 September 2026, Wrangler uploaded and deployed version `fc27fbf7-b28e-46ba-9342-2f731fc3e641` at 100 percent to the separate Worker `musclehacking-astro-preview` in account `213ab3604485056376263d22fa242742`. This Worker is available at `https://musclehacking-astro-preview.webpop.workers.dev` and has no custom domain, production route, Git integration, or provider secret. Its only bindings are Static Assets and `NEWSLETTER_ALLOWED_ORIGIN`, set to the preview origin. This version carries every fix through AUD-07 and supersedes the 1 September version `88b47e15-e6fb-408a-8379-1b7997f67645`, which stays available for rollback with `wrangler versions deploy 88b47e15-e6fb-408a-8379-1b7997f67645@100% --name musclehacking-astro-preview`.

The project-owned contract at `tests/fixtures/cloudflare-preview-http-contract.json` passes all 13 hosted checks against `fc27fbf7`. Run it with `node scripts/hosted-contract.mjs [origin]`; the fingerprinted-asset case now resolves its path out of `dist/client/index.html` through `pathFromBuild`, so a new content hash no longer invalidates the fixture. The checks verify exact home-page bytes, slash redirects, article route shape, custom `404`, immutable fingerprinted assets, production-only canonicals and discovery URLs, security headers, the newsletter `405` method contract, and a safe `503 newsletter_unavailable` result for a valid same-origin form POST.

Note for future hosted runs: a Cloudflare *version preview* URL (`https://<prefix>-musclehacking-astro-preview.webpop.workers.dev`) blocks cross-site form POSTs at the edge with its own plain-text `403 Cross-site POST form submissions are forbidden`, before the Worker executes. The newsletter contract case therefore only passes against the deployed review URL, and version preview URLs also send `x-robots-tag: noindex`, which lowers a Lighthouse SEO score to 69 on those hosts.

The full E2E suite also ran against the deployed hosted origin: 252 passed, 22 intentional single-project skips, and 10 failures that are local-preview contracts by construction (four newsletter specs that hardcode `origin: http://127.0.0.1:8787`, one that opens a raw socket to `127.0.0.1:8787`, and `tests/e2e/routes.spec.ts:176`, whose name states it asserts local-preview behaviour). Every UI-01 to UI-13 case and every Section 5.8 to 5.11 and AUD regression passes hosted.

Wrangler uploaded the exact audited legacy tree from commit `9bf25d0` as inactive version `e9e4425e-eb64-493f-a05e-dfbf99a5a388`. On 4 September 2026 its version preview still returned `200` for the homepage and, following the redirect, for a representative article. Cloudflare's deployment list shows current Astro version `fc27fbf7-b28e-46ba-9342-2f731fc3e641` at 100 percent, so the rollback version does not interrupt the isolated review URL.

This evidence proves the isolated `workers.dev` deployment and a separately addressable inactive legacy rollback artefact. It does not prove production DNS, custom-domain TLS, apex redirect behaviour, a newsletter success submission, Workers Builds integration, a production rollback version, or an actual traffic-switch rehearsal.

### Approved visual policy choices

On 31 August 2026, the user explicitly approved these three candidate behaviours:

- Keep the supplement viewport stable after selecting Show All. Do not recreate the legacy blank-space scroll jump.
- Keep the darker newsletter-button and supplement-evidence text colours that pass the representative contrast checks. Do not restore the failing legacy colours.
- Keep the fluid calculator and supplement layouts on narrow screens. Do not restore fixed widths that clip or intercept controls.

These approvals cover only the named behaviours. They do not authorise production cutover. The completed visual harness applies exact selector-region masks only to these approved regions and evaluates every other unapproved pixel against the 2 percent threshold. It records raw and evaluated mismatch values, captures deterministic animated GIF frames, masks only provider-controlled YouTube raster content, and asserts the audited modernity hero asset hash before applying its exact raster mask. Forty-four captures pass the threshold, and the two Show All captures pass through the approved stable-viewport exception.

## Exact packet fields still unavailable

The following values must be inserted from authoritative Cloudflare and Git sources before this file can become an approval request:

- Candidate Git commit SHA after the migration changes are committed.
- Exact Cloudflare account ID and `musclehacking.com` zone ID.
- Candidate production and legacy production-target Worker version IDs. The isolated Astro and legacy versions are recorded above, but they are not yet the production cutover targets.
- Complete authoritative before-state for every affected apex and `www` DNS or custom-domain resource, including resource IDs and every returned field.
- Exact ordered proposed operations and exact inverse rollback operations.
- Hosted route, header, TLS, cache, performance, and newsletter success evidence.
- Human decisions for identity, contact, legal pages, analytics, canonicals, crawler policy, and newsletter provider policy.

Until every field is present, this document is evidence and a preparation checklist. It is not an executable cutover packet.

## Approved REQ-13 exception (PERF-01)

REQ-13 is a SHOULD, and Step 9's success criteria allow a human-approved exception with measured cause and impact. On 4 September 2026 the human approved PERF-01: the `LCP <= 2.5 s` clause is waived for `/` and `/blog/breakup-energy`.

Measured on hosted version `fc27fbf7` with Lighthouse 13.4.1 mobile:

| Route | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 90 | 100 | 96 | 100 | 3.7 s | 0.052 |
| `/blog/breakup-energy` | 90 | 100 | 96 | 100 | 3.6 s | 0 |
| `/calorie-calculator/` | 100 | 99 | 96 | 100 | 1.1 s | 0.039 |
| `/supplements/` | 100 | 100 | 96 | 100 | 1.2 s | 0.001 |

REQ-13's median thresholds are met: Performance median 95, Accessibility 100, Best Practices 96, SEO 100, and every CLS at or below 0.1.

Cause: the retained `/img/` source assets. `/img/breakup-energy.png` is 506 KB at 1536x922 and renders at 372px; the home cards are 506-720 KB each against a 3,440 KB home page. Best Practices 96 is the pre-existing `image-size-responsive` audit on the header wordmark.

Impact and alternatives considered: `fetchpriority="low"` on the home cards after the first was measured on hosted version `6b3f62ea` and moved LCP by 0.0 s, so it was reverted. 744px AVIF/WebP variants would very likely clear 2.5 s (`breakup-energy.png` 506 KB to 46 KB AVIF, `lose-fat-gain-mucle-beginner.png` 720 KB to 44 KB) but would convert heroes and cards to `<picture>` elements whose changed raster would require new visual masks, weakening the pixel-parity evidence for those images. On the same tool the legacy tree scores article Performance 76 with LCP 6.7 s and home 93 with LCP 3.0 s, so the candidate already beats legacy on articles.

JSON evidence: `/Users/sacino/Documents/codex/web-development/musclehacking/reports/musclehacking/20260904-migration-audit/lighthouse-hosted-fc27fbf7/`.
