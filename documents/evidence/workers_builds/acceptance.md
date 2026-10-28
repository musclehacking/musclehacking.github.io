# Workers Builds acceptance - 28 October 2026

## Scope and revisions

The migration needs GitHub-backed Cloudflare builds that create reviewable versions without changing live traffic. The human authorises the exact repository `musclehacking/musclehacking.github.io` and completes its GitHub App connection in another browser. Initial setup does not authorise a push; the subsequent explicit push approval is recorded at the end of this file. No production deployment, DNS change, custom-domain binding, repository privacy change or newsletter mutation occurs.

Cloudflare builds existing remote commit `b0ef37717a7dcde41d63003c3ccbee1a9664c25f` on `codex/astro-cloudflare-migration`. Its application content matches the already tested review build; newer local optimisation commit `f13295e` is not pushed or uploaded here. Legacy rollback source is exact Git tree `9bf25d0`.

Raw API, build logs and HTTP results: `.artifacts/workers_builds/20261028/`. Initial connection/token metadata: `.artifacts/newsletter_activation/20261028-a61f/`. Browser evidence: `/Users/sacino/.dev-browser/tmp/mh-workers-builds-20261028-r3g8/`. No secret values are retained in these records.

## Exact setup

| Resource | Recorded value |
| --- | --- |
| Account | `da18a65e27f34f43051b853e509ef411` |
| Zone | `325308665734cda0d51e001f336becca` |
| Repository connection | `1bbe7325-90cb-4dd4-96ec-78d2755f70cb` |
| GitHub owner / repo IDs | `11622858` / `135702228` |
| Worker / immutable tag | `musclehacking-astro` / `b3f90363c5d24147a9c12262ed9a8c07` |
| Trigger | `d76064f6-633c-4148-87da-edf2c0ebed92` |
| Build token | `ef063755-7f68-4243-9635-d46f00256a4a` |
| Legacy version | `dc51d5dc-94da-432a-bbbd-ed1b9b3ec0cc` |
| Passing build | `119eeb31-61a0-411f-b3a5-f1f8197317ed` |
| Candidate version | `178fb1b7-ce58-42f2-bfb6-cebd38dafd37` |
| Immutable candidate preview | `https://178fb1b7-musclehacking-astro.jake-sacino.workers.dev` |
| Moving branch alias | `https://migration-review-musclehacking-astro.jake-sacino.workers.dev` |
| Legacy alias | `https://legacy-9bf25d0-musclehacking-astro.jake-sacino.workers.dev` |

The Worker is created empty through `POST /accounts/{account_id}/workers/workers`, with ordinary workers.dev access disabled and version previews enabled. No active version is needed. The exact legacy static tree is uploaded before Astro, retaining `auto-trailing-slash` asset handling. Home and article responses match their archived bytes.

The dedicated user API token grants only account-scoped Workers Scripts Write. Its value passes in memory directly to Cloudflare's build-token service. The trigger accepts only the migration branch, root `/`, Node `22.23.4`, pnpm `11.24.0` and frozen-lockfile installation. No GitHub Actions deployment is added.

## Failed job, cause and correction

First job `4934fcbf-7846-46e1-bfce-af36fe850c23` runs:

```sh
pnpm check && pnpm test && pnpm build && pnpm verify:dist
```

Expected: a clean checkout builds and uploads a version. Actual: type checks pass, but 3 unit checks fail. Two `og-locale` checks require `dist/client` before the unit command. The authoring fixture builds successfully, then its cleanup calls the local `trash` command, which the Linux builder does not provide; its final assertion observes the leftover fixture. No upload runs. Raw evidence: `failed-build-status.json` and `failed-build-logs.json`.

The correction changes only the new cloud trigger to the supported checks below and starts a fresh job. It does not skip an assertion, change a test, install substitute cleanup tooling or upload the dirty failed job. The original full-test Linux limitation remains unresolved and explicit. Local full-test acceptance remains required; the optimisation record separately reports 183 passing local tests and the complete local browser/accessibility run for its revision.

