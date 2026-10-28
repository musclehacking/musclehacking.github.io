# Cloudflare Builds configuration

## Intended project

- Repository: `musclehacking/musclehacking.github.io`
- Default branch: `master`
- Migration branch: `codex/astro-cloudflare-migration`
- Root: repository root
- Node: version pinned in `.nvmrc`
- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm build`
- Non-promoting upload: `pnpm exec wrangler versions upload`
- Worker name in source: `musclehacking-astro`

Migration-branch builds must upload versions without promotion. GitHub App access must be selected-repository access. Do not add a duplicate GitHub Actions deployment.

## Isolated review Worker

Wrangler deploys the candidate build directly to a review-only Worker in the personal Cloudflare account `213ab3604485056376263d22fa242742`:

- Worker: `musclehacking-astro-preview`
- URL: `https://musclehacking-astro-preview.webpop.workers.dev`
- Active version: `df904b43-5cbd-4978-9b57-3020d20f9784`, deployed at 100 percent on 28 October 2026. This is a secrets-only copy of `8cb22fb7-b3d9-4a80-957c-fb98699d7108` (tested application commit `13743d0be7de776895fc92edb51d6f0115846004`). The Worker code ETag and assets binding are identical; no local application changes were uploaded. `GETRESPONSE_API_KEY` and `GETRESPONSE_CAMPAIGN_ID` are now secret bindings, alongside the retained Turnstile secret and preview origin. The human approved the existing `qwsfu` list and one recipient. Ego Lite proves real Turnstile signup, the success redirect, email delivery, completed confirmation and safe duplicate handling. GetResponse readback shows exactly one confirmed contact, API origin and autoresponder day 0. See [newsletter acceptance](../evidence/newsletter_activation/acceptance.md).
- Configuration rollback version: `8cb22fb7-b3d9-4a80-957c-fb98699d7108`, deployed 22 October 2026, has the same application without GetResponse credentials. Redeploying it disables provider delivery on the review Worker without rebuilding.
- Previous active version: `f7dc2353-f422-4648-9709-5546b0ef25e8` (22 October 2026, initial timeout test repair commit `0723d86`). Earlier rollback: `3ff8509f-59b9-4d07-9e37-ea0b7aada8cf` (22 October 2026, component ownership commit `778bf99`), `796979bd-5ce6-4ac2-b67e-7f1e569e1139` (23 September 2026, commit `5b115b2` plus `TURNSTILE_SECRET_KEY`) and `7b471461-e0f3-4d8d-9bcc-5442c1480bf3` (5 September 2026, sitewide `og:locale`)
- Superseded versions retained for rollback: `3e129585-482f-40a7-a9fc-232fee971f75` (4 September 2026), `fc27fbf7-b28e-46ba-9342-2f731fc3e641` (4 September 2026) and `88b47e15-e6fb-408a-8379-1b7997f67645` (1 September 2026)
- Inactive legacy rollback version: `e9e4425e-eb64-493f-a05e-dfbf99a5a388`
- Legacy version preview: `https://legacy-9bf25d0-musclehacking-astro-preview.webpop.workers.dev`
- Release controller: direct Wrangler deployment, not Workers Builds or a Git integration
- Bindings: Static Assets, the public preview origin, `TURNSTILE_SECRET_KEY`, `GETRESPONSE_API_KEY`, and `GETRESPONSE_CAMPAIGN_ID`. Never print secret values.

This Worker has no custom domains or production routes. It does not change DNS, GitHub settings, GitHub Pages, or the live site. The preview origin is allowed for same-origin newsletter validation. Missing or forged Turnstile tokens are rejected with `400`. Valid submissions now target the existing GetResponse list; automated browsing must never be used to add other recipients without explicit approval.

The inactive legacy version contains the exact audited tree from commit `9bf25d0`. The rollback audit recorded `200` for its homepage and a representative article. The current review version above is active at 100 percent; this retained legacy version is a separate non-production rollback artefact.

Component ownership acceptance and hosted proof are recorded in [the acceptance record](../evidence/component_reuse/acceptance.md).

### Reproducing an isolated review upload

```bash
pnpm build
CLOUDFLARE_ACCOUNT_ID=213ab3604485056376263d22fa242742 pnpm exec wrangler versions upload \
  --name musclehacking-astro-preview \
  --var NEWSLETTER_ALLOWED_ORIGIN:https://musclehacking-astro-preview.webpop.workers.dev \
  --message "<what changed>"
```

