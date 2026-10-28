# Astro optimisation acceptance

Accepted locally on 28 October 2026. The requested skill audit and applicable output-preserving changes are complete. Production publication and IndexNow activation are outside this task.

## Scope and revisions

The request invokes `build-astro-websites` existing-site mode. Its output-preserving rework permission overrides speed-philosophy's usual proposal gate for replacing implementation, while preserving existing URLs, appearance, copy and interactions. Accessibility defects are the listed intentional exceptions.

The unchanged baseline predates every repository edit: `b0ef37717a7dcde41d63003c3ccbee1a9664c25f`, branch `codex/astro-cloudflare-migration`, clean worktree and index. Final checks run on the scoped worktree above `5c07ed545b1c77d255ced430ec6766398c66dde3`. Concurrent newsletter commits and subsequent collaborator changes are excluded from this task's commit. The commit containing this record identifies the final source revision.

Raw evidence and temporary comparison scripts: `/tmp/musclehacking-astro-optimisations.uv5mzY/`. No raw output is committed. `BASELINE.md`, `baseline-dist/` and `baseline-manifest.json` preserve the original output. `accepted-frozen/` and `accepted-manifest.json` preserve the final measured client build. SHA-256 comparison confirms that it does not change during measurement.

Setup: Node 22.23.4 from `.nvmrc`, pnpm 11.24.0, Astro 7.2.9, Cloudflare adapter 14.2.5, Wrangler 4.127.1. All browser runs use the project's local lifecycle wrapper and its owned port 8787. No production newsletter mutation is performed.

## Applied changes and intended differences

- **Delivery:** one base-layout project entry replaces component-owned processed scripts. Each module skips absent markup. Small styles below 4096 bytes inline automatically; larger shared/calculator styles retain immutable caching. The canonical origin comes from its existing site owner. Seven YouTube embeds and ten raw table images now defer loading; table images also decode asynchronously. Hero priority and all image/font bytes remain unchanged.
- **Scrolling:** supplement contents tracking measures nearby targets and does no work while its list is hidden, except while following an anchor. Filters restart the tracker. The 10px landing offset, initial empty active state, bottom rule, appearance and native fragment behaviour remain. Back-to-top, sharing and floating prompts write visibility only when it changes.
- **Metadata:** strict canonical input validation, actual visible article headlines for schema, measured social-image facts, Twitter image metadata, linked WebSite/WebPage/BlogPosting identities, and no graph on non-indexable pages. Existing titles, descriptions, URLs, dates and approved social-only Jay identity remain.
- **Agent discovery:** curated prerendered `llms.txt`, UTF-8 response header, discovery relation and explicit form-action annotations. No automatic subscription, bypass of validation or new runtime representation is introduced.
- **Accessibility:** a keyboard-focused skip link targets each document's focusable main region. Evidence tooltips use a valid neutral wrapper. The calculator's native newsletter dialog locks background scrolling in WebKit, preserves an existing classic scrollbar gutter and releases the lock on every close path. Resting layout, 30-second trigger, entrance/exit motion and focus restoration remain.
- **IndexNow preparation:** stable public proof, offline inventory and read-only comparison commands, and a tested explicit after-cutover notifier. It verifies ownership, publication bytes, crawler policy and branch before posting, with bounded retries. It never deploys and has no build-time submission hook. Automatic publication integration is not activated because the exact production release controller/cutover is not approved. See [IndexNow preparation](../../migration/indexnow.md).

## Deterministic acceptance

Twenty built HTML documents at 390, 768 and 1440px produce **60 full-page comparisons with zero changed decoded pixels**. Each original capture repeats identically. Animated GIFs are fixed to their first decoded frame and YouTube frames use local fixtures in browser context only. Candidate captures use the same setup and eagerly decode images for parity; actual native loading is checked separately. The final captures are in `accepted/`; command and assertions are in `accepted-parity.log` and `capture.mjs`.

`compare-final.mjs` confirms all 20 documents preserve body text, document titles, canonicals, existing links, image sources/alternatives/dimensions and iframe sources/titles. It excludes scripts/styles and the intentional skip link. Results: `final-output-comparison.json`.

