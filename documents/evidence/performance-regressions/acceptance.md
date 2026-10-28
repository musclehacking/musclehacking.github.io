# Homepage and calculator performance regression investigation

Date: 28 October 2026. This record supersedes the performance conclusions based on single runs in `documents/evidence/astro-optimisations/acceptance.md`; it does not replace that record's functional evidence.

## Result and adopted correction

The original homepage 88-to-76 loss comes almost entirely from Lighthouse's **simulated** Largest Contentful Paint (LCP), the predicted time when the largest visible element appears. Its single-run estimate rises from 3.873 to 7.813 seconds. Repeated, paired original/current builds do not reproduce a comparable overall loading regression. However, two isolated, three-run comparisons identify a smaller actual cost from inlining the small homepage stylesheet. Removing that inlining improves the actual-throttled homepage LCP mean by 642.5 ms, then 382.2 ms after swapping ports. Both control comparisons have non-overlapping LCP ranges.

The adopted local correction restores `build.inlineStylesheets: 'never'` in `astro.config.mjs`, keeping the explicit 4096-byte asset limit, shared project entry, script hashes, image bytes, fonts, static rendering, content and interactions. This restores the former stylesheet delivery policy without undoing the other optimisations. It adds one stylesheet request on home/calculator and two on an article using both small sheets. Every document retains identical CSS bytes in the same cascade order.

A final comparison of the **compiled correction** with the current build finds a 347.8 ms earlier homepage LCP mean, but only a 31.8 ms earlier median, with overlapping ranges. The earlier isolated controls are stronger evidence of the delivery cost. The compiled correction's simulated mobile homepage mean falls 83.00 to 79.33, and desktop 98.00 to 93.67; a higher score is not the adoption criterion. Actual homepage first paint and blocking-time means also improve. The final calculator sample is variable: LCP mean rises 1746.0 to 1822.1 ms, and blocking time 342.8 to 395.7 ms, while their ranges overlap; its blocking-time median changes only 315.3 to 320.2 ms. Earlier corrected CSS controls move those calculator means in the opposite direction. No repeatable calculator regression or gain is established.

The correction is committed as `afced65`. The user's other chat pushed the earlier optimisation, including `f13295e`, and provided the hosted current-build measurements below. That push predates this correction. The user subsequently authorises uploading the tested correction as an **inactive version** of the existing review Worker and one live Ego/PageSpeed analysis per page. Version `f2944b9d-20bb-4c22-9b27-cc52c7beb99d` now serves the verified correction. Both Workers' active deployment lists remain identical before and after upload. This task performs no Git push, active-version promotion, DNS change, newsletter submission or production mutation.

## Frozen sources and setup

- Original application: `b0ef37717a7dcde41d63003c3ccbee1a9664c25f`, retained before the original optimisation in `/tmp/musclehacking-astro-optimisations.uv5mzY/baseline-dist/client`.
- Current application: `f13295ec678a81a8a7719544ede1059508b07c23`, retained in the prior task's `accepted-frozen` output. The subsequent commits through `34d8098` change documentation, not application assets.
- Correction: `afced6500255548c5b87f2daa37e6a1f54933c17`, based on `34d8098`, with the stylesheet setting and comments changed. The exact measured configuration and patch are retained as `fixed-source-config.mjs` and `fixed-source-config.patch` under the raw directory. The later evidence-only commit changes no measured application code.
- Raw directory: `/tmp/musclehacking-performance-investigation.tgi8MA`. All Lighthouse reports, screenshots, fixtures, logs and manifests stay outside Git. Preserve them until the user accepts the result.
- Node 22.23.4, pnpm 11.24.0, Astro 7.2.9, Lighthouse 13.4.1 and installed Chrome 156.0.8078.48. Fresh, headless Chrome profiles; default storage reset and network/device presets.
- Three scoring runs per URL and device, and three additional mobile DevTools-throttled runs. Report arithmetic means, retain individual values, medians and ranges. Never recompute a score from averaged metrics or pool the two methods.
- The first paired batch calibrates once: benchmark index 3085 selects 10.7x mobile CPU slowdown. Later batches reuse that multiplier and explicitly declare the baseline benchmark. Desktop retains its standard preset.
- All four batches share `/tmp/codex-lighthouse-host.lock`, each waits 1 ms. Both builds run in the same batch with rotated order. No local build, other test suite or browser operation is started by this task during a Lighthouse batch. The other chat performs hosted browser checks during part of the first comparison; that possible contention is disclosed.
- Blocked patterns: `*api.getresponse.com*` and `*challenges.cloudflare.com*`. Those providers are not normally requested by these initial document GETs. No production form mutation is used.
- On-disk SHA-256 manifests and served HTML/CSS/JavaScript checks establish build identity. Initial lifecycle checks verify document hashes. Control batches verify manifests and assets before/after; final compiled comparison verifies 137 current and 139 corrected frozen files, plus 10/12 served HTML/CSS/JS resources respectively, before and after.
- The 37-report original/current batch includes one calibration and 36 scored/diagnostic reports. Controls have 42 reports, CSS replication 24, compiled correction 36. All 138 scored/diagnostic reports parse, have numeric requested categories, no `runtimeError`, no Lighthouse warnings, and no failed critical resource. The separate calibration is retained, bringing the local report total to 139.

