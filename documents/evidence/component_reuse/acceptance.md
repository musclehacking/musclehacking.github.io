# Shared component ownership acceptance

## Scope and revisions

R1-R8 in the [read-only audit](../../component-reuse-audit.md) now have documented owners in the [component catalogue](../../architecture/components.md) and [design guide](../../../DESIGN.md). The [plan](../../todo/component_reuse_plan.md) records implementation and release status. No authored bodies, legacy/provider/generated sources, assets, fonts, dependencies, runtime/build/deployment settings, routes, domains or DNS are changed by this refactor.

- Original application: `204170a691838a006ec2cf94880fa310d2e08daf`.
- Local acceptance base: `8d2f20d969d7976aa870c7f55d01d5c7fed86b7a` plus this task’s scoped changes. The intervening Node patch belongs to other work; all original application source hashes matched before editing.
- Accepted application input manifest SHA-256: `18dc8f53199df54ef4821f738251c6315310f9f64602ef1d11a87b1fdec8ed34`. Raw `final-inputs.json` identifies every source file. The same source hashes still match after final tests.
- Runtime: pinned Node 22.23.4, pnpm 11.24.0, installed Playwright 1.62.1 and Wrangler 4.127.1. No dependencies or settings are changed.
- Implementation commit and deployed version: pending the authorised staging release. No production action is authorised or performed.

## Local results

Expected result: unchanged rendered copy/semantics/discovery and zero changed decoded pixels at all required widths, with passing project checks. Actual result: pass.

| Check | Actual result | Raw output under `.artifacts/component_reuse/` |
| --- | --- | --- |
| Independent untouched baseline | 20 HTML documents; 1,325 captures in each independent run; zero changed pixels | `baseline-final/`, `baseline-final-repeat/`, `baseline-final-390.log`, `baseline-final-768.log`, `baseline-final-1440.log` |
| Batch 1: facts and icons | Four standard commands pass; 1,325 captures, zero changed pixels | `batch1-final-*.log`, `batch1/manifest.json`, `batch1-output/` |
| Batch 2: composition | Four standard commands pass; 1,325 captures, zero changed pixels | `batch2-fixed-*.log`, `batch2/manifest.json`, `batch2-output/`, `batch2-document-contract.json` |
| Batch 3: CSS ownership and tokens | Four standard commands pass; 1,325 captures, zero changed pixels on final scoped source | `batch3-scoped-*.log`, `batch3-scoped/manifest.json`, `batch3-scoped-output/`, `batch3-scoped-document-contract.json` |
| Astro/TypeScript | Zero errors/warnings; six existing deprecation hints | `final-check.log` |
| Unit tests | 134 pass in 18 files | `batch3-scoped-test.log` |
| Build and distribution | Pass; 20 HTML files and 19 public routes, metadata/discovery/headers/links/media/script budgets valid | `batch3-scoped-build.log`, `batch3-scoped-verify-dist.log` |
| Full E2E | 271 pass, 25 existing project-specific skips, zero failures | `final-local-e2e-accepted.log`, `local-e2e-final-results/` |
| Agent accessibility | All six standard cases pass with no unapproved serious/critical violations | `final-local-a11y-isolated.log`, `local-a11y-results/` |
| Scope and cleanup | Accepted source hashes unchanged; no protected settings/content/assets changed; local port 8787 and wrapper lease released | Source/diff review and lifecycle readback |

The 20 documents comprise home, blog listing, eleven blog articles, Books, calculator, beginner guide, confirmation, join, supplements and the real missing-path 404. Inventory comes from each fresh build, rather than only sitemap URLs. Each run covers 521 phone, 386 tablet and 418 desktop captures. Complete document coverage uses 923 overlapping viewport tiles; 402 captures cover menus, card hover/focus, social/rail/inline sharing, copy feedback, newsletter focus, every supplement filter/Show All and calculator modes/floating/modal prompts.

Built semantic trees retain text and meaningful whitespace, native tags/direct children, classes, IDs, links, SVG paths, ARIA/data hooks and structured data. Only compiler scopes and fingerprinted bundle locations are abstracted. A separate contract compares canonical/preload links, script attributes and island entry names. Discovery output is compared byte for byte. All match the original build.

