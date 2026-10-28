# TinyPNG image delivery acceptance

Verified on 28 October 2026. Source before: `78a4db4`. Candidate: that source plus the image copies and shared source resolver recorded in this commit.

## Result and limits

One Tinify pass processed the 15 homepage article illustrations and the calculator guide image. Fourteen smaller outputs save 70,383 bytes (1.95%) across the 16 inputs, from 3,618,193 to 3,547,810 bytes. The guide and Archer illustration have no further saving and keep their originals. Smaller header assets, unrelated article-only images, SVGs and animated GIFs were outside this pass.

`src/lib/images.ts::imageSource` selects reviewed sibling copies in HomeListing and Figure at build time. All 16 input originals remain byte-identical. No new browser JavaScript, CSS, fonts, image dimensions, loading attributes, metadata or content changes. All 20 built documents compare byte-for-byte after normalising only the selected image source URLs. The calculator document and every asset it requests remain unchanged.

TinyPNG changes pixels. Side-by-side review of all 14 outputs at the existing displayed widths found no visible degradation; this is not a lossless or pixel-identity claim. Formats, dimensions and PNG palette modes remain unchanged. Existing palette compression limits the large PNG savings to roughly 1%. No second passes, resizing or format conversion ran. Monthly Tinify count after the pass: 30/500. No API credential is stored in the repository or evidence.

## Files and byte savings

Originals and outputs below are under `public/img/`. Outputs use the same stem plus `-tinypng`; a dash means the original remains selected.

| Original | Input bytes | Output bytes | Saved | Selected output |
| --- | ---: | ---: | ---: | --- |
| archer-the-golden-zone.jpg | 75,637 | 75,637 | 0.0% | - |
| australian-health-star-has-to-go.jpg | 59,888 | 49,187 | 17.87% | australian-health-star-has-to-go-tinypng.jpg |
| best-protein-powder-muscle-gain.jpg | 86,890 | 75,628 | 12.96% | best-protein-powder-muscle-gain-tinypng.jpg |
| breakup-energy.png | 518,203 | 513,582 | 0.89% | breakup-energy-tinypng.png |
| calorie-calculator.jpg | 42,404 | 42,225 | 0.42% | calorie-calculator-tinypng.jpg |
| change.png | 735,022 | 727,710 | 0.99% | change-tinypng.png |
| fitness-books-worth-reading.png | 166,689 | 165,204 | 0.89% | fitness-books-worth-reading-tinypng.png |
| idols.png | 220,220 | 217,268 | 1.34% | idols-tinypng.png |
| leangains-calculator.jpg | 116,209 | 116,209 | 0.0% | - |
| lose-fat-gain-mucle-beginner.png | 737,663 | 729,511 | 1.11% | lose-fat-gain-mucle-beginner-tinypng.png |
| muscle-building-supplement-stack.png | 33,887 | 29,732 | 12.26% | muscle-building-supplement-stack-tinypng.png |
| naturally-flavoured.jpg | 60,160 | 58,127 | 3.38% | naturally-flavoured-tinypng.jpg |
| no-breakfast.jpg | 47,731 | 41,424 | 13.21% | no-breakfast-tinypng.jpg |
| normal.png | 9,606 | 8,583 | 10.65% | normal-tinypng.png |
| reject-modernity-embrace-masculinity.png | 91,925 | 90,535 | 1.51% | reject-modernity-embrace-masculinity-tinypng.png |
| weak.png | 616,059 | 607,248 | 1.43% | weak-tinypng.png |

## Native lazy loading

Before and after retain one eager/high-priority homepage illustration and 14 lazy illustrations. The calculator guide remains lazy. A phone browser requested seven article images initially in the baseline; eight distant images were still deferred. Scrolling to the last card loaded it successfully in the candidate. Browsers fetch nearby lazy images before scrolling, so lazy does not mean every below-screen image waits. The before/after loaded-count snapshots were taken at different completion times and are not a timing comparison.

## Repeated local measurements

Command: `/Users/sacino/.nvm/versions/node/v22.23.4/bin/node /Users/sacino/.agents/skills/lighthouse-test/scripts/run-lighthouse.mjs` with four `--url` values (ports 8798 and 8799, home and calculator), `--runs 3 --slow-runtime-runs 3 --lock-file /tmp/codex-lighthouse-host.lock`, and blocked patterns `*api.getresponse.com*`, `*challenges.cloudflare.com*`. Output: the raw directory below plus `/lighthouse`. Both builds were frozen before the batch, with full SHA-256 manifests and served document checks.