| Batch | Observed CPU benchmark range | Maximum drift from 3085 | Host load before / after (1, 5, 15 minute) |
| --- | ---: | ---: | --- |
| Original/current | 3054-3114 | 1.00% | 18.55, 17.58, 16.36 / 24.79, 23.57, 20.48 |
| Controls | 2946-3150 | 4.51% | 14.43, 17.51, 18.64 / 17.90, 22.99, 21.33 |
| Port-swapped CSS | 3047-3135.5 | 1.64% | 13.15, 16.12, 18.12 / 17.55, 17.16, 18.01 |
| Compiled correction | 3036-3139.5 | 1.77% | 19.91, 23.18, 20.31 / 42.16, 36.97, 29.28 |

The final host is busier and its calculator results spread more widely. Low benchmark drift does not prove a quiet host. These remain small lab samples, not real-device or field measurements.

## Why the original scores changed

Historical reports are `baseline-lighthouse/*mobile-run-01.lhr.json` and `accepted-lighthouse/*mobile-run-01.lhr.json` in the prior raw directory.

| Metric | Homepage before / current | Calculator before / current | Weighted consequence |
| --- | --- | --- | --- |
| Simulated LCP | 3872.858 / 7812.643 ms; component score 0.53 / 0.03 | 1754.024 / 2641.794 ms; component score 0.99 / 0.87 | LCP has 25% weight: home loses 12.5 points; calculator loses 3.0 |
| Layout shift component | 1.00 / 0.99 | 0.99 / 1.00 | Home loses 0.25 points; calculator gains 0.25 |
| First paint, blocking time, speed-index components | Unchanged | Unchanged | No score loss from these components |
| Rounded performance score | 88 / 76 | 99 / 97 | The rounded score masks the contributing weights |

### Homepage: an image crosses the simulator's paint boundary

The actual LCP element in every relevant run is the lead `Breakup Energy` image. Its 518,203 bytes, eager loading and high priority are unchanged. The following card image remains 737,663 bytes with authored `fetchpriority=auto`; Chrome upgrades its actual request priority to High.

| Historical capture | Observed unthrottled LCP | Lead image finishes | Following 738 KB image finishes | Simulated LCP |
| --- | ---: | ---: | ---: | ---: |
| Original | about 109 ms | 51.107 ms | 109.739 ms, just after paint | 3872.858 ms |
| Current | about 55 ms | 22.439 ms | 47.842 ms, before paint | 7812.643 ms |

The current build paints earlier on the fast local capture, yet more image work completes before that paint. Lighthouse's Lantern model constructs its simulated LCP dependency graph using the observed paint as a cutoff. It excludes requests ending after that cutoff and includes non-low-priority images that finish before it. The extra large image can therefore change the phone estimate despite not being the actual LCP element.

This boundary pattern repeats within the unchanged current build: its 88-point run observes LCP around 80 ms with the next image ending at 95.289 ms; its 76/75-point runs finish that image around 58.659/69.868 ms before their 60/79 ms LCP markers. The initial three current scores are 76, 88 and 75. The original scores are 75, 76 and 75. A single 88-to-76 comparison is not a reliable estimate of the change's visitor cost.

Primary implementation inspected: Lighthouse 13.4.1's installed `@paulirish/trace_engine/models/trace/lantern/metrics/FirstContentfulPaint.js` (`getFirstPaintBasedGraph`) and `LargestContentfulPaint.js` (`getOptimisticGraph`, `isNotLowPriorityImageNode`, `getEstimateFromSimulation`), under `/Users/sacino/.npm/_npx/5390d7d89c0de19d/node_modules/`. Source and request timings support this mechanism. The exact simulator graphs are not replayed from retained trace artifacts, so this is not a proof assigning every millisecond of the old estimate to one request.

### Calculator: unchanged server-rendered heading, variable simulated dependency work

The calculator's LCP element is its server-rendered `#calculator-heading`, which is present before React runs. Its 184,100-byte React client asset is identical. In the old original capture it finishes at 71.457 ms, after the approximately 67 ms observed LCP; in the current capture it finishes at 53.974 ms, before the approximately 77 ms marker. Font requests also cross that boundary. These timing changes can alter which work the model considers, but they do not mean React is required to render the heading. Without a full simulator replay, the exact attribution is unresolved. Repeated original/current actual-throttling paint ranges overlap, as do blocking-time ranges.

## Paired original/current results

Ports: original 8791, current 8792. Each row contains exactly three runs. `simulate` is the scoring profile; `devtools` really throttles the browser and is diagnostic. Their scores are not interchangeable.

