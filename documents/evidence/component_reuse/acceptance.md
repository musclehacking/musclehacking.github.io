# Shared component ownership acceptance

## Scope and revisions

R1-R8 in the [read-only audit](../../component-reuse-audit.md) now have documented owners in the [component catalogue](../../architecture/components.md) and [design guide](../../../DESIGN.md). The [plan](../../todo/component_reuse_plan.md) records implementation and release status. No authored bodies, legacy/provider/generated sources, assets, fonts, dependencies, runtime/build/deployment settings, routes, domains or DNS are changed by this refactor.

- Original application: `204170a691838a006ec2cf94880fa310d2e08daf`.
- Local acceptance base: `8d2f20d969d7976aa870c7f55d01d5c7fed86b7a` plus this task’s scoped changes. The intervening Node patch belongs to other work; all original application source hashes matched before editing.
- Accepted application input manifest SHA-256: `18dc8f53199df54ef4821f738251c6315310f9f64602ef1d11a87b1fdec8ed34`. Raw `final-inputs.json` identifies every source file. The same source hashes still match after final tests.
- Runtime: pinned Node 22.23.4, pnpm 11.24.0, installed Playwright 1.62.1 and Wrangler 4.127.1. No dependencies or settings are changed.
- Original implementation commit: `778bf9908c4143442ce17898dd143a0defcbcaea`, pushed to `codex/astro-cloudflare-migration` and initially deployed as version `3ff8509f-59b9-4d07-9e37-ea0b7aada8cf`.
- Final hosted verification revision: `13743d0be7de776895fc92edb51d6f0115846004`, deployed as review version `8cb22fb7-b3d9-4a80-957c-fb98699d7108` at 100 percent. The follow-up changes two test files and documentation only; all application inputs and public build bytes remain identical. Later evidence-only commits do not require another deployment. No production action is authorised or performed.

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

Temporary pixel acceptance uses the installed Chromium at DPR 1, en-US/UTC, fixed 22 October 2026 clock, 390×844, 768×1024 and 1440×900 viewports. External requests are blocked on both sides; animated GIF requests use their identical first decoded frame. This is browser-context control only. Fonts and every local image are loaded/decoded, native scroll events settle before advancing the application frame, the compositor is primed, and finite animations complete for screenshots. Overlapping visible scroll tiles retain every viewport pixel with 160px overlap. Hover/focus/copy states are settled explicitly. There are no masks, pixel tolerance, product screenshot mode or replacement baselines. Image decode failures stop the capture. Normal-time E2E runs separately test interaction.

To replay pixel comparison, use each accepted run’s `manifest.json` to pair PNGs with `baseline-final/` by filename. Decode both with installed sharp `ensureAlpha().raw()`, require equal dimensions and compare all RGBA bytes. Every accepted pair has zero unequal pixels. To recapture, recreate a disposable spec using the settings above, discover HTML from fresh `dist/client`, and run it only through the lifecycle wrapper. Temporary executable helpers and the original-build fixture are Trashed after hosted proof; raw PNGs, source/input manifests, snapshots and logs remain locally ignored until acceptance.

## Resolved failures and test judgement

- Capture-only races and native raster differences occurred before application edits. Visible viewport tiling, native scroll/frame settling and explicit clipboard completion produced an independently matching baseline. No tolerance or mask is introduced.
- Batch 1 caught a direct Node config import without `.ts` and an empty data hook serialised as `true`. Both causes are fixed before that batch’s accepted comparison.
- Batch 2 caught content IDs being treated as full paths; the helper now compares `/blog/` plus each slug and resolves titles from content.
- One local Wrangler proxy request returned HTTP 500 with `Network connection lost` for the unchanged header calculator asset. The failure packet is retained in `diagnostics/batch2-proxy-network/`; the isolated page and fresh desktop lifecycle run pass without an app/dependency change.
- A combined final browser run lost the local proxy connection and two Playwright processes collided in the default output directory. Those results are inconclusive, not application regressions. Serial checks with separate ignored output paths pass. Runtime failure evidence is in `diagnostics/final-runtime/`.
- The full E2E run initially has two failures because an existing palette assertion requires a literal CSS colour string. R7 intentionally replaces literals with shared tokens. That existing test now resolves declarations in the inherited filter context and asserts exact background/border colours, existing contrast thresholds and forbidden legacy fills. Both focused cases and the final full suite pass. No new test case, skip, weakened threshold or app workaround is added.

## Hosted acceptance