Node 22.23.4, pnpm 11.24.0, Astro 7.2.9, Lighthouse 13.4.1, Chrome 156.0.8078.48. Headless isolated Chrome launch verified. One CPU calibration (benchmark 3091.5) selected 10.7x for all mobile profiles. One batch alternated builds; lock wait 1 ms. All 37 reports validate: 1 calibration, 24 simulated scoring, 12 DevTools-throttled diagnostics. Every requested category is numeric; no runtime error, failed first-party document/style/script or audit warning.

Host benchmark drift reaches 24.9%; one-minute load rose from 6.29 near the start to 25.04 after the batch. No task-owned build, browser interaction or suite ran during the measurements. Timings are descriptive, not proof of a gain. No rerun for a better score. An unchanged calculator is a useful control for this environment variation.

| Build/page/profile | Score mean / median / range | LCP mean / median / range (ms) | All three scores |
| --- | --- | --- | --- |
| Original / home / mobile simulate | 78.00 / 76 / 75-83 | 6825.71 / 7661.84 / 4592.96-8222.31 | 76, 83, 75 |
| Original / home / desktop simulate | 96.00 / 100 / 88-100 | 1301.53 / 820.41 / 788.63-2295.55 | 88, 100, 100 |
| TinyPNG / home / mobile simulate | 82.00 / 84 / 75-87 | 7102.58 / 4586.40 / 3953.47-12767.87 | 75, 84, 87 |
| TinyPNG / home / desktop simulate | 97.67 / 99 / 95-99 | 1088.02 / 892.03 / 886.52-1485.50 | 95, 99, 99 |
| Original / calculator / mobile simulate | 98.33 / 98 / 98-99 | 2118.64 / 2194.15 / 1889.32-2272.45 | 98, 99, 98 |
| Original / calculator / desktop simulate | 99.67 / 100 / 99-100 | 619.02 / 624.10 / 592.11-640.85 | 99, 100, 100 |
| TinyPNG / calculator / mobile simulate | 98.67 / 98 / 98-100 | 2011.44 / 2199.79 / 1493.75-2340.79 | 98, 98, 100 |
| TinyPNG / calculator / desktop simulate | 99.00 / 99 / 99-99 | 533.48 / 549.76 / 474.83-575.86 | 99, 99, 99 |
| Original / home / mobile devtools | 69.00 / 69 / 69-69 | 11519.45 / 11519.97 / 11517.53-11520.84 | 69, 69, 69 |
| TinyPNG / home / mobile devtools | 69.00 / 69 / 69-69 | 11241.90 / 11273.80 / 11160.60-11291.30 | 69, 69, 69 |
| Original / calculator / mobile devtools | 83.33 / 86 / 76-88 | 1858.57 / 1874.16 / 1817.33-1884.22 | 76, 86, 88 |
| TinyPNG / calculator / mobile devtools | 88.33 / 88 / 88-89 | 1808.59 / 1808.55 / 1798.91-1818.29 | 88, 89, 88 |

Under actual mobile throttling, home LCP averages 11,519.45 to 11,241.90 ms (277.54 ms earlier); medians are 11,519.97 and 11,273.80 ms. The ranges do not overlap. All six runs make 17 image requests; image bytes fall from 3,306,879 to 3,255,716, a deterministic 51,163-byte reduction among images fetched during the audit. Lead image completion averages 11,504.68 to 11,228.00 ms, while discovery and post-download paint delay are similar. This is consistent with lower competition for throttled bandwidth, but host drift prevents a precise causal timing claim.

Home simulated score means rise 78 to 82, but mean simulated LCP moves 6,825.71 to 7,102.58 ms because the candidate includes a 12,767.87 ms run. Retain it. Median simulated LCP moves 7,661.84 to 4,586.40 ms. Scores are nonlinear; mean scores cannot stand in for mean timings.

