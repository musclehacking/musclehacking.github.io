# Testing

- `pnpm check`: Astro and TypeScript diagnostics.
- `pnpm test`: route, calculator, supplement, and newsletter unit contracts.
- `pnpm build`: Astro build, mixed-route shaping, and CSP hash finalisation.
- `pnpm verify:dist`: complete route inventory, metadata, links, images, discovery output, forbidden strings across emitted markup, styles, browser JavaScript, source maps, and manifests, CSP, and compressed JavaScript budgets.
- `scripts/run-e2e-local.sh`: all 19 served routes, the retired-URL 301, and key interactions in desktop and mobile Chromium through one task-owned local Wrangler preview. This wrapper is the only supported way to run the E2E suite locally.
- `pnpm test:agent-a11y`: existing axe serious and critical checks plus the canonical 33 agent-accessibility rules on every built document and declared navigation, calculator, filter, popover and dialog states. Remote requests are blocked in the expanded contract tests.

The unit suite also validates collection schemas, metadata composition, authoring lint, bylines, derived navigation, listing order, and disposable draft/future fixtures. `scripts/content-authoring-parity.mjs` compares all twelve articles plus Books and the beginner guide against the audited legacy tree at 1440px and 390px.

Legacy reduced fixtures are under `tests/fixtures/legacy/`. Large baseline screenshots are outside Git at `/Users/sacino/Documents/codex/web-development/musclehacking/legacy-baseline-9bf25d0/`. Candidate screenshots belong beside them under `astro-candidate/`.

Content-authoring side-by-side screenshots and the 28 document-height measurements are outside Git at `/Users/sacino/Documents/codex/web-development/musclehacking/content-authoring-baseline/`. The accepted tolerance is 1px at 1440px and 2px at 390px. The final run passed every measurement.

Never send a real newsletter mutation during ordinary tests. A hosted success test requires preview-only credentials and a human-approved test destination.

## Running the E2E suite

Run the E2E suite only through the lifecycle wrapper:

```bash
nvm use "$(tr -d '[:space:]' < /Users/sacino/musclehacking/.nvmrc)"
/Users/sacino/musclehacking/scripts/run-e2e-local.sh --workers=3
```

The wrapper builds first, starts one task-owned `wrangler dev` on `127.0.0.1:8787`, runs Playwright against it, including `@local-runtime` checks, and proves the preview and its lock are released. Pass ordinary Playwright arguments after the script name for a focused run, for example `--grep "AUD-01"` or `--grep @local-runtime`.

Do not pre-start `wrangler dev`, do not run `pnpm test:e2e` directly against a manually started preview, and do not use `astro preview`. `documents/testing/local-runtime-lifecycle.md` owns the full lifecycle and ownership rules, including what to inspect when the wrapper reports incomplete cleanup.

## Explain performance changes

Local before-and-after investigations use **three scoring runs per page and device**, plus three mobile runs with actual DevTools throttling. Report the arithmetic average of each score and metric, all three values, the median and the min-max range. Do not recalculate a score from averaged metrics or combine different throttling profiles.

Freeze the original and candidate client builds with hash manifests outside Git before measuring. Use the lifecycle wrapper's frozen-client mode on separate owned ports. Verify both the on-disk manifests and served HTML/CSS/JavaScript hashes. Pass both builds to one Lighthouse batch with the shared `/tmp/codex-lighthouse-host.lock`, so they share a calibration and rotate run order. Do not build, run other test suites or operate the browser during that local batch.

A score alone is not a diagnosis. Compare its weighted metrics first, then inspect the largest contentful paint element, image/font bytes and priorities, resource completion times, dependency waves, stylesheet requests, JavaScript execution, main-thread work, long tasks and layout shifts. A simulated paint estimate can change when a neighbouring image finishes either side of the observed paint; compare the actual-throttling results before treating that estimate as a visitor regression.

When a regression repeats outside its run-to-run range, compare the candidate with one suspected change removed, in the same batch. Keep the rest identical, including headers and assets. Name what the control changes and confirm it still renders and operates normally. Credit an improvement to that change only when its control supports the claim. Reject a score-only improvement that makes actual loading worse.

For hosted checks, use the browser selected by the Lighthouse skill and the requested run count. Verify the intended deployment and asset hashes before starting. Preserve report URLs, timestamps, raw JSON, failed attempts and environment differences. Never compare the legacy production site with an Astro preview as if only the optimisation code differs. Hosted after-checks require an authorised publication of the measured source.

## Current migration evidence

Measured on 4 September 2026 on branch `codex/astro-cloudflare-migration` with Node 22.23.2 and pnpm 11.24.0, after the AUD-01 to AUD-07 audit pass:

- `pnpm check`: 115 files, 0 errors, 0 warnings, 5 deprecation hints.
- `pnpm test`: 134 tests passed in 18 files (23 September 2026). `tests/unit/og-locale.test.ts` adds one case per built HTML file, so the count follows the current `dist`.
- `pnpm build` and `pnpm verify:dist`: pass, with the summary line `Verified 20 HTML files, 19 public routes, expected titles, article and long-form bodies, fragments, discovery output, CSP, links, images, browser output forbidden strings, and JavaScript budgets.`
- `scripts/run-e2e-local.sh --workers=3`: 296 cases, 271 passed, 25 intentional single-project skips, 0 failed (23 September 2026).
- After a failed run the wrapper keeps `/tmp/musclehacking-e2e-8787.lock` as evidence. Before rerunning, confirm every PID in its `lease` and `descendants` files has exited, then move the lock to the Trash.
- `pnpm test:agent-a11y`: 6 passed, with **no** `color-contrast` exception left in `tests/a11y/site.spec.ts` after the A11Y-01 and A11Y-02 palette decisions.
- Full 20-route document heights at 1440px and 390px: 38 of 40 within tolerance. The two exceptions are `/supplements/` at -4px (1440px) and -46px (390px) across a 56,000px document. Every route has zero horizontal overflow at 1440px, 414px, 390px, 375px, and 320px.

- `pnpm test:visual`: all 46 captures pass or use an existing approval. The highest unapproved evaluated mismatch is 1.20 percent (desktop calculator LeanGains); every mobile capture is between 0.09 and 0.97 percent.

### Visual baselines

The 23 mobile baselines were regenerated on 4 September 2026 under the human-approved VIS-01 decision, because the retained files were 390x844 crops of a wider render and disagreed with the audited legacy tree itself by 8.65 to 46.66 percent. `PROVENANCE.json` beside them records the legacy commit, origin, tool version, viewport, capture date, and every source URL. Superseded files are outside Git at `reports/musclehacking/20260904-migration-audit/superseded-mobile-baselines/`.

Regenerate baselines only under a recorded human decision. Serve the audited legacy tree first, then:

```bash
python3 -m http.server 4173        # from the repository root
VISUAL_CAPTURE_BASELINE=1 VISUAL_CAPTURE_VIEWPORTS=mobile pnpm test:visual
```

The capture mode reuses the comparison path's viewport, GIF-frame pinning, settle loop, and double-screenshot raster flush, so baselines and candidates are produced the same way. `VISUAL_LEGACY_URL` and `VISUAL_LEGACY_COMMIT` override the origin and the recorded commit.

### Hosted verification

The isolated review Worker `musclehacking-astro-preview` serves version `8cb22fb7-b3d9-4a80-957c-fb98699d7108` (verification repair commit `13743d0be7de776895fc92edb51d6f0115846004`, existing Turnstile secret retained), deployed at 100 percent on 22 October 2026. All 14 hosted HTTP contract cases and all six agent accessibility cases pass. All 140 eligible served files equal the local release build and accepted component ownership release byte for byte. That identical application retains the 1,325 phone/tablet/desktop captures with zero changed pixels and 44 matching settled boundary contexts. The [component reuse acceptance record](../evidence/component_reuse/acceptance.md) contains the method, raw-output paths and replay commands.

The complete three-worker hosted E2E run passes: **351 passed, 25 existing project-specific skips, zero failures and zero retries**, in 87.5 seconds. The timeout repair splits the existing route/control coverage and removes nested result polling. A later home-hover test fix waits for the scrolled frame before pointer movement. All original assertions, deadlines and application bytes remain intact; the larger case count comes from independent scenarios. The component reuse plan's hosted gate is complete.

```bash
node scripts/hosted-contract.mjs                                   # 14 HTTP contract cases
MUSCLEHACKING_BASE_URL=https://musclehacking-astro-preview.webpop.workers.dev \
  pnpm exec playwright test tests/e2e --workers=3                  # portable UI matrix against the hosted origin
```

`scripts/hosted-contract.mjs` only issues HTTP requests; it never uploads or promotes anything. The fingerprinted-asset case resolves its path out of `dist/client/index.html`, so a new content hash does not invalidate the fixture. Setting `MUSCLEHACKING_BASE_URL` points Playwright at that origin, suppresses `webServer`, and selects the portable suite by excluding tests tagged `@local-runtime`.

Portable newsletter specs send `Origin` from the configured Playwright `baseURL`. Against the hosted Worker they fail closed (`405` for other methods, `400 malformed_form`, `503 newsletter_unavailable`) instead of using a loopback origin.

Genuinely local-runtime checks stay tagged `@local-runtime` and keep their assertions. They run through `scripts/run-e2e-local.sh`, which does not set `MUSCLEHACKING_BASE_URL`:

- `tests/e2e/newsletter-request-limits.spec.ts`: raw `node:http` chunked POST to the task-owned Wrangler preview at `127.0.0.1:8787`
- `tests/e2e/routes.spec.ts`: the local Static Assets preview does not implement the external apex `Host` redirect

The hosted portable matrix selects 376 cases. The six newsletter specs that previously failed with a loopback `Origin` now pass against the configured origin. The four `@local-runtime` cases are not selected. Do not convert those checks into `test.skip` on hosted runs.