| Page | Blocking stylesheets, before → after | HTML gzip bytes, before → after |
| --- | ---: | ---: |
| Breakup Energy article | 3 → 1 | 9,938 → 9,270 |
| Calculator | 3 → 2 | 24,113 → 22,835 |
| Home | 2 → 1 | 6,506 → 6,319 |
| Supplements | 3 → 2 | 60,002 → 58,930 |

Gzip values use the same Node `gzipSync` level 9 for both frozen builds. These are document sizes, not complete transfers. Ordinary pages retain one blocking shared stylesheet; calculator and supplement pages retain two. This does not meet the skill's aspirational one-request first paint, because full inlining has a measured document-size cost.

Lighthouse network inventories, including fetched images/fonts and external scripts: home 29 → 30 requests and 3,534,203 → 3,538,366 transferred bytes; article 23 → 20 and 1,239,896 → 1,238,557; calculator 30 → 27 and 364,846 → 360,751; supplements 23 → 19 and 187,688 → 178,173. These are local observations with browser-selected lazy loading and headers, not field traffic estimates. Raw values: `network-comparison.json` and the LHR files.

The consolidated script shifts formerly inlined project code into a shared cacheable file, and adds unused route logic on small pages. Its main chunk is 29,631 raw bytes / 9,789 gzip bytes. Splitting that code cannot save 10 KB compressed, below the speed skill's minimum, and would add another dependency round trip on pages using it. No extra feature split is added merely to improve the homepage score.

The supplement regression measures **600 → 60 target reads** during 30 desktop scroll frames. The phone trace at 390×844 with real 4× CPU throttling measures **300 rectangle + 300 client-rectangle reads → zero** while the contents list is hidden. Layout work is zero in both traces; style time is 5.692 → 3.826ms, with no long tasks. Timing is descriptive only. Raw traces and setup: `baseline-scroll-trace.json`, `candidate-scroll-trace.json`, `scroll-comparison.json`, `measure-scroll.mjs`.

## Local Lighthouse diagnostics

These are four single-run mobile probes per build, **not repeated medians, real-phone results or proof of an overall speed improvement**. Lighthouse 13.4.1 / Chrome 156.0.8078.48 uses simulated 10.8× CPU throttling and baseline benchmark index 3108.5. Host load is recorded in the logs; per-audit benchmark indices remain close to baseline. All final audits have no Lighthouse run warnings.

| Page | Performance score, before → after | First contentful paint ms, before → after | Simulated largest contentful paint ms, before → after | Layout shift, before → after |
| --- | ---: | ---: | ---: | ---: |
| Home | 88 → 76 | 948 → 913 | 3,873 → 7,813 | 0.0376 → 0.0521 |
| Breakup Energy article | 82 → 83 | 1,167 → 968 | 4,983 → 4,695 | 0.0005 → 0.0005 |
| Calculator | 99 → 97 | 1,219 → 1,211 | 1,754 → 2,642 | 0.0395 → 0 |
| Supplements | 97 → 99 | 2,042 → 1,670 | 2,121 → 1,745 | 0.0006 → 0.0006 |

Accessibility / best practices / SEO remain 100/96/100 for home, article and supplements and 99/96/100 for calculator. The independent expanded axe suite passes its specified rules; Lighthouse's separate accessibility score is not represented as 100.

The homepage's simulated LCP worsens even though the raw observed local LCP is 109 → 55ms. Its LCP is the same unchanged 518,203-byte eager, high-priority Breakup Energy image. The calculator's raw observed LCP is 67 → 77ms. These local unthrottled trace values do not substitute for a real throttled comparison. The single samples cannot establish causation or rule out a real regression; no overall loading-speed gain is claimed. Scores and remaining homepage/calculator uncertainty stay explicit.

A frozen paired comparison was attempted but pnpm's `ERR_PNPM_UNSAFE_MODULES_DIR` guard rejected the isolated fixture's shared dependency directory. No install, dependency replacement, disk image or tooling rebuild was used to bypass it. The original baseline therefore remains one diagnostic probe per page. Full robust paired timing and hosted performance remain unverified.

