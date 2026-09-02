# Cloudflare Builds configuration

## Intended project

- Repository: `musclehacking/musclehacking.github.io`
- Default branch: `master`
- Migration branch: `codex/astro-cloudflare-migration`
- Root: repository root
- Node: `22.23.2`
- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm build`
- Non-promoting upload: `pnpm exec wrangler versions upload`
- Worker name in source: `musclehacking-astro`

Migration-branch builds must upload versions without promotion. GitHub App access must be selected-repository access. Do not add a duplicate GitHub Actions deployment.

## Isolated review Worker

On 31 August 2026, Wrangler deployed the candidate build directly to a new review-only Worker in the personal Cloudflare account `213ab3604485056376263d22fa242742`:

- Worker: `musclehacking-astro-preview`
- URL: `https://musclehacking-astro-preview.webpop.workers.dev`
- Active version: `88b47e15-e6fb-408a-8379-1b7997f67645`
- Inactive legacy rollback version: `e9e4425e-eb64-493f-a05e-dfbf99a5a388`
- Legacy version preview: `https://legacy-9bf25d0-musclehacking-astro-preview.webpop.workers.dev`
- Release controller: direct Wrangler deployment, not Workers Builds or a Git integration
- Bindings: Static Assets and the public preview origin only; no provider credentials

This Worker has no custom domains or production routes. It does not change DNS, GitHub settings, GitHub Pages, or the live site. The preview origin is allowed for same-origin newsletter validation, but the missing provider credentials force a safe `503 newsletter_unavailable` response.

The inactive legacy version contains the exact audited tree from commit `9bf25d0`. Its version preview returns `200` for the homepage and a representative article. Cloudflare reports Astro version `88b47e15-e6fb-408a-8379-1b7997f67645` at 100 percent after updating the preview-only allowed origin to the `webpop.workers.dev` namespace. This proves a stored non-production rollback artefact without interrupting the review URL.

## Unresolved production account access

The configured global API key listed 57 zones across two accessible accounts, but `musclehacking.com` was absent. Public DNS still reports Cloudflare nameservers `jill.ns.cloudflare.com` and `ken.ns.cloudflare.com`, so the zone is in a different or inaccessible Cloudflare account. No production Worker, custom-domain binding, DNS change, or Builds project was created.
