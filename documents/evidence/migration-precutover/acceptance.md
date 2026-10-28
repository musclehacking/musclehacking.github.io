# Migration preparation acceptance - 28 October 2026

## Scope and source

The user authorises repairing cross-project Git author isolation, then continuing the migration. Earlier authority permits migration-branch pushes and non-production Cloudflare preparation. Production promotion, custom domains, DNS, repository privacy and legacy retirement still require the exact human-approved cutover packet.

Push-event build `fcb9f973-e673-40a9-aaa8-d7f36071a4ee` builds commit `3e4c65b419cade380f29b4cf7afd110b36964bfa`, including stylesheet correction `afced65`. Its pinned install, type check, build and distribution verification pass; GitHub's Workers Builds check succeeds. It uploads inactive version `6ced527c-7cc7-4cbe-9879-fdb954a6c9a2` in account `da18a65e27f34f43051b853e509ef411`, Worker `musclehacking-astro`. No upload command promotes a version.

The subsequent `ffa2a76` commit records the other chat's hosted performance measurements and changes no application files. The source-specific local acceptance remains in `../performance-regressions/acceptance.md`: 183 unit tests, type/build/output and 31 accessibility checks pass; the full browser run passes 371 cases with two delivery assertions intentionally corrected, and both corrected assertions pass their focused run. All 60 document/viewport pixel comparisons retain identical pixels. This preparation does not claim a new full local-suite run.

## Hosted acceptance

All 139 files in the corrected frozen manifest are hash-verified before comparison. All 24 hosted document/discovery responses match that output: the calculator permits only its generated Astro island UID to differ. Redirects, unknown-route and slash-article 404s, API GET 405/no-store/Allow, immutable CSS, UTF-8 discovery and security headers pass.

The existing component-state and optimisation suites pass all 80 desktop/mobile tests, with zero failures, retries or skips:

```bash
PATH=/Users/sacino/.nvm/versions/node/v22.23.4/bin:$PATH MUSCLEHACKING_PREVIEW_PORT=8811 MUSCLEHACKING_BASE_URL=https://6ced527c-musclehacking-astro.jake-sacino.workers.dev MUSCLEHACKING_FROZEN_CLIENT=/tmp/musclehacking-performance-investigation.tgi8MA/fixed /Users/sacino/musclehacking/scripts/run-e2e-local.sh --config /Users/sacino/musclehacking/.artifacts/migration-continuation/20261028/hosted-ui.config.mts --workers=2
```

The wrapper owns one frozen preview and returns zero. It prints one already-exited-child `kill` warning during cleanup; independent readback confirms its port 8811 and lease are absent. No server or test setup is changed to suppress that warning.

Direct Dev Browser inspection confirms the desktop home, calculator and mobile supplements. Changing calculator weight from 80 to 90 produces BMR 1905, TDEE 2286, calories 1829, protein 198, fat 58 and carbs 130. Mobile Show All has no horizontal overflow. The parent inspects all three screenshots. Browser `mh-workers-builds-20261028-r3g8` is closed and absent; retained captures are under `/Users/sacino/.dev-browser/tmp/mh-workers-builds-20261028-r3g8/final/continuation-*.png`.

## Actual review-only rollback rehearsal

The isolated review account `213ab3604485056376263d22fa242742` initially serves `df904b43-5cbd-4978-9b57-3020d20f9784` at 100% on `musclehacking-astro-preview`. After verifying that exact state, Wrangler deploys existing legacy version `e9e4425e-eb64-493f-a05e-dfbf99a5a388` at 100%. The deployed home and article bytes match `git show 9bf25d0:<path>` exactly.

A `finally` recovery path restores the original Astro version at 100%. The deployed home, calculator and supplements then match that original immutable version byte for byte. The target production Worker still has no deployment. This proves a real review-only traffic switch and recovery without rebuilding; it does not simulate production DNS or certificate changes.

## Inactive newsletter preparation

Read-only checks verify the recovered GetResponse key against existing campaign `qwsfu` and verify the Keychain Turnstile secret against the existing invisible widget. No provider settings or widget hosts change.

After checking that latest target version is exactly `6ced527c`, `wrangler versions secret bulk` receives the three approved values through stdin. It creates inactive version `159edb5c-51bd-44a8-aafb-866a5a623f3e`. Its Worker code ETag, runtime, routing, asset configuration and previous bindings match the tested source; only the three secret binding names are added. Values never enter source, arguments, logs or this record. No production submission is performed.

## Infrastructure before-state and limits

Authoritative readback confirms all five affected DNS records and all three Page Rules match the committed full before-state. The zone has 18 DNS records, one certificate pack, SSL mode `full`, Always Use HTTPS `off` and minimum TLS `1.0`. The production Worker has zero active deployments, custom domains and zone routes. No infrastructure setting changes during the readback.

The prepared release and ordered operations are a draft until human hosted appearance acceptance and separate exact cutover approval. Fresh hosted performance evidence is recorded by the optimisation chat: correction scores are home mobile 74/desktop 100 and calculator mobile 96/desktop 99. The single hosted samples do not establish a speed gain; CPU conditions differ. Preview-only noindex reduces SEO. The previously approved large-image LCP exception is retained, and the new scores/measurement limitations must be visible in the final proposal.

Raw evidence is Git-ignored under `.artifacts/migration-continuation/20261028/`: `builds.json`, `push-checks.json`, `candidate-version.json`, `hosted-verification.json`, `hosted-ui.json`, `runtime-owner.json`, `rollback-rehearsal.json`, redacted Wrangler logs, `credentialed-candidate-version.json`, `inactive-secrets-verification.json`, `authoritative-before-state.json` and the unexecuted proposed operations. Inspect these before reusing the claims.

Excluded edge cases: production custom-domain TLS, apex/HTTP redirect behaviour after binding, production newsletter mutations, private-repository rebuild access, real-device performance and later autoresponder-message delivery. These are not claimed as verified.
