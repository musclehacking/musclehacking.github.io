# Testing

- `pnpm check`: Astro and TypeScript diagnostics.
- `pnpm test`: route, calculator, supplement, and newsletter unit contracts.
- `pnpm build`: Astro build, mixed-route shaping, and CSP hash finalisation.
- `pnpm verify:dist`: complete route inventory, metadata, links, images, discovery output, forbidden strings across emitted markup, styles, browser JavaScript, source maps, and manifests, CSP, and compressed JavaScript budgets.
- `pnpm test:e2e`: all 20 routes and key interactions in desktop and mobile Chromium through local Wrangler.
- `pnpm test:agent-a11y`: axe serious and critical checks on representative content, interaction, form, and 404 routes.

Legacy reduced fixtures are under `tests/fixtures/legacy/`. Large baseline screenshots are outside Git at `/Users/sacino/Documents/codex/web-development/musclehacking/legacy-baseline-9bf25d0/`. Candidate screenshots belong beside them under `astro-candidate/`.

Never send a real newsletter mutation during ordinary tests. A hosted success test requires preview-only credentials and a human-approved test destination.

## Current migration evidence

The clean frozen-lockfile install and every functional command pass. On 31 August 2026, 44 desktop and mobile captures passed the 2 percent threshold and the two supplement Show All captures passed through the approved stable-viewport exception. Every other unapproved evaluated mismatch is at or below the threshold. The harness records raw and evaluated mismatch values, uses exact masks for the three approved visual policies, fixes the animated GIF to deterministic frames, masks only provider-controlled YouTube raster content, and asserts the audited modernity hero asset hash. The review paths and approved policies are in `documents/migration/human-review-packet.md`.

Lighthouse 13.4.1 JSON is stored outside Git at `/Users/sacino/Documents/codex/web-development/musclehacking/lighthouse/`. Representative mobile category scores are all at least 96, LCP is at most 1.94 seconds, and CLS is at most 0.0438.

## UI-01 through UI-13 parity suite

`tests/e2e/ui-parity.spec.ts` maps every reopened UI issue to an observable component, state, route, and viewport assertion. Its 11 cases run in desktop and mobile Chromium for 22 focused results and cover all thirteen issue IDs. The complete E2E command now runs 248 desktop and mobile cases (226 pass, 22 are intentional single-project skips); run it as `pnpm exec playwright test tests/e2e --workers=3` against a pre-started `wrangler dev --port 8787`.

The UI suite checks exact placement geometry, callout SVG paths, supplement pointer and keyboard popovers, pointer-leave dismissal, heading-link clipboard feedback and target scrolling, fixed-header behaviour, calculator prompt focus behaviour, calculator-guide content order, heading scales, every home-card hover and focus state, footer absence on every route, server-rendered article-ending order, mobile overflow, and article-bottom newsletter geometry. Distribution verification also compares every extracted article navigation label, destination, title, and display string with the retained legacy HTML.

`tests/e2e/rejected-visual-parity-regressions.spec.ts` holds the production-derived component regressions from the 2 September 2026 review: the AnchorJS inline contract and hover travel, the tippy-equivalent tooltip primitive (300/250 ms ease transitions, 20px hidden travel, arrow rotation, 10px popper offset, two-tooltip copied lifecycle), callout single-row geometry and the legacy palette, the five share-rail icon boxes to the hundredth of a pixel, list/guide/TOC rhythm, and the legacy back-to-top control. Run `wrangler dev --port 8787` before `pnpm test:e2e`; the Playwright-managed server has dropped its proxy connection under the fully parallel run.

`tests/e2e/fifth-review-parity.spec.ts` holds the 2 September 2026 fifth-review regressions: heading self-link scope (no controls in page endings, none on the legacy calculator article), the calculator copy control geometry and shared project tooltips, the Bootstrap-grid breakpoints and legacy mobile stack, the 660px floating prompt and 30-second exit overlay (driven with `page.clock`), bottom-newsletter geometry, callout link styling, heading-adjacent rhythm, ligature settings, and the legacy-sourced calculator guide.

Legacy-versus-Astro layout parity is measured, not screenshot-diffed: with the audited tree served at `http://127.0.0.1:4173` (`python3 -m http.server 4173` from the repository root) and the Worker at `http://127.0.0.1:8787`, compare `document.documentElement.scrollHeight` per route and the per-block `getBoundingClientRect` sequence at 1440px and 390px. After the fifth-review fixes every route matches the legacy document height within 1px at 1440px and within 2px at 390px, except `/supplements/` (4px at 1440px, 46px at 390px across a 56,000px document).

These local assertions do not replace the hosted component-state run or the required human side-by-side acceptance in the migration plan.

The earlier `pnpm test:visual` page-wide baseline is not an acceptance result for UI-01 through UI-13. After these component changes, 42 of 46 captures pass or use an existing approval and 4 mobile captures exceed the old two percent threshold. Fresh named-browser comparisons show that the retained mobile home baseline is horizontally clipped and the rapid candidate capture omits a visible H1 line. Repair the harness before Step 10; do not update baselines or add masks to hide these failures.