Home actual TBT means are 43.24 and 45.05 ms, with overlapping ranges. Calculator actual LCP means are 1,858.57 and 1,808.59 ms; actual TBT means are 642.76 and 417.75 ms, including one original 997.39 ms TBT run. Its HTML and requested bytes did not change, so these are not image-compression gains. Main-thread work, script execution, unused JavaScript, long tasks and total task time were reviewed in the summary and raw reports; no JavaScript change is attributed to this pass.

## Hosted checks

One fresh Ego/PageSpeed analysis per page and build, each producing mobile and desktop reports: four analyses, eight reports. Baseline inactive version `f2944b9d-20bb-4c22-9b27-cc52c7beb99d`; candidate inactive version `5ef3fa2d-5cf4-4144-84cf-2bb2d17cbbe5` on `musclehacking-astro-preview`, account `213ab3604485056376263d22fa242742`. Candidate tag `tinypng-c1b910eb`. Candidate home/calculator HTML and both largest compressed PNGs match the frozen candidate hashes.

| Stage/page/device | Score | FCP / LCP / SI (ms) | Observed LCP (ms) | CPU benchmark | Report |
| --- | ---: | --- | ---: | ---: | --- |
| before / home / mobile | 90 | 1051 / 3601 / 1505 | 742 | 905 | [PageSpeed](https://pagespeed.web.dev/analysis/https-f2944b9d-musclehacking-astro-preview-webpop-workers-dev/cdovsvqkq9?form_factor=mobile) |
| before / home / desktop | 100 | 281 / 681 / 667 | 854 | 625.5 | [PageSpeed](https://pagespeed.web.dev/analysis/https-f2944b9d-musclehacking-astro-preview-webpop-workers-dev/cdovsvqkq9?form_factor=mobile) |
| before / calculator / mobile | 96 | 1726 / 1961 / 4009 | 2301 | 482.5 | [PageSpeed](https://pagespeed.web.dev/analysis/https-f2944b9d-musclehacking-astro-preview-webpop-workers-dev-calorie-calculator/25fa0i8nnl?form_factor=mobile) |
| before / calculator / desktop | 99 | 368 / 421 / 454 | 399 | 489.5 | [PageSpeed](https://pagespeed.web.dev/analysis/https-f2944b9d-musclehacking-astro-preview-webpop-workers-dev-calorie-calculator/25fa0i8nnl?form_factor=mobile) |
| after / home / mobile | 76 | 1351 / 7501 / 2464 | 1353 | 689 | [PageSpeed](https://pagespeed.web.dev/analysis/https-5ef3fa2d-musclehacking-astro-preview-webpop-workers-dev/uhxg6ckyjq?form_factor=mobile) |
| after / home / desktop | 100 | 281 / 721 / 516 | 722 | 367.5 | [PageSpeed](https://pagespeed.web.dev/analysis/https-5ef3fa2d-musclehacking-astro-preview-webpop-workers-dev/uhxg6ckyjq?form_factor=mobile) |
| after / calculator / mobile | 100 | 1066 / 1354 / 1066 | 219 | 498 | [PageSpeed](https://pagespeed.web.dev/analysis/https-5ef3fa2d-musclehacking-astro-preview-webpop-workers-dev-calorie-calculator/4zvln0eww2?form_factor=mobile) |
| after / calculator / desktop | 99 | 299 / 421 / 450 | 510 | 672.5 | [PageSpeed](https://pagespeed.web.dev/analysis/https-5ef3fa2d-musclehacking-astro-preview-webpop-workers-dev-calorie-calculator/4zvln0eww2?form_factor=mobile) |

All hosted reports have fresh timestamps, the intended final URL/device, numeric categories, no runtime error or failed first-party blocking resource. Google uses Lighthouse 13.5.0 and Chrome 153.0.8010.36; mobile simulated CPU is 1.2x, desktop 1x. Do not pool these with local results. All hosted TBT values are zero. Preview noindex policy explains SEO 69. Detailed CLS, environment, script URLs and diagnostics remain in the raw LHRs.

Mobile home image bytes decrease from 3,366,767 to 3,304,903 while its score drops 90 to 76. Google benchmark changes 905 to 689. The unchanged calculator moves 96 to 100. Desktop remains 100 for home and 99 for calculator. These single hosted runs do not establish a performance gain or regression caused by compression.

The same immutable baseline also scored 74 earlier in `documents/evidence/performance-regressions/acceptance.md`, versus 90 in this fresh run, with identical HTML and image bytes. Its observed LCP changes from 2,307 to 742 ms. The earlier score regression is still not attributed to a specific source change; neither image size nor a newly higher score alone resolves it. No full simulator replay or controlled Google host comparison is available.

Existing approval covers uploading later verified fixes to this isolated preview Worker. Upload used the generated `dist/server/wrangler.json`, without promotion. Review active version remains `df904b43-5cbd-4978-9b57-3020d20f9784` at 100%; production Worker deployment list remains empty. API before/after readbacks match. No Git push, production deployment, DNS change or newsletter mutation ran.

## Acceptance and verification limits

- `pnpm check`: 0 errors, 0 warnings, 6 existing hints. `pnpm test`: 183 passed. `pnpm build` and `pnpm verify:dist`: passed, 20 documents.
- `scripts/run-e2e-local.sh --workers=3`: 373 passed, 25 intentional skips; wrapper exited 0. Output used the raw task directory, not tracked files.
- Candidate `pnpm test:agent-a11y` against an owned held preview: 31 passed. The first attempt hit an already closed port and failed 31 connection attempts before scanning the site. This is stale server state, not an app failure; the corrected run uses a wrapper held until explicit release. No assertions or app code were weakened.
- Temporary Playwright acceptance checked all 20 documents at 390, 768 and 1440 px: 60 matching heading/font/colour/alignment and image-geometry comparisons; calculator age 46 produces BMR 1700, TDEE 2040, calories 1632 and macros 176/52/116 before and after. GIF first frames and video fixtures are deterministic only in the capture context.
- All 14 original/compressed image pairs were visually inspected. Matching 390px homepage captures and live preview home/calculator checks pass. Early Ego captures labelled mobile unexpectedly reverted to desktop across CDP sessions; their filenames are not evidence of mobile parity. Corrected `mobile-390-before.png` and `mobile-390-after.png` explicitly verify `innerWidth === 390`.
- Two frozen-preview wrappers exit 1 after successful tests because the existing cleanup races an exiting child process. Owned process identities are dead, ports 8787/8798/8799 are closed, and stale task-owned leases were verified and Trashed. The recovered wrapper exits 0. This unrelated lifecycle defect was not changed.
- Ego TaskSpace 34 finished once with no kept pages.
- Excluded edge cases: alternate browser-engine decoding, animated-image compression, resizing and format conversion. Existing dimensions/formats and animation files are unchanged.

## Replay and evidence

Raw output directory: `/var/folders/9b/g71l2g096pgbqvh_9222rsq00000gn/T/musclehacking-tiny.5sqhfc8z`. Preserve until acceptance. Inputs/results and full paths: `inputs.json`, `compression-results.json`. Pixel comparisons and source hashes: `quality.json` and `quality-sheet-*.png`. Frozen builds/manifests: `before/`, `after/`, `before-manifest.json`, `after-manifest.json`, `frozen-verification.json`.

Local results: `lighthouse/summary.md`, `lighthouse/summary.json`, `lighthouse/three-run-statistics.json`, all 37 LHRs, `mobile-image-waterfall.json`, `chrome-launch-check.txt`. `summarise.py` validates reports and computes means/medians/ranges. Hosted results: `hosted-comparison.json`, eight `live-*.lhr.json`, four report packets, hosted identity packets, `preview-upload.log`, deployment readbacks and UI captures.

Rendering and failure evidence: `html-parity.json`, `render-browser-parity.json`, 120 `render-*.png`, `lazy-loading.json`, `full-suite-output/`, `a11y-output/` (failed closed-port attempt), `a11y-recovered-output/` (accepted run), `cleanup.json` and lease audit packets.

Replay the frozen comparison through the project lifecycle wrapper, with the recorded `frozen.config.mts`/`recovery.config.mts` and separate release files. Use the same four local URLs, one fresh Lighthouse output directory, three runs and the shared lock. For exact profile replay use `--cpu-profile custom --cpu-slowdown-multiplier 10.7 --baseline-benchmark-index 3091.5`; retain the drift warning rather than rerunning for scores. Re-run `python3 <raw>/summarise.py` after a complete batch.

Do not repeat Tinify uploads for replay. Existing output files intentionally make the skill refuse overwriting; use the saved input/output hashes and outputs. Future deliberate compression uses the TinyPNG skill and a new destination, one pass, followed by visual review.