## Reproduced defects and checks

Expected versus actual results:

- Ten authored table images lack lazy loading before the fix (`table-images-before.json`); all ten have it after, and the browser check passes.
- An open supplement tooltip fails axe `aria-allowed-role` with `aside[role=tooltip]`; changing only the wrapper to `div` makes the same open-state scan pass. No rule is disabled.
- WebKit allows the background to scroll while the newsletter dialog is open before the root lock. The same timer/wheel/Escape sequence after the fix retains scrollY 800 while open, then allows scrolling after close. `dialog-debug.json`, `dialog-debug.log`, `quality.json` and the committed three-close-path regression preserve setup/results. A first permanent scrollbar-gutter trial changed default calculator width and failed three geometry checks; the final conditional gutter removes that regression.

| Command / acceptance check | Expected and final actual result | Raw evidence |
| --- | --- | --- |
| `pnpm check` | Pass; 0 errors, 0 warnings, 6 pre-existing hints | `final-check.log` |
| `pnpm test` | Pass; 183 tests in 20 files | `final-unit.log` |
| `pnpm build` through lifecycle wrapper | Pass; all documents prerender, only subscribe runtime | `final-browser.log` |
| `pnpm verify:dist` | Pass; 20 HTML files / 19 public routes, content, discovery, CSP, links, media and JS budgets | `final-verify.log` |
| `scripts/run-e2e-local.sh --workers=3` with temporary acceptance teardown | Pass; 373 passed, 25 existing skips, zero failures | `final-browser.log`, `final.config.mts` |
| `pnpm test:agent-a11y --workers=3` against that owned preview | Pass; 31 tests, canonical 33 rules on every document and declared interaction states, no exclusions | `final-browser.log`, `quality.mjs` |
| Generic public-document, recovery and hidden-instruction checks | Pass; all 17 indexable routes, useful 404, zero hidden-instruction findings | `quality.json` |
| ChatGPT-User, Claude-User and Perplexity-User HTTP parity | Pass; same status, content type and bytes on all 17 indexable routes | `quality.json`, `quality.mjs` |
| Keyboard and WebKit checks | Pass; skip link/focus at 390 and 1440px; timer, wheel containment and Escape | `quality.json`, `skip-link-390.png`, `skip-link-1440.png` |
| `node /tmp/musclehacking-astro-optimisations.uv5mzY/compare-final.mjs` and full-page browser capture | Pass; 20 semantic comparisons and 60 zero-pixel comparisons | `final-output-comparison.json`, `accepted-parity.log` |
| `pnpm indexnow --plan` | Pass; offline list of 17 eligible canonical URLs, no POST | `final-indexnow-plan.log` |

Replay from the repository with the pinned Node and pnpm: run the first four project commands, then `scripts/run-e2e-local.sh --workers=3`. For the exact recorded combined acceptance, pass `--config /tmp/musclehacking-astro-optimisations.uv5mzY/final.config.mts`; it runs accessibility, HTTP/keyboard checks and then the four sequential diagnostic Lighthouse probes before lifecycle cleanup. For full screenshot parity, use `MH_OPT_PHASE=accepted scripts/run-e2e-local.sh --workers=1 --config /tmp/musclehacking-astro-optimisations.uv5mzY/capture.config.mts --project=chromium --grep 'production document'`. Temporary capture scripts and raw files are local replay aids; the committed browser and accessibility tests are the durable regressions.

The original full suite has pre-existing geometry/timing failures followed by a vanished preview and cascading network failures (`baseline-browser.log`). An isolated unchanged tooltip case passes. Later final full runs pass without weakening those tests. Some successful capture runs hit the existing cleanup race between `ps` and child exit under `set -euo pipefail`; the bash trace in `candidate-final-parity.log` identifies it. Only exact task-owned stale leases/runtime files are moved to Trash after every recorded PID and port is absent. The final combined run exits zero, with a harmless already-exited-child `kill` warning. Port 8787 and task preview processes are confirmed closed. Repairing that lifecycle race is a separate tooling task.

## Audit disposition

