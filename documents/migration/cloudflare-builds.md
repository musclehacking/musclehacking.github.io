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
- Active version: `8cb22fb7-b3d9-4a80-957c-fb98699d7108`, deployed at 100 percent on 22 October 2026. Its tag `13743d0be7de` and message identify hosted verification repair commit `13743d0be7de776895fc92edb51d6f0115846004`. Application inputs and all 140 public build files are identical to the component ownership release. The existing `TURNSTILE_SECRET_KEY` is retained; GetResponse secrets remain unset.
- Previous active version: `f7dc2353-f422-4648-9709-5546b0ef25e8` (22 October 2026, initial timeout test repair commit `0723d86`). Earlier rollback: `3ff8509f-59b9-4d07-9e37-ea0b7aada8cf` (22 October 2026, component ownership commit `778bf99`), `796979bd-5ce6-4ac2-b67e-7f1e569e1139` (23 September 2026, commit `5b115b2` plus `TURNSTILE_SECRET_KEY`) and `7b471461-e0f3-4d8d-9bcc-5442c1480bf3` (5 September 2026, sitewide `og:locale`)
- Superseded versions retained for rollback: `3e129585-482f-40a7-a9fc-232fee971f75` (4 September 2026), `fc27fbf7-b28e-46ba-9342-2f731fc3e641` (4 September 2026) and `88b47e15-e6fb-408a-8379-1b7997f67645` (1 September 2026)
- Inactive legacy rollback version: `e9e4425e-eb64-493f-a05e-dfbf99a5a388`
- Legacy version preview: `https://legacy-9bf25d0-musclehacking-astro-preview.webpop.workers.dev`
- Release controller: direct Wrangler deployment, not Workers Builds or a Git integration
- Bindings: Static Assets, the public preview origin and the existing Turnstile secret; no GetResponse credentials

This Worker has no custom domains or production routes. It does not change DNS, GitHub settings, GitHub Pages, or the live site. The preview origin is allowed for same-origin newsletter validation. Missing or forged Turnstile tokens are rejected with `400`; GetResponse credentials remain absent, so successful newsletter delivery is unavailable.

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

## Unresolved production account access

The configured global API key listed 57 zones across two accessible accounts, but `musclehacking.com` was absent. Public DNS still reports Cloudflare nameservers `jill.ns.cloudflare.com` and `ken.ns.cloudflare.com`, so the zone is in a different or inaccessible Cloudflare account. No production Worker, custom-domain binding, DNS change, or Builds project was created.