| URL | Device / method | Score mean | FCP mean ms | LCP mean ms (range) | TBT mean ms | CLS mean |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 8791/ | mobile / simulate | 75.33 | 917.6 | 9517.6 (7743.0-12619.7) | 0.0 | 0.0521 |
| 8792/ | mobile / simulate | 79.67 | 926.2 | 6851.2 (3863.5-8948.7) | 0.0 | 0.0473 |
| 8791/calorie-calculator/ | mobile / simulate | 97.00 | 1370.1 | 2375.1 (2196.7-2648.7) | 0.0 | 0.0132 |
| 8792/calorie-calculator/ | mobile / simulate | 98.00 | 1267.3 | 2294.6 (2199.5-2413.6) | 0.0 | 0.0132 |
| 8791/ | desktop / simulate | 94.67 | 291.9 | 1494.4 (876.0-2243.0) | 0.0 | 0.0287 |
| 8792/ | desktop / simulate | 96.33 | 258.6 | 1277.4 (786.7-2254.9) | 0.0 | 0.0286 |
| 8791/calorie-calculator/ | desktop / simulate | 99.33 | 336.3 | 577.4 (474.4-639.4) | 0.0 | 0.0451 |
| 8792/calorie-calculator/ | desktop / simulate | 99.67 | 344.0 | 621.4 (618.2-626.0) | 0.0 | 0.0232 |
| 8791/ | mobile / devtools | 69.00 | 1747.7 | 11781.3 (11671.7-11844.3) | 29.4 | 0.0376 |
| 8792/ | mobile / devtools | 69.00 | 1747.3 | 11813.0 (11631.3-12086.9) | 26.5 | 0.0376 |
| 8791/calorie-calculator/ | mobile / devtools | 93.00 | 1605.5 | 1779.4 (1726.5-1821.1) | 276.0 | 0.0395 |
| 8792/calorie-calculator/ | mobile / devtools | 92.00 | 1607.5 | 1816.0 (1768.2-1841.5) | 304.8 | 0.0395 |

The original/current actual homepage LCP differs by only 31.7 ms in its mean, with overlapping ranges. Calculator differs by 36.6 ms, also with overlapping ranges. This does not reproduce the original single-run 3.94-second simulated homepage change. It also does not establish a general performance gain from the complete optimisation.

## One-change controls and limits

`prepare-controls.mjs`, the manifests and `control-definitions.json` preserve the exact transformations. All controls retain the current assets and HTML except the named delivery change. Browser preflight confirms calculator age 25, visible results, expected heading/font and working interactions.

1. **Restore former project module tags** (8793). Replaces the shared entry's tag with the original project module tags and copies their dependencies, adding necessary CSP hashes. It retains the current island/runtime. This is a reconstructed delivery-group control, not a full source rebuild; the calculator may download an old helper beside the current island's shared helper. Its actual homepage LCP mean is 12153.3 ms versus current 11924.2, and calculator 1791.9 versus 1781.7, with calculator ranges overlapping. It does not recover a consistent large slowdown caused by consolidation. Do not credit an exact intrinsic gain to the hybrid control.
2. **Externalise small styles** (8794). The homepage changes only its 1857-byte inline head style into a fingerprinted external file at the same location. Actual homepage LCP improves 11924.2 to 11281.7 ms, with non-overlapping ranges; simulated score stays 75. The first calculator version mistakenly externalises Astro's mandatory body `display:contents` island style as well as the small head stylesheet. Its two calculator groups are retained in the raw reports but excluded from causal conclusions.
3. **Lower priority on non-leading listing images** (8795). Changes only 14 authored priority attributes from auto to low; the lead remains high. The simulated homepage LCP mean falls 12790.1 to 6538.7 ms, but actual LCP changes only 11924.2 to 11825.6 with overlapping ranges. Rejected: no established actual loading win. No image-priority change ships.
4. **Port-swapped replication and corrected calculator CSS**. Current moves to 8794; external homepage CSS moves to 8792. Corrected calculator control on 8796 externalises only the head style and preserves its entire body byte for byte, including Astro's mandatory wrapper style. Actual homepage LCP improves 11980.1 to 11597.9 ms, again with non-overlapping ranges: the effect follows CSS delivery, not the port. Calculator changes 1723.6 to 1643.4 ms with overlapping ranges. Its heading and results still work; no calculator gain is established.

The homepage's swapped-port breakdown puts almost all of the 382 ms improvement in image download duration: 11348.9 to 10965.7 ms. Image discovery/load delay is essentially unchanged (614.2 versus 613.8 ms), as is the post-download render delay (11.7 versus 13.7 ms). The measured effect is in network completion under contention, not a large reduction in layout work. The precise browser scheduling cause is not isolated by these reports.

Deterministic changes from the original optimisation also matter: home previously had 1627 raw bytes of inline project modules; current uses a 29,631-byte shared entry (9789 gzip) and a 3971-byte imported helper, 33,602 raw external bytes in total. Its dependency wave count grows. This payload increase is disclosed, not called a homepage saving. The helper/route-specific code is below the speed philosophy's useful split size, and no reliable actual script-driven regression is established. The shared entry stays. Images and fonts are unchanged; mobile home transfers roughly 3.5 MB in both original/current builds. Earlier lossless/WebP trials did not reduce the lead image while preserving output, so no replacement asset ships. Lower-quality/size image changes remain a separate visual trade-off without a measured gain in this investigation.

