# Cloudflare cutover and rollback runbook

Status: draft only. No cutover authority has been granted.

## Verified source state

- Audited legacy commit: `9bf25d0`
- Candidate branch: `codex/astro-cloudflare-migration`
- Repository: `musclehacking/musclehacking.github.io`, public, default branch `master`
- Candidate Worker source name: `musclehacking-astro`
- Isolated review Worker: `musclehacking-astro-preview`
- Isolated review URL: `https://musclehacking-astro-preview.webpop.workers.dev`
- Isolated review version: `88b47e15-e6fb-408a-8379-1b7997f67645`
- Isolated legacy rollback version: `e9e4425e-eb64-493f-a05e-dfbf99a5a388`
- Isolated legacy version preview: `https://legacy-9bf25d0-musclehacking-astro-preview.webpop.workers.dev`
- Production canonical: `https://www.musclehacking.com`

## Authority gate

Do not promote a version, bind a custom domain, change DNS, make the repository private, or retire GitHub Pages until this file contains the exact candidate commit, candidate and legacy Worker version IDs, preview evidence, authoritative DNS snapshot, proposed DNS diff, and inverse rollback, and the human explicitly approves this exact packet.

## Current public observation, not rollback data

On 31 August 2026, public DNS reported Cloudflare nameservers `jill.ns.cloudflare.com` and `ken.ns.cloudflare.com`, four GitHub Pages apex A values, and `www.musclehacking.com` as a CNAME to `musclehacking.github.io`. These observations are not authoritative rollback data.

The configured Cloudflare key could not list the `musclehacking.com` zone. Therefore record IDs, full record fields, custom-host binding method, certificate state, active production Worker version, and exact production rollback operations remain unavailable. No write to a production zone, route, domain, or Worker was attempted; all documented writes target only the isolated review Worker.

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

Evidence recorded on 31 August 2026 from branch `codex/astro-cloudflare-migration`:

- `pnpm check`: 74 source files, 0 errors, 0 warnings, and 0 hints.
- `pnpm test`: 51 unit tests passed.
- `pnpm build` and `pnpm verify:dist`: 21 HTML files and 20 public routes passed route, discovery, CSP, link, image, forbidden-string, and JavaScript-budget checks.
- `pnpm test:e2e`: 158 desktop and mobile browser tests passed against the local Wrangler Static Assets preview.
- `pnpm test:agent-a11y`: 6 representative pages had no serious accessibility violations.
- `pnpm test:visual`: 44 captures passed the 2 percent threshold and the two supplement Show All captures passed through the approved stable-viewport exception; every other unapproved evaluated mismatch is at or below the threshold.

## Isolated hosted review evidence

Wrangler deployed version `88b47e15-e6fb-408a-8379-1b7997f67645` at 100 percent to the separate Worker `musclehacking-astro-preview` in account `213ab3604485056376263d22fa242742`. This Worker is available at `https://musclehacking-astro-preview.webpop.workers.dev` and has no custom domain, production route, Git integration, or provider secret. This version refreshes only the preview allowed-origin binding after the account workers.dev subdomain changed to `webpop`.

The project-owned contract at `tests/fixtures/cloudflare-preview-http-contract.json` passed all 13 hosted checks. It verified exact home-page bytes, slash redirects, article route shape, custom `404`, immutable fingerprinted assets, production-only canonicals and discovery URLs, security headers, the newsletter `405` method contract, and a safe `503 newsletter_unavailable` result for a valid same-origin form POST. The hosted browser flow also moved from home to the Keto calculator and then Show All supplements, where all 19 records appeared with no console or page errors. No subscriber provider call was possible because no provider credentials are bound.

Wrangler uploaded the exact audited legacy tree from commit `9bf25d0` as inactive version `e9e4425e-eb64-493f-a05e-dfbf99a5a388`. Its version preview returned `200` for the homepage and a representative article. Cloudflare's deployment list shows current Astro version `88b47e15-e6fb-408a-8379-1b7997f67645` at 100 percent, so the rollback version does not interrupt the isolated review URL.

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
