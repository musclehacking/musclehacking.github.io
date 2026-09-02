# Human review packet

Status: approval required before hosted newsletter completion or production cutover.

## Decisions required

1. Confirm the public identity and structured-data type. Current visible source uses the name `Jay`; no structured data is emitted by the rebuild.
2. Confirm the contact address `jay@musclehacking.com` and the migrated About copy.
3. Decide whether `/about/`, `/contact/`, and `/privacy/` should be added, and supply approved facts and privacy wording.
4. Approve self-canonicals for all 18 indexable routes or list exact exceptions.
5. Approve the preserved `archive.org_bot` and `ia_archiver` crawler exclusions.
6. Confirm that no analytics should ship, or supply an approved current destination and privacy basis.
7. Provide access to the Cloudflare account containing the `musclehacking.com` zone.
8. Confirm the existing newsletter provider, audience, challenge policy, and a preview-only test destination. If reCAPTCHA cannot be recovered, approve or reject a separate Turnstile change.

## Implemented evidence

- All 20 legacy public routes are represented in typed data.
- The exact mixed slash policy and custom 404 pass through local Wrangler.
- Calculator Standard, LeanGains, keto, unit-conversion, and boundary fixtures pass.
- Supplement category membership and the authoritative 19-record source list pass. The planning text said 18, but the audited source includes Glucosamine as record 19.
- CSP, cache, metadata, discovery, internal-link, image-dimension, legacy-string, and JavaScript-budget checks pass.
- The newsletter fails closed without provider credentials and does not call an unknown destination.
- Clean install, type checks across 74 source files, 51 unit tests, 158 desktop/mobile browser tests, 6 axe scans, build verification, and JavaScript budgets pass.
- The separate review Worker is live at `https://musclehacking-astro-preview.webpop.workers.dev`. Its active version is `88b47e15-e6fb-408a-8379-1b7997f67645`, and all 13 hosted HTTP contract checks pass after updating the preview-only allowed origin to the new workers.dev namespace.
- Inactive legacy rollback version `e9e4425e-eb64-493f-a05e-dfbf99a5a388` contains audited commit `9bf25d0` and responds through `https://legacy-9bf25d0-musclehacking-astro-preview.webpop.workers.dev`. The Astro version remains at 100 percent on the isolated review Worker.
- Desktop social controls, calculator geometry, calculator and supplement heading self-links, stable supplement Show All controls, and the `/one-last-step/` three-item desktop navigation pass focused regressions and hosted browser checks with no console or page errors.
- Mobile Lighthouse 13.4.1 scores are: home `99/100/96/100`, article `100/100/96/100`, calculator `100/100/96/100`, and supplements `100/100/96/100` for Performance, Accessibility, Best Practices, and SEO. LCP is `1.26-1.94 s`; CLS is `0.0002-0.0438`.

## Visual review result

Forty-four desktop and mobile captures pass the automated 2 percent threshold. The two supplement Show All captures pass through the approved stable-viewport exception. Every other unapproved evaluated mismatch is at or below 2 percent. The harness records both raw and evaluated mismatch values, uses exact selector-region masks for the three approved visual policies, captures deterministic frames from the animated GIF on `/one-last-step/`, masks only provider-controlled YouTube raster content, and asserts the SHA-256 hash of the audited modernity hero asset before applying its exact raster mask. Representative unapproved evaluated mismatches include desktop home `1.90%`, desktop calculator Standard `1.86%`, desktop calculator LeanGains `1.72%`, mobile home `1.59%`, mobile supplements `0.56%`, and mobile modernity `1.04%`.

Baseline screenshots: `/Users/sacino/Documents/codex/web-development/musclehacking/legacy-baseline-9bf25d0/screenshots/`

Candidate screenshots: `/Users/sacino/Documents/codex/web-development/musclehacking/astro-candidate/screenshots/`

On 31 August 2026, the human approved three visual policies: keep the supplement Show All viewport stable, keep the accessible darker text colours, and keep fluid narrow-screen calculator and supplement layouts. The visual harness applies exact masks only to those behaviours and still evaluates all other pixels against the 2 percent threshold. This approval is separate from production cutover approval.

The hosted review Worker result and inactive legacy rollback artefact are recorded in the cutover runbook. Production DNS before-state, DNS diff, inverse rollback, production-target Worker versions, Workers Builds evidence, and a newsletter success submission remain unavailable until the production Cloudflare account and provider contract are supplied. The migration also still needs the human identity, legal, contact, analytics, canonical, and crawler-policy decisions listed above.

## UI-01 through UI-13 local completion

The local Astro candidate implements all thirteen reopened UI issues. The focused parity suite passes 22 desktop and mobile results that map each UI ID to exact geometry, content, hover, focus, clipboard, route, and responsive assertions. The complete local E2E suite passes 180 desktop and mobile tests.

The local proof includes focused browser captures for the home header and card hover, supplement evidence popover, calculator guide, calculator exit modal, and desktop/mobile article endings. The audit regressions also prove a fixed header after scroll, real heading-target scrolling, pointer-leave popover dismissal, zero mobile article overflow, and server-rendered previous/next navigation after both the newsletter and share controls with JavaScript disabled.

This is implementation proof, not hosted acceptance. The active isolated review Worker still contains the earlier candidate. A new version upload, hosted UI matrix, and human side-by-side decision remain required before the migration steps can return to completed or enter a cutover packet.

The old page-wide visual command reports 4 of 46 mobile captures above its two percent threshold. The desktop supplement capture now passes at 1.31 percent. Direct 390-pixel named-browser comparisons identify a clipped retained baseline and a rapid candidate capture with a missing H1 line. Keep these four harness cases open until the capture defect is repaired; no mask or threshold exception was added.