```sh
pnpm check && pnpm build && pnpm verify:dist
```

Upload command:

```sh
pnpm exec wrangler versions upload --name musclehacking-astro --preview-alias migration-review --var NEWSLETTER_ALLOWED_ORIGIN:https://migration-review-musclehacking-astro.jake-sacino.workers.dev
```

Passing job `119eeb31` starts at `2026-10-28T04:45:39.222Z` and completes at `2026-10-28T04:47:12.032Z`. It reports 0 errors, 0 warnings, 6 existing hints; verifies 20 HTML files and 19 public routes; then uploads candidate version `178fb1b7`. Raw evidence: `clean-build-created.json`, `clean-build-status.json`, `clean-build-logs.json`, `trigger-configured.json`, `candidate-version.json`.

## Observable acceptance

| Check and expected outcome | Actual outcome / raw evidence |
| --- | --- |
| Saved repository, branch, commands and runtime pins survive a dashboard reload | Pass in Ego Lite, recorded in `dashboard-config-after-reload.json`. |
| 23 static responses retain the accepted review content and security headers | 22 byte-exact responses; calculator differs only in Astro's generated island UID. Every other calculator byte matches. `hosted-http-acceptance.json` and `calculator-html-diff.json`. |
| Fingerprinted stylesheets keep immutable caching; unknown and article-slash routes return the custom 404 | Pass. Two stylesheets and both 404 paths checked in `hosted-http-acceptance.json`. |
| Subscribe GET returns 405, Allow POST and no-store | Pass. No POST is attempted, and the candidate has no provider/challenge secrets. |
| Calculator JavaScript hydrates and reacts to a visible input change | Default 80 kg produces 1733 calories. Changing to 90 kg produces 1829 calories, 198 g protein, 58 g fat and 130 g carbs. Browser `calculator.json` and inspected `final/calculator.png`. |
| Supplement Show All reveals the entire list without mobile overflow | The contents list grows from 10 to 21 links: 19 supplements plus information/references. At 390 pixels, scroll width equals client width. Browser `supplements.json` and inspected `final/supplements-mobile.png`. |
| No deployment, production hostname, route or DNS drift | Zero active deployments, custom domains and zone routes. Regular workers.dev access remains disabled; previews remain enabled. All five affected DNS records match every saved field. `final-resource-state.json` and `affected-dns-after.json`. |
| Legacy rollback is available without a rebuild | Home and article return 200 and match `9bf25d0` bytes. `legacy-http.json` and `legacy-upload.log`. |

The first calculator automation attempt uses a persistent page after its 30-second newsletter dialog opens. The dialog intercepts the input. This is a fixture/environment mismatch, followed by a close-transition timing race, not an application change. The visible close control dismisses it; the subsequent isolated input action completes immediately. Its diagnostic screenshot is retained as `final/timeout-state.png`. No app or test source is patched.

The browser `mh-workers-builds-20261028-r3g8` is closed and absent from the browser list. Ego Lite space 29 is finished without retained pages. No local server starts in this run.

## Replay and remaining gates

