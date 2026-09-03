# Muscle Hacking repository guide

Read `/Users/sacino/AGENTS.md` first. It is the higher-level workspace policy.

This repository is an Astro site deployed with Cloudflare Workers Static Assets. Keep documents prerendered. Only `/api/subscribe` may execute per request. Do not change DNS, bind production domains, promote a production Worker version, make the repository private, or retire GitHub Pages without explicit human approval of the exact cutover packet.

Use `pnpm`. Use the Node version pinned in `.nvmrc`. Run `pnpm check`, `pnpm test`, `pnpm build`, `pnpm verify:dist`, `pnpm test:e2e`, and `pnpm test:agent-a11y` for migration changes.

Source ownership:

- Routes and index policy: `src/config/routes.ts`
- Site identity and metadata: `src/config/site.ts`
- Document metadata composition: `src/lib/metadata.ts`
- Blog and long-form content: `src/content/blog/` and `src/content/pages/`
- Article defaults, listing cards, and navigation: `src/lib/content/`
- Authored content components: `src/components/content/`
- Calculator: `src/features/calculator/`
- Supplements: `src/features/supplements/`
- Newsletter: `src/features/newsletter/` and `src/pages/api/subscribe.ts`
- Headers and cache policy: `public/_headers`
- Cloudflare deployment: `wrangler.jsonc`
- Operations and architecture: `documents/`

Do not add analytics, external browser dependencies, legal claims, identity facts, or provider credentials without documented approval. Never test newsletter mutations against production.
