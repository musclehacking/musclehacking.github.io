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
pnpm test:e2e
pnpm test:agent-a11y
```

`pnpm preview:worker` serves the built Worker at `http://127.0.0.1:8787`. It is the authoritative local response check for routing, headers, assets, API failures, and the custom 404.

The local preview serves documents through Static Assets and invokes the Worker only for `/api/subscribe`. It does not implement the production apex-to-`www` redirect. That redirect remains a blocked Cloudflare cutover rule until its exact zone configuration and rollback are documented and approved.

## Editing and operations

- Routes and index policy: `src/config/routes.ts`
- Site facts and metadata: `src/config/site.ts`
- Articles: `src/content/blog/`
- Calculator: `src/features/calculator/`
- Supplements: `src/features/supplements/`
- Newsletter: `src/features/newsletter/` and `src/pages/api/subscribe.ts`
- Response headers: `public/_headers`
- Cloudflare: `wrangler.jsonc`
- Detailed guides: `documents/`

Never change DNS, bind the production domains, promote a production Worker version, make the repository private, or retire GitHub Pages without explicit approval of the exact cutover packet.
