# Muscle Hacking

Astro 7 site for Muscle Hacking, built for Cloudflare Workers Static Assets. All public documents are prerendered. Only `POST /api/subscribe` runs in the Worker.

## Local setup

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Use Node `22.23.2`, as pinned in `.nvmrc` and `.node-version`.

## Verification

```bash
pnpm check
pnpm test
pnpm build
pnpm verify:dist
./scripts/run-e2e-local.sh --workers=3
pnpm test:agent-a11y
```

Run the E2E suite only through `scripts/run-e2e-local.sh`. It builds, starts one task-owned `wrangler dev` on `127.0.0.1:8787`, runs Playwright against it, and proves the preview and its lock are released. Do not pre-start `wrangler dev` for an E2E run and do not call `pnpm test:e2e` directly. `documents/testing/local-runtime-lifecycle.md` owns the lifecycle rules.

`pnpm preview:worker` serves the built Worker at `http://127.0.0.1:8787` for manual inspection only. It is the authoritative local response check for routing, headers, assets, API failures, and the custom 404. Stop it before running the E2E wrapper, which refuses to reuse a listener it does not own.

The local preview serves documents through Static Assets and invokes the Worker only for `/api/subscribe`. It does not implement the production apex-to-`www` redirect. That redirect remains a blocked Cloudflare cutover rule until its exact zone configuration and rollback are documented and approved.

## Editing and operations

- Routes and index policy: `src/config/routes.ts`
- Site facts and metadata: `src/config/site.ts`
- Article metadata composition: `src/lib/metadata.ts`
- Articles and long-form pages: `src/content/blog/` and `src/content/pages/`
- Content editing guide: `documents/content/editing.md`
- Calculator: `src/features/calculator/`
- Supplements: `src/features/supplements/`
- Newsletter: `src/features/newsletter/` and `src/pages/api/subscribe.ts`
- Response headers: `public/_headers`
- Cloudflare: `wrangler.jsonc`
- Detailed guides: `documents/`

Never change DNS, bind the production domains, promote a production Worker version, make the repository private, or retire GitHub Pages without explicit approval of the exact cutover packet.