A Cloudflare *version preview* URL is not equivalent to the deployed review URL: it blocks cross-site form POSTs at the edge with its own plain-text `403`, so the newsletter contract case only passes against the deployed URL, and it sends `x-robots-tag: noindex`, which drops a Lighthouse SEO score to 69.

### Lighthouse

Lighthouse 13.4.1 JSON is outside Git at `/Users/sacino/Documents/codex/web-development/musclehacking/lighthouse/` and, for the 4 September audit run, under `reports/musclehacking/20260904-migration-audit/`. Against hosted version `fc27fbf7`, mobile scores are home `90/100/96/100` (LCP 3.7 s), article `90/100/96/100` (LCP 3.6 s), calculator `100/99/96/100` (LCP 1.1 s), and supplements `100/100/96/100` (LCP 1.2 s). REQ-13's median thresholds pass; the LCP clause on home and article carries the approved PERF-01 exception in `documents/migration/human-review-packet.md`. The 30 August scores do not reproduce and are superseded.

## UI-01 through UI-13 parity suite

`tests/e2e/ui-parity.spec.ts` maps every reopened UI issue to an observable component, state, route, and viewport assertion. Its desktop and mobile Chromium cases cover all thirteen issue IDs plus the AUD-01, AUD-02, and AUD-07 regressions and the sixth-review home and sidebar hover states. Each article-ending route and the animated rail flow runs independently, so a slow provider iframe cannot consume the deadline for every route's assertions.

`tests/e2e/calculator-supplement-comprehensive.spec.ts` checks each of the 28 Standard, LeanGains and keto control/value cases on its own default page. Its result-change check uses the native locator assertion against rendered text, rather than nesting an `innerText` locator request inside a separate `expect.poll` deadline. The original hosted trace records the correct result before that nested read stalls. All input validity and invalid-result checks remain. The timeout follow-up and preserved assertion inventory are in the component reuse acceptance record.

The UI suite checks exact placement geometry, callout SVG paths, supplement pointer and keyboard popovers, pointer-leave dismissal, heading-link clipboard feedback and target scrolling, fixed-header behaviour, calculator prompt focus behaviour, calculator-guide content order, heading scales, every home-card hover and focus state, footer absence on every route, server-rendered article-ending order, mobile overflow, and article-bottom newsletter geometry. Distribution verification also compares every extracted article navigation label, destination, title, and display string with the retained legacy HTML.

UI-10 waits for the scrolled frame before moving the pointer over each home card. Chromium can report updated scroll geometry before presenting that frame; sending pointer coordinates during that gap can leave the card unhovered. Keep the exact hover colour, geometry and keyboard-focus assertions.

`tests/e2e/rejected-visual-parity-regressions.spec.ts` holds the production-derived component regressions from the 2 September 2026 review: the AnchorJS inline contract and hover travel, the tippy-equivalent tooltip primitive (300/250 ms ease transitions, 20px hidden travel, arrow rotation, 10px popper offset, two-tooltip copied lifecycle), callout single-row geometry and the legacy palette, the five share-rail icon boxes to the hundredth of a pixel, list/guide/TOC rhythm, and the legacy back-to-top control.

`tests/e2e/fifth-review-parity.spec.ts` holds the 2 September 2026 fifth-review regressions: heading self-link scope (no controls in page endings, none on the legacy calculator article), the calculator copy control geometry and shared project tooltips, the Bootstrap-grid breakpoints and legacy mobile stack, the 660px floating prompt and 30-second exit overlay (driven with `page.clock`), bottom-newsletter geometry, callout link styling, heading-adjacent rhythm, ligature settings, and the legacy-sourced calculator guide.

The AUD-01 and AUD-02 case in `tests/e2e/ui-parity.spec.ts` pins the `/join/` newsletter box against the legacy `#g-resp`, `#parent-e-form`, and `#under-form-notice` contract at 1440px, 414px, 390px, 375px, and 320px: zero horizontal overflow, the centred `min(300px, 90%)` control column, 18.9px control type in a padding-driven 51.9px box with 5px radii, and the 19.8px/31.284px assurance line.

The AUD-07 case in the same file pins the approved AA-safe palette and asserts the computed contrast ratio of every affected control: the `#0969DA` Note and `#8250DF` Important callout titles, the `#3d7295` default and `#356886` hover supplement filters, the inverted `#14496B`-on-`#DCEAF4` information filter, and the `#177245` / `#8A5A00` / `#B02A1C` evidence badges. It also fails if any filter rule reintroduces a legacy fill that misses AA.

Legacy-versus-Astro layout parity is measured, not screenshot-diffed: with the audited tree served at `http://127.0.0.1:4173` (`python3 -m http.server 4173` from the repository root) and the candidate served from the wrapper's Worker preview, compare `document.documentElement.scrollHeight` per route and the per-block `getBoundingClientRect` sequence at 1440px and 390px.

These local assertions do not replace the hosted component-state run or the required human side-by-side acceptance in the migration plan.
