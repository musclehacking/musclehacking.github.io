# Newsletter activation acceptance - 28 October 2026

## Outcome and scope

The review Worker now has the recovered GetResponse credentials and verified existing list `qwsfu` (`musclehacking`, API double opt-in). The human explicitly approves the existing list and one named recipient in this chat, overriding the usual separate-list rule for this run. No other contacts or list settings are changed. The complete recipient address, credentials and confirmation URLs are excluded from this committed record.

**Newsletter acceptance passes:** Ego Lite submits the visible `/join/` form with real Turnstile and reaches `/one-last-step/`. The user supplies a screenshot of the delivered GetResponse confirmation email. The task follows that email's confirmation link in Ego Lite and observes GetResponse's confirmed-subscription page. An exact-recipient API readback then returns one confirmed contact on `qwsfu`, origin `api`, autoresponder day `0`. A second real form submission for the same confirmed recipient returns the normal success destination and leaves exactly one contact.

The initial exact-recipient readbacks return zero confirmed contacts while confirmation is pending. The transition to one confirmed contact is observed only after following the email link. The original screenshot includes a bearer confirmation URL, so it is neither copied into Git nor reproduced in this record.

This is a runtime-configuration and documentation change. No application code, build output, production website, DNS, repository visibility, WPX file, or unrelated local change is deployed or edited by this task.

## Revision, target and rollback

- Source repository revision when this task starts: `042fa80`; tested deployed application: `13743d0be7de776895fc92edb51d6f0115846004`.
- Account: `213ab3604485056376263d22fa242742`; Worker: `musclehacking-astro-preview`; deployed origin: `https://musclehacking-astro-preview.webpop.workers.dev`.
- Previous version: `8cb22fb7-b3d9-4a80-957c-fb98699d7108`; activated version: `df904b43-5cbd-4978-9b57-3020d20f9784`; deployment: `6d32324b-845c-4e1a-a481-a0d907a89db4` at 100 percent, `2026-10-28T03:32:10.944613Z`.
- New secret names: `GETRESPONSE_API_KEY`, `GETRESPONSE_CAMPAIGN_ID`. Existing Turnstile secret, preview origin and assets binding remain present.
- Code ETag before/after: `bcd5e2f6a8dcaa03df0daee981c60bfa5b00257c2ec0b2c2337258c91773d2d9`; the assets binding is identical. Five representative document hashes also remain identical.
- To disable provider delivery on the review Worker, load the usual per-command Cloudflare credentials and deploy the exact previous version with `pnpm --dir /Users/sacino/musclehacking exec wrangler versions deploy 8cb22fb7-b3d9-4a80-957c-fb98699d7108@100% --name musclehacking-astro-preview`. This changes only review configuration and does not remove the approved contact from GetResponse.

## Setup, commands and results

Raw results: `/Users/sacino/musclehacking/.artifacts/newsletter_activation/20261028-a61f/`. Browser results: `/Users/sacino/.dev-browser/tmp/mh-newsletter-20261028-a61f/`. The ignored `secure_ops.py` supplies task-owned credential retrieval and exact-target API readback; it never prints credentials or stores them in retained raw output. The SFTP wrapper needs a seekable temporary file, which is privately permissioned, redacted and Trashed immediately after reading.