Implementation, release, output, visual and complete hosted acceptance pass. The final three-worker suite has 351 passes, 25 existing project-specific skips, zero failures and zero retries. The six hosted accessibility cases also pass. The original timeout runs remain below as failure evidence; isolated passes are not used as final acceptance.

Target: [review site](https://musclehacking-astro-preview.webpop.workers.dev), Worker `musclehacking-astro-preview`, account `213ab3604485056376263d22fa242742`. On 22 October 2026, the documented release commands upload the committed build with the explicit review name, preview newsletter origin, commit tag/message, then deploy the returned version at 100 percent. Wrangler reports no non-versioned settings to sync. Preflight and postflight readback confirm workers.dev enabled, no custom domains and no routes on this Worker across 55 account zones. Existing Turnstile secret remains; GetResponse credentials remain absent. No trigger, route, domain, DNS or production deployment command runs.

| Check | Actual result | Raw output under `.artifacts/component_reuse/` |
| --- | --- | --- |
| Release build/distribution | Pass; all 114 application source hashes and all 140 public build files equal the accepted refactor | `timeout-followup/final-local-gates/`, `timeout-followup/unchanged-output.json` |
| Remote source and active version | Commit `13743d0` pushed; version `8cb22fb7-b3d9-4a80-957c-fb98699d7108` active at 100 percent with full commit message and tag `13743d0be7de` | `timeout-followup/hover-release.json`, `timeout-followup/hover-release-active-readback.json`, `timeout-followup/hover-release-upload.log`, `timeout-followup/hover-release-deploy.log` |
| Release safety | Review Worker has no production routes or custom domains; previous versions retained; existing bindings preserved; no non-versioned settings synced | `timeout-followup/release-preflight.json`, `timeout-followup/hover-release.json`, `timeout-followup/hover-release-deploy.log` |
| Hosted HTTP contracts | All 14 pass on the final version | `timeout-followup/hosted-contract-final.log` |
| Served bytes | All 140 eligible public files equal both the local release build and accepted original refactor byte for byte | `timeout-followup/hosted-bytes-final.json` |
| Hosted pixels | All 20 documents and 1,325 captures match the original baseline with zero changed pixels; final local/hosted hashes, dimensions and scroll offsets match. Identical final application bytes preserve this proof without recapturing unchanged output | `hosted/manifest.json`, `hosted-390.log`, `hosted-768.log`, `hosted-1440.log`, `local-hosted-pixel-readback.json`, `timeout-followup/hosted-bytes-final.json` |
| Breakpoint geometry/type | 44 settled contexts match the original repeat and staging; final application bytes remain identical | `boundary-original-settled.json`, `boundary-original-repeat.json`, `boundary-hosted-settled.json`, `boundary-settled-result.json`, `settled-boundaries.log` |
| Hosted agent accessibility | All six cases pass on the final version | `timeout-followup/final-hosted-a11y/report.json`, `timeout-followup/final-hosted-a11y/results/` |
| Full hosted E2E, three workers | **351 pass, 25 existing project-specific skips, zero failures/retries** in 87.5 seconds | `timeout-followup/final-hosted-e2e-after-hover/report.json`, `timeout-followup/final-hosted-e2e-after-hover/results/` |
| Assertion preservation | All 52 article assertion expressions and 28 calculator control/value cases retained; UI-10 changes only its scroll/frame wait | `timeout-followup/assertion-preservation.json`, scoped test diff |
| Cleanup | Task browser closed; port 8787 and lifecycle lease absent; temporary tools/fixture/diagnostic config Trashed; shared dependencies and ignored raw evidence retained | `cleanup.json`, `timeout-followup/cleanup.json` and live resource readback |

GitHub exposes no check runs, workflow runs or status contexts for the deployed verification commit (`timeout-followup/github-final-checks.json`). The only automatic release workflow is the existing GitHub Pages deployment from `master`. The review release controller is direct Wrangler, so there is no pending automatic staging build to wait for. Hosted checks above run against the deployed review URL.

### Original hosted failures and their causes

- Desktop `ui-parity.spec.ts:661`, article endings/share rail: the 30-second whole-test deadline expires after a long multi-route traversal, near the final floating-rail visibility check. The trace is retained in `hosted-e2e-results/e2e-ui-parity-reopened-art-0cc0a--wrapping-and-floating-rail-chromium/`.
- Mobile `calculator-supplement-comprehensive.spec.ts:45`, calculator controls: the five-second result-change poll expires after selecting Standard protein `0.82`. The trace is retained in `hosted-e2e-results/e2e-calculator-supplement--78182--LeanGains-and-keto-results-mobile-chromium/`.

The first isolated diagnostic passes but does not establish a cause. The authorised follow-up inspects the complete original traces and changes only the two test files:

- **Article: slow under parallel load.** The one test performs 22 navigations, covering eleven articles, four long-form endings, additional disclaimers, the animated rail and a final share URL. Its navigation to the article with seven live YouTube iframes takes 14,971 ms. The rail later has `data-visible=true` and progressively increasing opacity, but the 30-second whole-test deadline expires before the remaining assertions finish. The slow animation is not a failed visibility state. Each route and the rail scenario now gets an independent test/context and the unchanged default deadline. All 52 original article assertion expressions retain identical tokens; disclaimer and special-share assertions move into their existing route cases.
- **Calculator: a test polling/read race under load.** The original trace disproves a lost input: the `0.82` selection has already changed the visible macro row from `1733 / 176 / 57 / 129` to `1733 / 145 / 64 / 144` at 104,430 ms. The separate runner poll starts at 104,565 ms; its first layout-dependent `innerText` request starts at 104,686 ms and remains outstanding for 10,431 ms, past the poll's five-second deadline. The test formerly performs 31 navigations inside one context. Each of the same 28 control/value cases now starts in its own default page/context. The result check uses Playwright's native locator assertion with `useInnerText: true`, retaining the same rendered text and five-second deadline without nesting a locator promise inside a second polling timer. Whitespace-only changes no longer count as a changed result. Input validity and `NaN`/`Infinity` assertions remain.

No hydration wait, timeout increase, retry, skip, blocked provider request, weaker assertion or application change is introduced. The exact lower-level reason Chromium delays one rendered-text read is not independently profiled; the trace establishes that the app updates before the test's observation fails. The fixes isolate browser work and remove the overlapping assertion deadlines rather than changing site behaviour.

On unchanged staging, a bounded two-worker diagnostic of both original tests repeated twice passes eight cases (calculator 4.1-5.2 seconds; article 9.0-11.0 seconds). A second diagnostic deliberately overlaps two original desktop article cases with the original mobile calculator at three workers: four passes (article 12.3-12.8 seconds, calculator 4.9-7.6 seconds). These runs confirm load sensitivity and are not used as final acceptance. After the repair, the same route/control coverage repeated twice across desktop/mobile with three workers passes all 176 cases; the slowest case takes 2.815 seconds. `timeout-followup/diagnose-load/`, `timeout-followup/diagnose-overlap/` and `timeout-followup/focused-fixed/` retain commands, JSON reports, stderr and traces; `timeout-followup/assertion-preservation.json` records the preserved assertion/control inventory. The temporary overlap config is Trashed; its replay settings remain in `diagnose-overlap/setup.json`.

The repaired tests pass the final local checks before release. `timeout-followup/final-local-gates/` records zero Astro/TypeScript errors or warnings (six existing hints), 134 unit tests in 18 files, build and distribution verification. `timeout-followup/final-local-e2e/` records 355 passes, the same 25 project-specific skips and zero failures at three workers. `timeout-followup/final-local-a11y/` records all six standard accessibility cases passing serially through the lifecycle wrapper. `timeout-followup/unchanged-output.json` proves all 114 accepted source hashes and all 140 public build files are unchanged. The earlier zero-pixel proof remains applicable to these identical application bytes. The suite's larger case count comes from splitting the existing coverage, not new skips or removed assertions.

### Full hosted follow-up and the home hover boundary

Commit `0723d86bd86acc9c181ec4917274f6f7f4178951` was pushed and deployed as version `f7dc2353-f422-4648-9709-5546b0ef25e8`. Both original timeout scenarios pass in that full three-worker hosted run. That run has 350 passes, 25 existing skips and one different failure: desktop UI-10 sees the second home card's white border after `hover()`. The raw report and trace remain in `timeout-followup/final-hosted-e2e/`; `timeout-followup/release*.json`, `release-upload-built.log`, `release-deploy.log`, `hosted-bytes.json` and `hosted-contract.log` retain its release, byte parity and all 14 HTTP passes.

The hover failure is a scroll/presentation race in the test. The trace's DOM snapshot records `scrollTop=260` before pointer movement, while its last presented frame still shows the page at the previous scroll position. The test sends the new geometry's pointer coordinates `(453.02, 765.42)` without waiting for that scroll frame. The card remains white during the five-second assertion. A live check confirms that the unchanged card's native 50 ms hover transition reaches `rgb(31, 97, 141)` without changing its bounding box. The test now waits for two animation frames after scrolling and before pointer movement, so the browser presents the scroll before the hover. Every original UI-10 assertion and the five-second expectation deadline remain unchanged. No application animation, CSS, interaction or browser launch setting changes.

The live check's contextual screenshot is `/Users/sacino/.dev-browser/tmp/mh-component-reuse-f84c/final/hosted-home-hover-verified.png`; its measured before/after geometry and diagnostic image are recorded in that directory's `evidence.json`. The task browser is closed after inspection. The original failed trace's last frame is diagnostic, not proof that the scroll completed.

After the frame-boundary fix, both desktop/mobile UI-10 cases repeated twice at three workers pass all four checks (9.8-15.4 seconds), with traces in `timeout-followup/home-hover-fixed/`. Astro/TypeScript diagnostics after the change still have zero errors/warnings and six existing hints. The additional focused local lifecycle run passes both UI-10 cases in 9.3 seconds; `timeout-followup/home-hover-local/` records its command and output. The original complete local suite remains valid for the unchanged scenarios. Commit `13743d0` records the additional wait and is pushed/deployed before the final passing full hosted run. The earlier one-failure run is not retried unchanged.

The first upload attempt explicitly selected the source `wrangler.jsonc` and fails locally on unresolved Astro virtual modules before upload. The corrected documented command lets Wrangler follow `.wrangler/deploy/config.json` to the built Worker, retaining the explicit review name and origin. The failed attempt remains in `timeout-followup/release-upload.log`; no source/deployment setting is changed to fix that command.

### Additional geometry and optical evidence

The first normal-time boundary measurements differ because the original measurement did not settle fonts/images and page geometry consistently. Those measurements remain diagnostic. To establish a valid original pair, an ignored `git archive` fixture from parent `8d2f20d` is checked against the original source hashes, built with the installed Astro CLI, and rendered from exact built bytes through browser request interception. This creates no worktree, branch or local server. All 20 original semantic/discovery outputs match the retained baseline; fixture-path-generated island UIDs alone are abstracted in the fixture comparison. The fixture is not a replacement pixel baseline.

Two independently settled original runs and staging match at widths 320, 560, 561, 767, 768, 820, 821, 1399, 1400, 1750 and 1751, at height 900, on home, the protein article, supplements and calculator. Boxes, fonts, colours, margins and padding match in all 44 contexts. `original-fixture-contract.json` and `original-build-fixture-cli.log` retain the fixture validation/build results.

Live contextual inspection confirms the desktop article's right-side share rail and Twitter tooltip, and phone supplements with Sleep selected and three visible cards. Accepted screenshots are `final/staging-article-desktop.png`, `final/staging-share-rail-detail.png` and `final/staging-supplements-phone.png` under `/Users/sacino/.dev-browser/tmp/mh-component-reuse-f84c/`; `evidence.json` identifies accepted and rejected diagnostic images. Earlier left-side crops miss the rail and are not acceptance evidence.

### Hosted replay commands

Run from the pinned runtime. Output must go to a fresh ignored run directory, so evidence from the recorded failed and passing runs remains intact.

```bash
node /Users/sacino/musclehacking/scripts/hosted-contract.mjs https://musclehacking-astro-preview.webpop.workers.dev
MUSCLEHACKING_BASE_URL=https://musclehacking-astro-preview.webpop.workers.dev \
  pnpm --dir /Users/sacino/musclehacking exec playwright test tests/e2e --workers=3 \
  --output=/Users/sacino/musclehacking/.artifacts/component_reuse/replay/hosted-e2e-results
MUSCLEHACKING_BASE_URL=https://musclehacking-astro-preview.webpop.workers.dev \
  pnpm --dir /Users/sacino/musclehacking exec playwright test tests/a11y --project=chromium \
  --grep 'unapproved serious accessibility' --workers=1 \
  --output=/Users/sacino/musclehacking/.artifacts/component_reuse/replay/hosted-a11y-results
```

The original isolated diagnostic on revision `2a074b8` uses the two named specs, `--grep 'every calculator control participates|reopened article endings restore'`, one worker and a separate output directory. The repaired groups use `--grep 'every calculator control participates|reopened article endings'`. Focused diagnostics do not replace the complete acceptance command above.

## Excluded edge cases

- Other browser/OS/GPU/device-pixel-ratio combinations: exact raster proof uses one fixed Chromium environment. Existing normal browser E2E remains in place.
- Provider-controlled live iframe pixels and successful newsletter delivery: external provider code/data and delivery credentials are outside scope. Native iframe output, safe mocked flows and hosted failure contracts remain covered.