Full control summaries, including excluded groups: `change-controls/three-run-statistics.json` and `css-replication/three-run-statistics.json` under the raw directory.

## Compiled correction: final acceptance comparison

Ports: current 8792, compiled correction 8797. The candidate is a normal `pnpm build`, not rewritten HTML. It restores the same CSS delivery mechanism exercised by the controls. Both manifests and served assets match before and after this batch.

| URL | Device / method | Score mean | FCP mean ms | LCP mean ms (range) | TBT mean ms | CLS mean |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 8792/ | mobile / simulate | 83.00 | 919.1 | 4894.1 (3847.8-6390.6) | 0.0 | 0.0521 |
| 8797/ | mobile / simulate | 79.33 | 1063.5 | 8640.5 (3912.1-13518.0) | 0.0 | 0.0521 |
| 8792/calorie-calculator/ | mobile / simulate | 97.33 | 1590.2 | 2242.7 (2112.1-2343.2) | 0.0 | 0.0395 |
| 8797/calorie-calculator/ | mobile / simulate | 98.00 | 1319.3 | 2250.1 (2201.4-2276.5) | 0.0 | 0.0395 |
| 8792/ | desktop / simulate | 98.00 | 266.3 | 1066.1 (800.3-1493.0) | 0.0 | 0.0284 |
| 8797/ | desktop / simulate | 93.67 | 257.0 | 1652.1 (1382.5-2086.5) | 0.0 | 0.0286 |
| 8792/calorie-calculator/ | desktop / simulate | 99.67 | 331.8 | 595.7 (556.2-619.6) | 0.0 | 0.0232 |
| 8797/calorie-calculator/ | desktop / simulate | 99.33 | 429.5 | 538.8 (469.6-622.2) | 0.0 | 0.0451 |
| 8792/ | mobile / devtools | 69.00 | 1793.3 | 11659.4 (11593.5-11788.5) | 33.5 | 0.0376 |
| 8797/ | mobile / devtools | 69.00 | 1747.7 | 11311.6 (10713.7-11656.7) | 29.9 | 0.0376 |
| 8792/calorie-calculator/ | mobile / devtools | 91.00 | 1633.5 | 1746.0 (1634.2-1935.4) | 342.8 | 0.0395 |
| 8797/calorie-calculator/ | mobile / devtools | 89.33 | 1631.4 | 1822.1 (1567.0-2077.0) | 395.7 | 0.0395 |

The correction does not restore a guaranteed 88-point score. It retains the smaller actual homepage loading improvement despite a lower simulated estimate in this batch. The final median and range qualify the mean; do not present 348 ms as a guaranteed per-visit saving. Calculator's final actual-throttling scores are descriptive only (91.0 versus 89.33, including one 81-point candidate run). That candidate run has 676.2 ms blocking time versus its other two 190.6/320.2 ms runs. Its CPU benchmark remains near the other runs, so benchmark drift alone does not explain all scheduling variance. No outlier is discarded, and no extra run is added to improve the result.

## Live checks through Ego Lite

The user asks for one live analysis per page/build, not a three-run hosted average. Each PageSpeed analysis automatically yields mobile and desktop results. Ego task space 30 handles the original comparison and is finished with no pages kept. After the user approves the correction's inactive preview upload, task space 33 handles its two additional analyses and is also finished with no pages kept. No analysis is repeated for a higher score.

The **Astro before** is the existing review Worker at `musclehacking-astro-preview.webpop.workers.dev`, version `df904b43`, application revision `13743d0`. Its application/build/dependency diff against the original frozen source is empty; HTML matches except generated island UIDs, and directly loaded assets match hashes (`live-astro-baseline-identity.json`).

The **Astro current** comes from the other chat's pushed `fecebf8d414eb427d26168cc4f94b05cde38b674`, which includes `f13295e`. Its successful Cloudflare build provides inactive version `18ac682d-0224-4639-aad4-013fc344f67f`. The immutable `18ac682d-musclehacking-astro.jake-sacino.workers.dev` HTML and directly loaded CSS/JS match the frozen current build before testing (`live-after-identity.json`). No version is promoted by this task.

The **Astro correction** is uploaded at 14:35 AWST on 28 October 2026 to account `213ab3604485056376263d22fa242742`, Worker `musclehacking-astro-preview`, with version tag `afced65`. Its immutable URL is `https://f2944b9d-musclehacking-astro-preview.webpop.workers.dev`. All 139 existing `dist/client` files match the frozen tested manifest before upload. Both hosted pages subsequently match the tested HTML byte for byte, along with all nine requested CSS/JS resource checks (three on home, six on calculator). Stylesheets retain immutable caching and responses retain CSP. Cloudflare version metadata confirms the tag and non-promoting upload. The existing review deployment remains `df904b43-5cbd-4978-9b57-3020d20f9784` at 100%; the target production Worker's active deployment list remains empty. The before/after API records and `approved-preview-identity.json` retain that proof.