| Check / command | Expected result | Actual result | Raw record |
| --- | --- | --- | --- |
| `python3 .../secure_ops.py preflight` | Existing list identity and double opt-in; only approved recipient queried | Pass; list `qwsfu`, API opt-in `double`, zero confirmed matches | `provider-before.json` |
| Cloudflare API deployment/settings/version readback | Intended tested version, no review custom domain | Pass; source version is latest and 100% active; review custom-domain result empty | Readback during run, `version-readback.json` |
| `python3 .../secure_ops.py upload` | Secrets-only new version without rebuilding or promotion | Pass; Wrangler reads secret JSON through stdin and returns `df904b43` | `created-version.json`, `secret-upload.log` |
| `wrangler versions deploy df904b43-5cbd-4978-9b57-3020d20f9784@100% --name musclehacking-astro-preview --yes` | Activate only review version | Pass; exact deployed version rechecked | `deploy.log`, `active-deployment.json` |
| Code/asset identity and five hosted document hashes | Unchanged tested application and public output | Pass; `/`, `/join/`, `/one-last-step/`, calculator and supplements all return 200 and identical hashes | `version-readback.json`, `http-before.json`, `http-after.json` |
| Headless dev-browser form submission | Real Turnstile token and redirect | Environment mismatch: Turnstile `600010`, no token, no signup POST | Browser `challenge-diagnostic.json`, masked `intermediate/challenge-failure.png` |
| `ego-browser nodejs`, task space 28, page `p1` | Real visible form submission reaches confirmation page | Pass; reaches `/one-last-step/`. The response event stream does not retain an independently measured status; the route source defines its success redirect as 303 | `ego-signup.json`; browser `final/ego-signup-redirect.png`, inspected |
| Hosted GET / missing token / forged token / bot-trap / malformed email | 405 / 400 / 400 / 400 / 400, with safe errors | Pass; method advertises `Allow: POST`; API errors use `no-store` | `failure-contracts.json` |
| Disallowed Origin | Rejected before provider call | Pass; Cloudflare edge returns 403 before an application error body | `failure-contracts.json` |
| Confirmation email and Ego Lite confirmation navigation | Email reaches approved recipient; link confirms the same list | Pass; user-supplied delivery screenshot, followed by GetResponse's confirmed-subscription page | `confirmation-result.json`; browser `final/getresponse-confirmed.png`, inspected |
| `python3 .../secure_ops.py contact` | Exactly one confirmed member on the existing list, day 0 | Pass; one matching contact, origin `api`, `dayOfCycle: "0"` | `provider-confirmed.json` |
| Second real Ego Lite form submission and exact-recipient API readback | Safe success for an existing subscriber without a second contact | Pass; `/one-last-step/`, still exactly one matching contact, day 0 | `duplicate-result.json`, `provider-after-duplicate.json` |
| `pnpm --dir /Users/sacino/musclehacking exec vitest run tests/unit/newsletter.test.ts tests/unit/newsletter-request-body.test.ts` | Existing isolated provider, challenge and body-boundary cases pass | Pass; 39 tests in two files | `focused-unit-result.json` |
| Production read-only check | Production still on GitHub Pages | Pass; www CNAME still targets GitHub Pages, production Worker list and zone Worker routes remain empty | `production-readonly.json` |

The unchanged application's October full-suite evidence remains in `documents/evidence/component_reuse/acceptance.md`. This task does not rebuild or run a local suite against the unrelated concurrently edited worktree. Its new verification observes the exact deployed version, live challenge, form submission, failure paths and provider readback instead.

## Browser preference and failure classification

The first browser failure is a verification-environment mismatch: real Turnstile loads, the configured hostname is allowed, but the headless browser receives `600010`. The user explicitly selects Ego Lite; the unchanged form succeeds there. No test secret, token injection, relaxed hostname/action binding, retry loop, changed application or challenge bypass is used. The user preference is recorded once in `documents/testing/live-newsletter.md`; hermetic E2E testing retains its lifecycle owner.

A separate Ego tooling error is a stale snapshot ref after enabling CDP, which invalidates refs. No signup occurs on that failed command. A fresh snapshot plus the page's existing CSS locators resolves it.

The headless task browser is closed and absent from `dev-browser browsers`. Ego Lite space 28 is initially handed to the user for mailbox sign-in. The user instead supplies the delivered email screenshot and instructs the task to proceed. The task resumes that same space, follows the supplied confirmation link without retaining it, completes the duplicate check, then calls `finish({ keep: [] })` successfully. No local server is started.

## Completed acceptance and replay

Live delivery, confirmation, confirmed membership, day-0 state and duplicate handling are now verified for the one approved recipient. Do not repeat a live signup as a routine regression: obtain exact-recipient approval for a new live test, and use isolated provider/challenge fixtures for ordinary checks. The existing contact is retained as the user requested; it is not removed as test cleanup.

Keep the candidate's existing differences visible for final cutover review: duplicate code `1008` is treated as success to avoid revealing membership, and the visitor IP is passed to GetResponse. Neither the legacy reCAPTCHA form nor this candidate can succeed without JavaScript; the tested safe missing-token rejection preserves that behaviour.

## Excluded edge cases

- Delivery of a later autoresponder message: day-0 enrolment is verified, but no later marketing email or campaign schedule is exercised.
- Expired/replayed real tokens and live provider failures/timeouts: existing isolated coverage remains; no live provider setting or credential is damaged to induce failures.
- Production-host submission, DNS/TLS switch, production rollback and repository privacy: remain behind the exact cutover approval gate.
