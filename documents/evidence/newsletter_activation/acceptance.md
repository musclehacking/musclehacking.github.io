# Newsletter activation acceptance - 28 October 2026

## Outcome and scope

The review Worker now has the recovered GetResponse credentials and verified existing list `qwsfu` (`musclehacking`, API double opt-in). The human explicitly approves the existing list and one named recipient in this chat, overriding the usual separate-list rule for this run. No other contacts or list settings are changed. The complete recipient address, credentials and confirmation URLs are excluded from this committed record.

**Real signup passes:** the user-selected Ego Lite browser submits the visible `/join/` form with the real Turnstile widget and reaches `/one-last-step/`. Email delivery, completed confirmation, and autoresponder-day readback remain pending because the recipient's Microsoft 365 mailbox requires sign-in. The exact-recipient API query returns zero confirmed contacts before and after the submission; this does not expose or disprove a pending confirmation.

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
| `python3 .../secure_ops.py contact` | Confirmed membership after email link is followed | Pending; zero confirmed matches while mailbox sign-in is unavailable | `provider-after.json` |
| Production read-only check | Production still on GitHub Pages | Pass; www CNAME still targets GitHub Pages, production Worker list and zone Worker routes remain empty | `production-readonly.json` |

The unchanged application's October full-suite evidence remains in `documents/evidence/component_reuse/acceptance.md`. This task does not rebuild or run a local suite against the unrelated concurrently edited worktree. Its new verification observes the exact deployed version, live challenge, form submission, failure paths and provider readback instead.

## Browser preference and failure classification

The first browser failure is a verification-environment mismatch: real Turnstile loads, the configured hostname is allowed, but the headless browser receives `600010`. The user explicitly selects Ego Lite; the unchanged form succeeds there. No test secret, token injection, relaxed hostname/action binding, retry loop, changed application or challenge bypass is used. The user preference is recorded once in `documents/testing/live-newsletter.md`; hermetic E2E testing retains its lifecycle owner.

A separate Ego tooling error is a stale snapshot ref after enabling CDP, which invalidates refs. No signup occurs on that failed command. A fresh snapshot plus the page's existing CSS locators resolves it.

The headless task browser is closed and absent from `dev-browser browsers`. Ego Lite space 28 is handed to the user at page `p2` for Microsoft 365 sign-in. Do not close or operate that handed-off space until the user returns control. No local server is started.

## Remaining acceptance and replay

After the user signs in, resume the same Ego space, read only the relevant confirmation email, follow its subscription-confirmation link, then run the exact-recipient contact readback. Record confirmed membership and day-of-cycle without retaining the address or confirmation URL. Avoid another signup while the current request is awaiting confirmation.

Keep the candidate's existing differences visible for final cutover review: duplicate code `1008` is treated as success to avoid revealing membership, and the visitor IP is passed to GetResponse. Neither the legacy reCAPTCHA form nor this candidate can succeed without JavaScript; the tested safe missing-token rejection preserves that behaviour.

## Excluded edge cases

- Duplicate-after-confirmation and autoresponder delivery: await confirmed membership before exercising these with the same approved recipient.
- Expired/replayed real tokens and live provider failures/timeouts: existing isolated coverage remains; no live provider setting or credential is damaged to induce failures.
- Production-host submission, DNS/TLS switch, production rollback and repository privacy: remain behind the exact cutover approval gate.