Open [the recorded build](https://dash.cloudflare.com/da18a65e27f34f43051b853e509ef411/workers/services/view/musclehacking-astro/production/builds/119eeb31-61a0-411f-b3a5-f1f8197317ed) and inspect the cloned commit, frozen install, successful commands and uploaded version. To reproduce without a test commit, use `POST /accounts/da18a65e27f34f43051b853e509ef411/builds/triggers/d76064f6-633c-4148-87da-edf2c0ebed92/builds` with branch `codex/astro-cloudflare-migration` and commit hash `b0ef37717a7dcde41d63003c3ccbee1a9664c25f`. Keep credentials in the command environment and out of records.

Open the immutable candidate URL for stable replay. Verify the calculator's 80-to-90 kg change and supplements Show All at 390 pixels. Read deployment, Worker subdomain, custom-domain and zone-route state through the API; compare all five authoritative DNS records with the runbook before any approved write.

The initial newer-source/push-event gaps are resolved by the acceptance below. Remaining: human hosted review and the full hosted component/rollback acceptance, final production secret configuration, exact redirect/cutover approval, private-repository rebuild, and production traffic verification. No unsupported local/cloud equivalence is claimed. Excluded here: the full test suite on Linux, real newsletter submission on the new target Worker, new hosted performance measurements, live IndexNow submission and production cutover.

## Authorised push acceptance

The human explicitly chooses to push the committed migration branch while keeping the live site unchanged. The exact command is:

```sh
git -C /Users/sacino/musclehacking push origin fecebf8d414eb427d26168cc4f94b05cde38b674:refs/heads/codex/astro-cloudflare-migration
```

Before the push, the live trigger is read back: only the migration branch is included, and its command is the recorded non-promoting upload. Expected: GitHub publishes the approved commit and the push itself starts a successful Cloudflare build. Actual: remote advances from `b0ef377` to `fecebf8`; job `c2b1b975-b732-45d9-ba52-37502a8abf72` records source `push_event` and that exact SHA, runs from `2026-10-28T04:58:19.808Z` to `2026-10-28T04:59:22.938Z`, and succeeds. GitHub check `122640990636`, `Workers Builds: musclehacking-astro`, completes with conclusion `success`.

The job reports 0 errors, 0 warnings and 6 existing hints across 141 checked files, then verifies 20 HTML files / 19 routes and uploads inactive version `18ac682d-0224-4639-aad4-013fc344f67f`. [Build](https://dash.cloudflare.com/da18a65e27f34f43051b853e509ef411/workers/services/view/musclehacking-astro/production/builds/c2b1b975-b732-45d9-ba52-37502a8abf72); [immutable preview](https://18ac682d-musclehacking-astro.jake-sacino.workers.dev/). The moving `migration-review` alias also updates. Raw evidence: `pre-approved-push-state.json`, `push-triggered-builds.json`, `pushed-build-status.json`, `pushed-build-logs.json`, `pushed-commit-checks.json`, `pushed-candidate-version.json`.

The accepted optimisation output under `/tmp/musclehacking-astro-optimisations.uv5mzY/accepted-frozen/` first passes its full SHA-256 manifest. All 24 hosted static checks then match it: 23 byte-exact, with the calculator differing only in its generated Astro island UID. Redirects, custom 404s, immutable CSS, UTF-8 `llms.txt` and GET `/api/subscribe` rejection pass. No POST runs. Raw evidence: `pushed-hosted-output.json` and `pushed-hosted-http-contract.json`.

The real browser confirms default calculator results `1733 / 176 / 57 / 129` and, after changing 80 to 90 kg, `1829 / 198 / 58 / 130`. Supplements Show All exposes 19 supplements plus the two information/reference links, with no 390-pixel overflow. Both inspected screenshots and the result are retained in `/Users/sacino/.dev-browser/tmp/mh-workers-builds-20261028-r3g8/push/`; its browser is closed and absent from the browser list.

Final account readback still finds zero active deployments, custom domains and zone routes, disabled regular workers.dev access, enabled version previews and a complete exact match for every affected DNS field. Both unrelated lifecycle files retain their pre-push hashes. `pushed-final-resource-state.json` owns that result. Read-only widget metadata also confirms existing production/review hostname coverage and that the Keychain secret matches; no widget or credential write occurs (`production-widget-readback.json`).

The source code now has local and focused hosted proof. Human hosted review remains pending before the candidate enters the final cutover packet. The target Worker has no provider/challenge secrets; completed real newsletter acceptance remains on the separate review Worker. The full hosted component-state matrix, rollback rehearsal, fresh hosted performance, private-repository rebuild and production cutover are not claimed by these focused checks.