`wrangler.jsonc` names the production Worker `musclehacking-astro`, so `--name` is required or the upload targets the wrong Worker. `--var` is also required: environment variables are versioned, so an upload without it drops `NEWSLETTER_ALLOWED_ORIGIN` and the newsletter contract case then answers `403 invalid_origin` instead of `503 newsletter_unavailable`.

After `pnpm build`, let Wrangler use `.wrangler/deploy/config.json` and its generated `dist/server/wrangler.json`. Do not force `--config wrangler.jsonc`: that bypasses Astro's built Worker entry and tries to bundle unresolved Astro virtual modules from source. Keep the explicit review `--name` and preview-origin `--var` when using the generated configuration.

Verify with `node scripts/hosted-contract.mjs <origin>`. Deploying a version to the review URL is a separate, explicitly approved step:

```bash
CLOUDFLARE_ACCOUNT_ID=213ab3604485056376263d22fa242742 pnpm exec wrangler versions deploy \
  <version-id>@100% --name musclehacking-astro-preview
```

## Production account access and deployment boundary

The old missing-zone report is superseded. Read access to account `da18a65e27f34f43051b853e509ef411` and zone `325308665734cda0d51e001f336becca` is verified on 23 September and 28 October 2026. Production still uses GitHub Pages. The 28 October readback finds no production Worker and no Worker route on the zone. Workers Builds and the GitHub App connection remain unconfigured. No production write is authorised by the review newsletter activation.

## Git connection preparation - 28 October 2026

The human's instruction to continue migration work authorises preparing a repository connection without deploying production traffic. The exact source is GitHub user `musclehacking` (ID `11622858`), repository `musclehacking.github.io` (ID `135702228`), default branch `master`, and migration branch `codex/astro-cloudflare-migration`. The target account is `da18a65e27f34f43051b853e509ef411`. The eventual Worker name must be `musclehacking-astro`, matching `wrangler.jsonc`; the older draft cutover name `musclehacking` must not be used.

Prepare the repository connection through `PUT /accounts/da18a65e27f34f43051b853e509ef411/builds/repos/connections` with provider `github`, provider account ID `11622858`, provider account name `musclehacking`, repository ID `135702228` and repository name `musclehacking.github.io`. This operation does not create a Worker, attach a hostname, upload application code, create a build trigger or change production traffic. Record the returned connection identifier or the exact authorisation failure before further work.

The targeted request on 28 October returns HTTP 404 with Cloudflare error `8000008`: "This project is disconnected from your Git account". No repository connection is created. Readback confirms that the production account still has no Worker and the zone has no Worker route. GitHub App authorisation is therefore the current build-setup blocker, rather than a missing global API key or unresolved list/provider contract. Raw result: `.artifacts/newsletter_activation/20261028-a61f/builds-repository-connection.json`.

After the human reports that GitHub shows the app connected, the targeted repository-connection request still returns HTTP 404 / `8000008`. The target account's dashboard endpoints return `pages/connections: []` and `pages/connections/origin: { installations: [] }`. The review account's origin-installation list is also empty. These results establish that Cloudflare has no associated GitHub installation in either checked account; they do not disprove the human's GitHub installation. The target account still has zero Workers, zone Worker routes and build tokens. Raw readbacks: `.artifacts/newsletter_activation/20261028-a61f/builds-repository-connection-after-auth.json` and `build-connection-resource-state-after-auth.json` in the same directory.

Complete the account association from [the target Cloudflare setup page](https://dash.cloudflare.com/da18a65e27f34f43051b853e509ef411/workers-and-pages/create) in the browser already signed in as `@musclehacking`: select Connect GitHub, approve selected-repository access to `musclehacking.github.io`, and return to Cloudflare. Stop before Deploy. An installation-specific settings URL from `@Culpable` is not a usable authorisation link for `@musclehacking`.

Ego Lite space 29 is handed to the user again. Page `p1` retains the target Cloudflare setup; page `p3` is GitHub Add an account, with `musclehacking` prefilled. The old installation-specific page `p2` is closed. The account switcher has no existing `@musclehacking` session, so continuing in Ego requires the human's sign-in. Resume the same space only after the user returns control. Do not deploy from the wizard or grant access to unrelated repositories.

Cloudflare's [Builds API reference](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/) requires a one-time GitHub App authorisation through the dashboard before API connection management. The current production account has no registered build token. Do not reuse another account's build token, put the global API key in a build, or configure a production-promoting trigger before cutover approval. Preparation builds must use `pnpm build` and a non-promoting `pnpm exec wrangler versions upload` command. A connected repository alone does not prove a successful build or private-repository access.