Two independent read-only auditors review browser delivery/interactions and discovery/IndexNow respectively; neither reports a supported defect. Their XML records are in `documents/todo/bugs/codex/subagent_bug_sweep_20261028_m8x4p2q7.xml` and `subagent_bug_sweep_20261028_b6v9k3r1.xml`, with the consolidated record `combined_bug_sweep_20261028_c7n2w8h5.xml`. They review an intermediate build using full stylesheet inlining. The final auto-inlining policy, table-image annotations, tooltip wrapper and modal lock receive the parent review and final checks above; the earlier audit is not represented as verification of those later changes.

| Audited branch | Disposition and reason |
| --- | --- |
| Static architecture, routes, content collections/build data | Retained; documents prerender, approved mixed URL policy and draft/future filtering already work. No route, framework, content source or dependency migration. |
| Site configuration, metadata, schema | Applied and verified as described above. No invented identity facts or changed visible titles. |
| Accessibility and generic readiness | Applied; visible exceptions are the keyboard skip link and corrected dialog/tooltip behaviour. Physical assistive technology remains untested. |
| Browser entry, components and scroll behaviour | Applied; existing component/style ownership is retained, source routing/design docs are updated. |
| CSS and security headers | Applied small-style inlining and explicit UTF-8 discovery header. CSP sources/hash rules and immutable/revalidation boundaries remain. |
| Images/video | Applied native lazy loading only where missing. Lossless WebP of the lead PNG is 546,812 bytes, larger than the 518,203-byte original; q90/q95 alternatives are also larger. PNG re-encoding trials either change decoded pixels or grow the image. No replacement bitmap is shipped. |
| Fonts | Retained local WOFF2 subsets, swap policy and current preload choices. No demonstrated output-preserving delivery gain justifies replacing the owner with the Fonts API. |
| Client islands | Retained the calculator's existing immediate React island and framework version. Rewriting its controls adds risk without an established gain. |
| Sitemap, robots, feed | Retained existing valid address, canonical inventory and approved crawler exclusions; no generator replacement or sitemap URL migration. |
| llms and form annotations | Applied the canonical renderer, curated configuration, discovery relation and progressive explicit-action descriptions. |
| IndexNow | Prepared and isolated-tested, not activated. Production release integration and actual submission remain behind exact cutover authority. |
| Agent-readable HTTP | Retained file-only HTML plus llms discovery. Same-URL Markdown negotiation would introduce request-time representation handling outside the project's subscribe-only policy; no selector, billing or dashboard change is added. |
| Blog listing/pagination and trust pages | Proposed only: archive pagination could help future growth; About/Contact/Privacy pages could provide fuller trust information. They change visible navigation/routes or require owner facts, so none is added under this optimisation request. |
| Full CSS inlining / splitting | Rejected: full inlining adds about 11 KB compressed to calculator HTML and mixed probes do not justify it. The full shared CSS is only about 9.8 KB gzip, below a useful hand-maintained split. |
| Provider scripts / analytics / continuous animation | No new provider surface; Turnstile remains on-demand through the existing form flow. No analytics, WebGL or continuous effect exists to optimise. Existing approved motion stays unchanged. |
| Contact backend / Starlight / new host | Not applicable; no new contact workflow, documentation portal or hosting migration is requested. |

## Deployment boundary and excluded edge cases

This task changes no DNS, production domains, repository visibility, Worker version, Cloudflare account, production branch, binding, deploy command, dashboard setting or secret. Source Worker `musclehacking-astro`, isolated review Worker `musclehacking-astro-preview`, `dist/client`, generated server output, Wrangler configuration and the subscribe-only runtime policy remain. The cutover runbook owns the current account-access and publication checkpoint; the baseline's older inaccessible-account statement is historical. No push, upload, deployment or real IndexNow POST occurs. `books.musclehacking.com` is untouched.

Excluded edge cases: production cutover/redirect/cache behaviour, production newsletter delivery, live IndexNow acceptance/indexing, physical screen-reader use, legacy browser engines and real-device field performance. Existing isolated newsletter failure tests remain; no live recipient or provider setting is used for these checks. Robust paired mobile timing is the material remaining performance gap described above.