| Page / profile | Astro before | Astro optimised | Astro corrected | Hosted CPU benchmark before / optimised / corrected |
| --- | ---: | ---: | ---: | --- |
| Home mobile | 88 | 74 | 74 | 1069.5 / 558.5 / 634 |
| Home desktop | 100 | 100 | 100 | 887.5 / 1084 / 596 |
| Calculator mobile | 97 | 96 | 96 | 506 / 415 / 472 |
| Calculator desktop | 99 | 99 | 99 | 685.5 / 683 / 469 |

- [Home before](https://pagespeed.web.dev/analysis/https-musclehacking-astro-preview-webpop-workers-dev/ohk9tv2zx3?form_factor=mobile)
- [Calculator before](https://pagespeed.web.dev/analysis/https-musclehacking-astro-preview-webpop-workers-dev-calorie-calculator/guf8k9s09g?form_factor=mobile)
- [Home current](https://pagespeed.web.dev/analysis/https-18ac682d-musclehacking-astro-jake-sacino-workers-dev/9vv4k3bnuj?form_factor=mobile)
- [Calculator current](https://pagespeed.web.dev/analysis/https-18ac682d-musclehacking-astro-jake-sacino-workers-dev-calorie-calculator/utctr2o86c?form_factor=mobile)
- [Home corrected](https://pagespeed.web.dev/analysis/https-f2944b9d-musclehacking-astro-preview-webpop-workers-dev/n9fz97rrfb?form_factor=mobile)
- [Calculator corrected](https://pagespeed.web.dev/analysis/https-f2944b9d-musclehacking-astro-preview-webpop-workers-dev-calorie-calculator/tprqa0axq2?form_factor=mobile)

Home mobile FCP/LCP is 1201/3901 ms before, 1351/7576 optimised, and 1351/7576 corrected. Calculator is 1651/1951, 1726/2026 and 1726/1959 respectively. The correction therefore leaves both hosted scores unchanged. Its calculator LCP estimate is 67 ms earlier, while homepage Speed Index worsens from 3728.4 to 4110.1 ms and layout shift rises from 0 to 0.0304. Blocking time remains 0 on all four corrected reports. The corrected homepage's observed unthrottled LCP is 2307 ms versus 2259 previously; calculator is 2318 versus 2329. These observations do not establish a hosted speed gain, and the worse homepage Speed Index is retained rather than omitted.

Google uses Lighthouse 13.5.0, Chrome 153.0.8010.36 and simulated CPU multiplier 1.2 in these reports, not the local Chrome 156 / Lighthouse 13.4.1 / 10.7x profile. Its home mobile CPU benchmark is about 48% lower in the optimised check than the original, and about 41% lower in the correction check than the original. Between optimised/corrected, the mobile benchmarks rise by about 14%, while desktop benchmarks fall substantially. These are single hosted samples on different origins/accounts/machines, so neither the old home loss nor the correction's small timing changes can be assigned to code alone. The paired local controls remain the basis for retaining the correction; the hosted result confirms delivery and an unchanged score, not a measured hosted improvement.

All four corrected reports have fresh, unique timestamps, the intended requested/final URL, the correct device, numeric categories, no runtime errors/warnings and no failed critical resource. Home reports are fetched at 14:37:53/54 AWST; calculator at 14:40:31/32 AWST. Their network logs show the new external small stylesheet, proving the changed delivery was loaded. Corrected accessibility is 100 home / 99 calculator, best practices 96 mobile / 100 desktop, and SEO 69 because Cloudflare adds `x-robots-tag: noindex` to inactive version previews. This is not the application's indexing policy regressing. Raw packets, individual mobile/desktop LHRs, screenshots and environment/metric comparison are retained as `live-corrected-*` and `approved-hosted-comparison.json` under the raw directory.

The initial upload command explicitly selects the source `wrangler.jsonc` and fails locally on unresolved Astro virtual modules before uploading. The corrected command selects the already-tested `dist/server/wrangler.json`, whose entry is built `entry.mjs`, and succeeds without rebuilding or changing application code. Preserve `approved-preview-upload.log` and `approved-preview-upload-corrected.log`; no unsupported alias or tooling patch is introduced. Future explicit-config uploads must use Astro's generated build configuration, or the normal project command that follows `.wrangler/deploy/config.json` automatically.

The earlier `live-before-home.json` and `live-before-calculator.json` inspect the **legacy production** site: mobile/desktop 74/92 and 54/78 respectively. They are context only, excluded from the Astro before/current comparison.

## Functional verification and known tooling failures

- `pnpm check`: no errors/warnings, six existing hints. `pnpm test`: 183 pass. `pnpm build` and `pnpm verify:dist`: pass; 20 documents and expected routes/content/CSP/assets verify.
- `scripts/run-e2e-local.sh --workers=3`: 371 pass, 25 existing skips, two failures. Both failures are the former test requiring one stylesheet and at least one inline style. That explicitly contradicts the intended correction and is classified as test drift, not an app defect. The test now checks loaded homepage typography without JavaScript and uses the project's desktop/mobile contexts. Its focused final wrapper run passes both cases. No other assertion is weakened or removed. Raw full run is `fix-e2e.log`, final focused run `fix-typography-final.log`.
- `pnpm test:agent-a11y --workers=1` against this task's owned Wrangler during the functional run: all 31 pass (`fix-a11y.log`). No functional suite runs during Lighthouse.
- `compiled-css-parity.json`: all 20 documents retain identical concatenated CSS bytes in original cascade order, including the mandatory inline island style. Its first diagnostic compared stylesheet array boundaries and failed when two existing sheets became separate links; comparison was corrected to ordered CSS bytes, the actual invariant, with no style removed.
- `all-compiled-browser-parity.json` and `all-compiled-pixel-parity.json`: 20 documents x 390/768/1440 px, 60/60 full-page comparisons have zero RGB pixel changes. Computed heading font, weight, size, colour, alignment and geometry match. The age-46 calculator results match after an actual input change. Parent inspection covers side-by-side home/calculator, article, supplement and article-ending images. GIFs use the same first-frame fixture on both builds, and YouTube iframes the same local fixture; visible styling/content are compared independently of third-party/animation timing.
- Before the all-document run, 12 representative viewport pairs also match exactly (`compiled-pixel-parity.json`). Their browser check has no unexpected console errors. The full-document check explicitly expects the custom 404's single main-document error and no other console errors.
- Temporary visual-fixture setup failures are retained: an attempted cross-import of the project spec from a temporary CommonJS test fails on `import.meta`; the unsupported import is removed and the project test runs through its normal wrapper. The expanded fixture initially treats the expected custom-404 browser message as a failure, then mistakes the healthy-low-calorie-foods article for the calculator because it matches a substring. Those are fixture/test-selection errors on hash-verified builds, corrected to explicit 404 status handling and the exact calculator route. No application patch or Lighthouse rerun follows them. See `final-*-lifecycle.log`, `all-routes-fixed-lifecycle.log`, `all-document-parity-verified.log`, `all-document-wrong-route-error-context.md`, and the passing `all-document-parity-corrected.log`.
- Some completed wrappers return 1 during an existing cleanup race between process-existence/start-time reads; one already-exited descendant also prints a harmless `kill` warning. This is a lifecycle tooling limitation, not a failed application assertion. Known stale leases are recovered only after proving exact ownership, all leased processes gone and ports closed. Cleanup code is not changed to force a pass. `cleanup-verification.json` and `cleanup-final-verification.json` confirm all owned ports 8787 and 8791-8797 closed, with no remaining lifecycle lease. Ego's task space is closed. Repairing that existing process-check race is separate tooling work.
- Frozen-mode relative/missing directories are rejected before lock/listener creation. Normal build-first lifecycle also passes two focused checks (`default-lifecycle-check.log`). `bash -n scripts/run-e2e-local.sh` and `git diff --check` pass.

## Reproduce and inspect

Raw results and their generated summaries:

- `/tmp/musclehacking-performance-investigation.tgi8MA/paired-original-current/three-run-statistics.json`
- `/tmp/musclehacking-performance-investigation.tgi8MA/change-controls/three-run-statistics.json`
- `/tmp/musclehacking-performance-investigation.tgi8MA/css-replication/three-run-statistics.json`
- `/tmp/musclehacking-performance-investigation.tgi8MA/compiled-fix/three-run-statistics.json`

Each summary retains all three values, arithmetic mean, median, minimum and maximum for scores, first/main paint, speed index, blocking time, layout shift, interactivity, main-thread work, script execution, unused JavaScript, requests/bytes, task totals and long tasks. Raw LHRs and `run-config.json` retain further detail. The table below retains the main comparison's score and LCP spread in this committed record as well.

For a replay while the frozen evidence is retained, use two separate task-owned terminal sessions. Select Node 22.23.4; ensure the named ports are free and the release files do not already exist. Do not adopt another process. These commands serve public GETs only:

```bash
export PATH=/Users/sacino/.nvm/versions/node/v22.23.4/bin:$PATH
MUSCLEHACKING_FROZEN_CLIENT=/tmp/musclehacking-performance-investigation.tgi8MA/current MUSCLEHACKING_PREVIEW_PORT=8792 MUSCLEHACKING_BASE_URL=http://127.0.0.1:8792 MH_BENCH_RELEASE=/tmp/musclehacking-performance-investigation.tgi8MA/replay-current.release /Users/sacino/musclehacking/scripts/run-e2e-local.sh --config=/tmp/musclehacking-performance-investigation.tgi8MA/frozen.config.mts --grep='frozen document hashes'
```

```bash
export PATH=/Users/sacino/.nvm/versions/node/v22.23.4/bin:$PATH
MUSCLEHACKING_FROZEN_CLIENT=/tmp/musclehacking-performance-investigation.tgi8MA/fixed MUSCLEHACKING_PREVIEW_PORT=8797 MUSCLEHACKING_BASE_URL=http://127.0.0.1:8797 MH_BENCH_RELEASE=/tmp/musclehacking-performance-investigation.tgi8MA/replay-fixed.release /Users/sacino/musclehacking/scripts/run-e2e-local.sh --config=/tmp/musclehacking-performance-investigation.tgi8MA/frozen.config.mts --grep='frozen document hashes'
```

Then run the same compiled-comparison command with a fresh output directory:

```bash
export PATH=/Users/sacino/.nvm/versions/node/v22.23.4/bin:$PATH
node /Users/sacino/.agents/skills/lighthouse-test/scripts/run-lighthouse.mjs   --url http://127.0.0.1:8792/ --url http://127.0.0.1:8797/   --url http://127.0.0.1:8792/calorie-calculator/ --url http://127.0.0.1:8797/calorie-calculator/   --runs 3 --cpu-profile custom --cpu-slowdown-multiplier 10.7   --baseline-benchmark-index 3085 --lock-file /tmp/codex-lighthouse-host.lock   --blocked-url-pattern '*api.getresponse.com*' --blocked-url-pattern '*challenges.cloudflare.com*'   --output-dir /tmp/musclehacking-performance-investigation.tgi8MA/replay
python3 /tmp/musclehacking-performance-investigation.tgi8MA/summarise.py /tmp/musclehacking-performance-investigation.tgi8MA/replay
```

Run the verifier before/after against the same manifests. Release only these two owning wrappers after measurement:

```bash
touch /tmp/musclehacking-performance-investigation.tgi8MA/replay-current.release /tmp/musclehacking-performance-investigation.tgi8MA/replay-fixed.release
```

Verify their exact processes and ports close. After raw evidence is removed on acceptance, reproduce from the recorded source revisions in an explicitly authorised isolated checkout, rather than rebuilding over another task's checkout or silently changing branches.

## Durable lesson and excluded edge cases

The project testing guide now requires three-run arithmetic averages and diagnostic attribution, not a score-only result. Preserve the initial frozen output before editing, compare weighted metrics, inspect the actual LCP resource and network work, check actual throttling, and test one suspected change at a time. A request-count assertion cannot establish a loading improvement. Shared CSS/script delivery rules must follow measured behaviour, while retaining the design and static content.

Excluded edge cases: real-device/field performance, old browser engines, quantitative warm-cache speed comparisons, exact Lantern graph replay, production cutover/cache/redirect behaviour and production newsletter delivery. Hosted after-checks of both the earlier optimisation and the authorised correction are complete. No new guardrail, score budget, dependency, animation condition or provider is added.

## Frozen manifest identities

| Build | File count | SHA-256 of manifest |
| --- | ---: | --- |
| before | 143 | `922b23d57190f6808ca5f940a96e8bdc699788bdc3999d832951b7da4d0a79ce` |
| current | 137 | `484c6d86540c7b23912ed690c84d3514446bf98077e6b7d0147532ae8ff507cd` |
| old-scripts | 149 | `643b1dbbe938ec271784e69b0fd860198ddb002a06df8725100f318ddf13c5cf` |
| external-small-css | 140 | `03ac9cb6aaf75f9adaa296162985e57754fe032dcb82f11223bd1f824842f681` |
| low-priority-images | 137 | `3afefd870a0cae89625b844468869c18bc17054df4bce01172e9cb5d037ed8b5` |
| external-head-css | 139 | `9705839a9b0a6af53c7b54703e5a583eaeedddcf3d12750f68d02c8deb9b105b` |
| fixed | 139 | `b8417525cf16859239a9f0d48a34c8ab382a0726b059891bd8fa62b436cce96c` |

## Retained three-run values for primary comparisons

LCP is in milliseconds. Mean, median and range are derived from all three values; no run is dropped.

| Batch / URL / device / method | Three scores | Score mean / median / range | Three LCP values | LCP mean / median / range |
| --- | --- | --- | --- | --- |
| paired-original-current / 8791/ / mobile / simulate | 75.0, 76.0, 75.0 | 75.33 / 75.00 / 75.00-76.00 | 8190.1, 7743.0, 12619.7 | 9517.57 / 8190.05 / 7742.96-12619.70 |
| paired-original-current / 8792/ / mobile / simulate | 76.0, 88.0, 75.0 | 79.67 / 76.00 / 75.00-88.00 | 7741.4, 3863.5, 8948.7 | 6851.22 / 7741.42 / 3863.54-8948.69 |
| paired-original-current / 8791/calorie-calculator/ / mobile / simulate | 96.0, 98.0, 97.0 | 97.00 / 97.00 / 96.00-98.00 | 2648.7, 2196.7, 2279.9 | 2375.11 / 2279.94 / 2196.70-2648.69 |
| paired-original-current / 8792/calorie-calculator/ / mobile / simulate | 98.0, 98.0, 98.0 | 98.00 / 98.00 / 98.00-98.00 | 2413.6, 2270.9, 2199.5 | 2294.63 / 2270.85 / 2199.46-2413.57 |
| paired-original-current / 8791/ / desktop / simulate | 99.0, 89.0, 96.0 | 94.67 / 96.00 / 89.00-99.00 | 876.0, 2243.0, 1364.2 | 1494.41 / 1364.18 / 876.05-2243.01 |
| paired-original-current / 8792/ / desktop / simulate | 89.0, 100.0, 100.0 | 96.33 / 100.00 / 89.00-100.00 | 2254.9, 790.7, 786.7 | 1277.44 / 790.67 / 786.74-2254.92 |
| paired-original-current / 8791/calorie-calculator/ / desktop / simulate | 99.0, 100.0, 99.0 | 99.33 / 99.00 / 99.00-100.00 | 618.4, 639.4, 474.4 | 577.41 / 618.41 / 474.42-639.41 |
| paired-original-current / 8792/calorie-calculator/ / desktop / simulate | 100.0, 99.0, 100.0 | 99.67 / 100.00 / 99.00-100.00 | 618.2, 619.9, 626.0 | 621.37 / 619.91 / 618.21-625.98 |
| paired-original-current / 8791/ / mobile / devtools | 69.0, 69.0, 69.0 | 69.00 / 69.00 / 69.00-69.00 | 11671.7, 11827.8, 11844.3 | 11781.28 / 11827.79 / 11671.70-11844.34 |
| paired-original-current / 8792/ / mobile / devtools | 69.0, 69.0, 69.0 | 69.00 / 69.00 / 69.00-69.00 | 11720.8, 11631.3, 12086.9 | 11813.02 / 11720.83 / 11631.30-12086.94 |
| paired-original-current / 8791/calorie-calculator/ / mobile / devtools | 93.0, 91.0, 95.0 | 93.00 / 93.00 / 91.00-95.00 | 1790.5, 1821.1, 1726.5 | 1779.39 / 1790.49 / 1726.53-1821.15 |
| paired-original-current / 8792/calorie-calculator/ / mobile / devtools | 91.0, 92.0, 93.0 | 92.00 / 92.00 / 91.00-93.00 | 1841.5, 1768.2, 1838.2 | 1815.97 / 1838.19 / 1768.20-1841.52 |
| compiled-fix / 8792/ / mobile / simulate | 84.0, 88.0, 77.0 | 83.00 / 84.00 / 77.00-88.00 | 4443.8, 3847.8, 6390.6 | 4894.06 / 4443.79 / 3847.75-6390.63 |
| compiled-fix / 8797/ / mobile / simulate | 88.0, 75.0, 75.0 | 79.33 / 75.00 / 75.00-88.00 | 3912.1, 13518.0, 8491.4 | 8640.50 / 8491.45 / 3912.08-13517.98 |
| compiled-fix / 8792/calorie-calculator/ / mobile / simulate | 98.0, 98.0, 96.0 | 97.33 / 98.00 / 96.00-98.00 | 2272.9, 2112.1, 2343.2 | 2242.72 / 2272.88 / 2112.13-2343.15 |
| compiled-fix / 8797/calorie-calculator/ / mobile / simulate | 98.0, 98.0, 98.0 | 98.00 / 98.00 / 98.00-98.00 | 2201.4, 2276.5, 2272.5 | 2250.13 / 2272.52 / 2201.38-2276.49 |
| compiled-fix / 8792/ / desktop / simulate | 95.0, 99.0, 100.0 | 98.00 / 99.00 / 95.00-100.00 | 1493.0, 905.0, 800.3 | 1066.11 / 905.03 / 800.26-1493.04 |
| compiled-fix / 8797/ / desktop / simulate | 95.0, 90.0, 96.0 | 93.67 / 95.00 / 90.00-96.00 | 1487.4, 2086.5, 1382.5 | 1652.12 / 1487.40 / 1382.46-2086.50 |
| compiled-fix / 8792/calorie-calculator/ / desktop / simulate | 99.0, 100.0, 100.0 | 99.67 / 100.00 / 99.00-100.00 | 611.4, 556.2, 619.6 | 595.70 / 611.35 / 556.17-619.56 |
| compiled-fix / 8797/calorie-calculator/ / desktop / simulate | 100.0, 99.0, 99.0 | 99.33 / 99.00 / 99.00-100.00 | 622.2, 469.6, 524.6 | 538.79 / 524.62 / 469.57-622.18 |
| compiled-fix / 8792/ / mobile / devtools | 69.0, 69.0, 69.0 | 69.00 / 69.00 / 69.00-69.00 | 11788.5, 11593.5, 11596.1 | 11659.35 / 11596.09 / 11593.46-11788.50 |
| compiled-fix / 8797/ / mobile / devtools | 69.0, 69.0, 69.0 | 69.00 / 69.00 / 69.00-69.00 | 11564.3, 10713.7, 11656.7 | 11311.58 / 11564.27 / 10713.71-11656.74 |
| compiled-fix / 8792/calorie-calculator/ / mobile / devtools | 92.0, 92.0, 89.0 | 91.00 / 92.00 / 89.00-92.00 | 1634.2, 1668.4, 1935.4 | 1745.99 / 1668.41 / 1634.17-1935.40 |
| compiled-fix / 8797/calorie-calculator/ / mobile / devtools | 96.0, 91.0, 81.0 | 89.33 / 91.00 / 81.00-96.00 | 1567.0, 1822.3, 2077.0 | 1822.06 / 1822.27 / 1566.95-2076.96 |