## Capture setup and replay

Use the project lifecycle wrapper for every local server. No manually launched preview is used. The standard commands are `pnpm check`, `pnpm test`, `pnpm build` and `pnpm verify:dist`. Final E2E uses `scripts/run-e2e-local.sh --workers=3` with an absolute ignored output directory. The same six cases as `pnpm test:agent-a11y` run serially through that wrapper by adding `tests/a11y --project=chromium --grep "unapproved serious accessibility" --workers=1` and a separate ignored output directory.

Temporary pixel acceptance uses the installed Chromium at DPR 1, en-US/UTC, fixed 22 October 2026 clock, 390×844, 768×1024 and 1440×900 viewports. External requests are blocked on both sides; animated GIF requests use their identical first decoded frame. This is browser-context control only. Fonts and every local image are loaded/decoded, native scroll events settle before advancing the application frame, the compositor is primed, and finite animations complete for screenshots. Overlapping visible scroll tiles retain every viewport pixel with 160px overlap. Hover/focus/copy states are settled explicitly. There are no masks, pixel tolerance, product screenshot mode or replacement baselines. Image decode failures stop the capture.

To replay pixel comparison, use each accepted run’s `manifest.json` to pair PNGs with `baseline-final/` by filename. Decode both with installed sharp `ensureAlpha().raw()`, require equal dimensions and compare all RGBA bytes. Every accepted pair has zero unequal pixels. To recapture, recreate a disposable spec using the settings above, discover HTML from fresh `dist/client`, and run it only through the lifecycle wrapper. Temporary executable helpers are removed after hosted proof; raw PNGs, source/input manifests, snapshots and logs remain locally ignored until acceptance.

## Resolved failures and test judgement

- Capture-only races and native raster differences occurred before application edits. Visible viewport tiling, native scroll/frame settling and explicit clipboard completion produced an independently matching baseline. No tolerance or mask is introduced.
- Batch 1 caught a direct Node config import without `.ts` and an empty data hook serialised as `true`. Both causes are fixed before that batch’s accepted comparison.
- Batch 2 caught content IDs being treated as full paths; the helper now compares `/blog/` plus each slug and resolves titles from content.
- One local Wrangler proxy request returned HTTP 500 with `Network connection lost` for the unchanged header calculator asset. The failure packet is retained in `diagnostics/batch2-proxy-network/`; the isolated page and fresh desktop lifecycle run pass without an app/dependency change.
- A combined final browser run lost the local proxy connection and two Playwright processes collided in the default output directory. Those results are inconclusive, not application regressions. Serial checks with separate ignored output paths pass. Runtime failure evidence is in `diagnostics/final-runtime/`.
- The full E2E run initially has two failures because an existing palette assertion requires a literal CSS colour string. R7 intentionally replaces literals with shared tokens. That existing test now resolves declarations in the inherited filter context and asserts exact background/border colours, existing contrast thresholds and forbidden legacy fills. Both focused cases and the final full suite pass. No new test case, skip, weakened threshold or app workaround is added.

## Hosted acceptance

Pending: authorised push, explicit review Worker upload/deploy, version/commit and asset readback, hosted HTTP/E2E/accessibility, three-width pixel parity, live breakpoint geometry and optical inspection. Target: `https://musclehacking-astro-preview.webpop.workers.dev`, Worker `musclehacking-astro-preview`, account `213ab3604485056376263d22fa242742`. Preflight verifies workers.dev enabled and no custom domains or routes across 55 account zones. GitHub Pages remains on `master`; the migration branch does not deploy production.

## Excluded edge cases

- Other browser/OS/GPU/device-pixel-ratio combinations: exact raster proof uses one fixed Chromium environment. Existing normal browser E2E remains in place.
- Provider-controlled live iframe pixels and successful newsletter delivery: external provider code/data and delivery credentials are outside scope. Native iframe output, safe mocked flows and hosted failure contracts remain covered.
