# Shared component ownership plan 🧪 **PENDING TESTING**

Execution checklist: baseline; batch 1 facts/icons; batch 2 repeated composition; batch 3 CSS ownership; ownership docs; final verification; scoped commit; safe push/preview deploy; hosted proof; cleanup.

## 1. Goal

### 1.1 End goal

Make new Muscle Hacking pages quick to build, with one edit updating every consumer of a repeated pattern, a consistent design voice and page files containing only their differences. The owner is happy with the site and requires unchanged copy, appearance and behaviour at every screen width.

### 1.2 Chosen approach and deliverable

The owner chose a source audit, batched implementation, zero changed pixels on every affected page at phone/tablet/desktop widths, standard checks per batch, updated ownership docs, scoped GAC, and an authorised staging push/deploy with hosted proof. Follow build-astro-websites and the Tax Genie worked method. [The audit](../component-reuse-audit.md) fixes R1-R8 recommendations and K1-K8 boundaries. No scope or batch approvals are required.

### 1.3 What would not count as success

- Smaller pages that retain independently authored pattern copies, or a universal component that flattens real differences.
- Changed text, pixels, semantics, interaction or responsive behaviour; tolerance, masking or replacement baselines do not count.
- Changes to one-off sections, content bodies, provider code, generated output, legacy pre-Astro sources, dependencies, fonts or build/deploy settings.
- Pushing a production-deploying branch or changing a production version, routes, domains or DNS.

### 1.4 Done means

1. R1-R8 each have one documented authoritative owner and explicit current-use variants; K1-K8 remain intact.
2. Every affected route and affected state matches before/after pixels, copy and semantic output; every batch passes standard verification.
3. Design/code docs identify actual owners, variants and consumers.
4. Required local and hosted checks pass, staging demonstrably serves the new commit and its affected pages match local output.
5. Scoped work is committed and safely pushed/deployed; temporary executable tools are removed, raw evidence is ignored and all task-owned browsers/servers are closed.

## 2. Current state analysis

The Astro 7.2.9 site prerenders documents through BaseLayout; ContentLayout supplies the home/blog sidebar frame and ArticleLayout supplies eleven blog articles plus Books and the beginner guide. Calculator and supplements compose BaseLayout directly. The sole request-time endpoint is `/api/subscribe`. Mixed slash policy, static assets and headers are enforced by route/output scripts.

Existing ArticleEnding, NewsletterForm, HomeListing, Callout, Figure and content helpers already eliminate much duplication. Remaining copies are the audit's site facts, icon geometry, share-rail structures, disclaimer prefix, longform ending defaults and CSS recipes. The supplements route also owns explorer styles, obscuring its page-specific inputs.

Start revision: `204170a691838a006ec2cf94880fa310d2e08daf`; current branch `codex/astro-cloudflare-migration`. Other work changed `.nvmrc`/`.node-version` from 22.23.2 to 22.23.4 and committed those files as `8d2f20d`. All application source hashes still match the start revision. Use the current pinned 22.23.4 runtime; those changes are outside this task commit. No worktree or new branch is needed.

Local runtime belongs exclusively to `scripts/run-e2e-local.sh`; it builds, leases port 8787, starts Wrangler and cleans it up. Temporary captures run as an ignored Playwright spec through that wrapper, never against a manually launched preview. Hosted runs use MUSCLEHACKING_BASE_URL and suppress local startup. Current docs define a direct Wrangler review Worker release, not an automatic production promotion.

## 3. Desired state

- **REQ-1 MUST:** use existing foundations first, small typed variants, native tags and wrapper-free slots.
- **REQ-2 MUST:** retain exact copy and meaningful whitespace, headings/lists/links/ARIA/IDs/classes/data hooks, order and interaction.
- **REQ-3 MUST:** retain all computed presentation values, selector specificity, query boundaries and script/provider behaviour.
- **REQ-4 MUST:** finish each batch's exact pixel/output/standard gate before the next batch.
- **REQ-5 MUST:** document ownership and preserve the static architecture and all exclusions in section 1.3.
- **REQ-6 MUST:** inspect the remote branch/release configuration, push only the documented non-production branch, deploy only the isolated review Worker and prove its commit/assets/checks.

Use no new durable tests: existing behavioural coverage remains unchanged; the existing palette assertion resolves CSS tokens instead of requiring literal CSS text, retaining exact values and contrast/forbidden-palette checks; temporary exact output/pixel checks accept only this refactor. No dependency or permanent screenshot suite is added. Preserve renderer-specific Astro/React/DOM adapters where native rendering differs, sharing their data and CSS rather than forcing a new runtime.

## 4. Additional context

### 4.1 Authority and sources

Read `/Users/sacino/AGENTS.md`, repository AGENTS, documents/AGENTS, architecture/site, content/editing, testing/README, testing/local-runtime-lifecycle and migration/cloudflare-builds. Applicable skills include good-css, dev-browser, track-implementation-plan-file and React best practices for the calculator's static geometry imports. Do not migrate the existing script-loading strategy; that would change out-of-scope build/delivery behaviour.

### 4.2 Decision record

#### D-1: Existing owners and exact variants
- **Context:** Similar markup includes real differences and multiple renderers.
- **Options:** (a) consolidate data/recipes and repeated structures with small variants; (b) force every use through a universal component; (c) retain copies.
- **Decision:** (a), plan writer.
- **Why:** One edit reaches consumers while preserving native output and keeping page differences explicit.
- **Why not (b), (c):** (b) risks changed markup/runtime; (c) misses the goal.
- **Reconsider when:** Source review reveals a shared implementation still authored twice.

#### D-2: Exact temporary acceptance
- **Context:** Existing legacy screenshot checks mask differences and cannot prove zero changed pixels.
- **Options:** (a) disposable captures with installed Playwright/sharp; (b) reuse tolerant legacy comparison; (c) permanent screenshot baselines.
- **Decision:** (a), owner-required exact per-page/three-width verification. The executor surfaced an estimated one to two hours; the explicit current request already directs this check without confirmation.
- **Why:** Detects selector/scoping/whitespace regressions that standard tests miss without durable incidental assertions.
- **Why not (b), (c):** (b) weakens exactness; (c) adds maintenance outside scope.
- **Reconsider when:** An unchanged pair differs: stop that batch and repair capture determinism. Do not relax the threshold; report a blocked check if baseline determinism cannot be established within the estimate.

#### D-3: Three technical batches
- **Context:** Global styles and shared header changes affect all routes.
- **Options:** (a) facts/icons, composition, then CSS; (b) one unreviewable sweep; (c) a batch per individual consumer.
- **Decision:** (a), plan writer.
- **Why:** Gives attributable output pairs at coherent ownership boundaries.
- **Why not (b), (c):** (b) makes diagnosis harder; (c) repeats expensive captures without independent value.
- **Reconsider when:** A tightly coupled extraction cannot pass independently; document the coupling before changing the batch.

#### D-4: Review Worker release
- **Context:** Source Wrangler name is production; docs provide an isolated review name and deployment commands.
- **Options:** (a) current non-promoting migration branch plus explicit review Worker upload/deploy; (b) production-default command; (c) invent staging infrastructure.
- **Decision:** (a), owner-authorised staging release.
- **Why:** Uses the documented isolated target with no production changes.
- **Why not (b), (c):** (b) is prohibited; (c) is unnecessary/outside scope.
- **Reconsider when:** Remote inspection cannot prove branch safety or reveals production routes on the review Worker; stop external writes, retain the local commit and report the blocker.

## 5. Implementation plan

### ~~Step 1: Establish baseline~~ ✅ **COMPLETED**

- [x] Save/validate the read-only audit and this plan; record source/input identities.
- [x] Build and discover emitted documents, capture every route and required state, and repeat untouched captures with zero decoded pixel differences.

Baseline standard gate passes: Astro/TypeScript has zero errors/warnings, 134 unit tests pass, build and verify:dist pass. Initial 150-image capture completed. A repeat exposed ten native-control edge pixels at tablet width on unchanged source. The temporary comparator was optimised and the capture browser now disables threaded animation/scrolling and partial raster; a fresh independently repeated pair is required before application edits. Original captures remain diagnostic, not accepted baselines. Subsequent captures lost the local preview/browser during very tall full-page output; capture now uses overlapping real viewport tiles and disables sharp caching to bound memory. Offscreen capture raster and delayed native scroll/clipboard feedback required capture-only settling fixes; no masks or tolerance were added. No application or test assertion changes resolve these tooling failures. Accepted baseline requires a complete matching independent pair under the final procedure. Source hashes and an untouched source copy are in ignored `.artifacts/component_reuse/baseline-inputs.json` and `baseline-source/`.

Accepted baseline: `baseline-final` and its independent repeat both cover 20 documents, three primary widths and 1,325 captures with zero changed pixels. Full source hashes match the original snapshot.

**Success criteria:** fresh document inventory includes confirmation and 404; unchanged pairs and semantic/discovery snapshots match under section 6; application source remains unedited.

### ~~Step 2: Batch 1 - facts and icons~~ ✅ **COMPLETED**

- [x] Resolve R1/R2 using site configuration, existing metadata/route owners and shared typed geometry; retain exact serialisation variants and renderer adapters.
- [x] Update owner docs, compare every affected route/state and run the batch gate.

Batch 1 result: all four standard commands pass; 20 semantic/discovery documents match; 1,325 captures at all three widths show zero changed pixels. The direct Node route-config import retains an explicit `.ts` extension. Empty SVG data-hook attributes remain empty strings.

**Success criteria:** source searches show one owner per fact/icon variant; all SVG attributes and URLs remain equal; V1-V3 and batch gate pass.

### ~~Step 3: Batch 2 - repeated composition~~ ✅ **COMPLETED**

- [x] Resolve R3-R6 markup: ProjectTip, ShareRailItem, disclaimer prefix, section-ending defaults, supplement support wrapper. Keep category-note interaction explicit.
- [x] Update owner docs and complete the pixel/output/batch gate before CSS work.

Batch 2 standard/output checks pass; all three widths cover 1,325 captures with zero changed pixels. Canonical/preload links, script attributes and island entry contracts also match. One local Wrangler proxy connection failure returned HTTP 500 for an unchanged header image; the isolated page and desktop rerun pass on a fresh lifecycle-owned preview, with no app change. The capture now rejects image decode failures immediately. Related-link lookup compares `/blog/${post.id}` because content IDs are slugs. Confirmation and pinned section facts also use the existing route owner.

**Success criteria:** rail trees and support wrappers each have one implementation, disclaimer/ending defaults have one source; V1-V4 and batch gate pass with unchanged semantic output.

### ~~Step 4: Batch 3 - style ownership~~ ✅ **COMPLETED**

- [x] Resolve R6 stylesheet ownership and R7/R8 exact tokens/recipes, preserving cascade and every breakpoint/value.
- [x] Update design/code docs and complete all-route comparison and standard gate.

The final source pass also groups identical detail/support heading and paragraph recipes, consolidates feature filter/evidence and share-channel colours, and preserves the former global mobile support adjacency selector in the explorer owner.

The initial all-route batch 3 capture passes at all widths. Final scope review returns the unique intro paragraph override to its route, as specified by R6; the final acceptance run covers this correction: all 1,325 captures have zero changed pixels and all four standard commands, semantic/discovery and metadata/resource contracts pass.

**Success criteria:** explorer CSS is component-owned, repeated approved values use one token owner, no duplicated exact recipe remains without an audit disposition; V1-V4 and batch gate pass.

### Step 5: Final acceptance, commit and staging 🧪 **PENDING TESTING**

- [x] Run final local E2E/accessibility and complete the scoped diff.
- [x] Inspect hosted owners and compare the 44 settled boundary contexts after asset parity.
- [x] Write the local acceptance record after results, validate tracking, and GAC only task changes. Keep ignored capture tools for hosted proof; Trash them after the last use.
- [x] Verify safe remote branch and review Worker, push, upload with commit message/tag and explicit name/origin, deploy the returned review version.
- [x] Verify hosted HTTP/accessibility, deployed version/commit and local-versus-hosted output/pixels; record results and close task resources.
- [ ] Obtain a conclusive full hosted portable E2E result: the recorded three-worker run has two timeouts; the isolated diagnostic passes do not replace it.

Authorised timeout follow-up checklist (22 October 2026):

- [x] Classify both failures from traces, current staging/source proof and a bounded parallel reproduction.
- [x] Fix the proven causes without reducing assertions, increasing deadlines or changing application output/behaviour.
- [x] Verify the failing scenarios under parallel load and run the required final local checks.
- [ ] GAC, safely push/deploy any fixes to the review Worker and prove its commit/assets.
- [ ] Pass the complete hosted suite, update acceptance/operations records and close task resources.

The isolated local suite initially has 269 passes, 25 existing skips and two palette-source assertion failures. Those assertions intentionally encounter shared CSS tokens after R7; the existing test now resolves declarations in the filter context, checks exact background and border colours, and retains the forbidden legacy palette checks. Both focused desktop/mobile cases pass. Final type check has zero errors/warnings; the full suite has 271 passes, 25 existing skips and zero failures; the six accessibility cases pass serially. No application change or new test case is added.

The initial release's hosted output/visual checks and cleanup pass. The review Worker serves implementation commit `778bf99` at 100 percent. All 14 HTTP cases, all 140 public-file byte comparisons, all 1,325 primary-width captures, all 44 settled breakpoint contexts and six hosted accessibility cases pass. Its three-worker E2E run has 265 passes, 25 existing skips and two timeouts: desktop article-ending traversal at the whole-test deadline and mobile calculator result-change polling. The original isolated passes establish timing sensitivity; the follow-up below identifies and repairs the test causes. The acceptance record retains the failed run and its traces.

The follow-up identifies test causes in the original traces: 22 article navigations share one deadline, including a 14,971 ms iframe-page load, while the calculator already renders its correct result before a nested `innerText` read stalls for 10,431 ms past the separate poll deadline. Independent route/control tests and a native rendered-text assertion preserve all 52 article assertion expressions and all 28 calculator inputs. All 176 repeated focused checks pass at three workers (slowest 2.815 seconds). Final local check/test/build/verify:dist pass, with 355 E2E passes, 25 existing skips and six accessibility passes. All 114 source hashes and all 140 public build files remain identical. The repair is ready for GAC/deploy; the final hosted matrix is pending.

**Success criteria:** V5/V6 pass, configured identity is used, unrelated Node edits remain intact, preview URL and remote version identify the exact commit; final evidence and plan accurately report every outcome/limit.

## 6. Testing plan

### 6.1 Verification scenarios

| ID / requirement | Input/state | Observable expected result | Evidence |
| --- | --- | --- | --- |
| V1 / ownership, Done 1/3 | All active source consumers in R1-R8 | One authoritative implementation per pattern, documented current variants; no excluded edits | Scoped source/diff review and ownership table |
| V2 / REQ-2/3/4, Done 2 | Every affected emitted document at 390×844, 768×1024, 1440×900 | Equal dimensions and zero unequal decoded pixels; independent unchanged repeat first | Temporary Playwright/sharp through lifecycle wrapper; zero new durable tests because this freezes presentation for this refactor only |
| V3 / REQ-2/3 | Every built document/discovery output, same build inputs | Exact rendered text including meaningful spaces, semantic tags/attributes and URL values; only compiler scopes/resource hashes may vary | Cheerio tree/attribute snapshots, discovery byte comparison; retain significant text nodes and SVG paths |
| V4 / interaction | Header menu/links, home card hover/focus, article heading links and share tooltip/copy feedback, supplements all filters/support/popover, calculator modes/floating/modal prompts | Same states, destinations, focus, filtering and displayed values; no provider mutation | Existing E2E specs unchanged plus temporary state captures at the three widths; short/long article contexts |
| V5 / local gates, Done 4/5 | Final application plus existing safe form mocks | Required checks pass and no task runtime remains | Project commands in 6.5, raw logs inspected, port/lease/browser checks |
| V6 / hosted proof, Done 4/5 | Isolated preview Worker serving committed build | Exact version/message maps to commit, served assets match local, required hosted checks and affected-page screenshots match | Wrangler/API readback, hosted-contract, portable Playwright and temporary hosted captures |

### 6.2 Setup and records

Use pinned Node and pnpm; no tests against production. Keep raw output/temp tools in `/Users/sacino/musclehacking/.artifacts/component_reuse/`, locally ignored through `.git/info/exclude`, or existing ignored test-results. Temporary spec is also locally ignored and removed at completion. Capture settings/manifest record route, width, state, input hashes and dimensions. No tests write tracked files.

Final record: `documents/evidence/component_reuse/acceptance.md`, written after runs, containing commands, baseline/final revision identities, setup, expected/actual outcomes, pass/fail, replay procedure, raw paths and limits. Batch logs need no separate committed record. Keep ignored raw evidence until user acceptance. Temporary executable capture code is Trashed at the end.

### 6.3 Browser acceptance

Use `/Users/sacino/.agents/skills/dev-browser/SKILL.md` for live inspection; browser name `musclehacking-component-reuse`, stable tab `main`, with task-owned evidence directory `/Users/sacino/.dev-browser/tmp/mh-component-reuse-f84c/` and its `evidence.json` manifest. The baseline browser is closed between runtime runs; reuse the same name when reopened. Direct installed Playwright through the project wrapper handles temporary decoded-pixel acceptance, as in the worked example. No manually started local server. Final live geometry/optical inspection uses the hosted build after byte parity; running independent browser clients against the local full suite caused preview contention, so final checks run serially.

Enumerate fresh `dist/client` HTML rather than the sitemap; include the real missing-path 404. Anonymous persona, DPR 1, fixed Chromium/locale/timezone/clock, same fonts and asset bytes. Block external requests on both sides, retaining the native empty iframe fallback. Pin animated GIF requests to the same first decoded frame in the capture context only. Wait for fonts, decode all images including lazy images, settle geometry and prime the compositor. Complete finite CSS animations in screenshot context; never hide/mask regions or ship a screenshot mode. Capture complete documents through overlapping visible scroll tiles, with 160px overlap to expose content behind fixed controls; retain every viewport pixel. Wait for the native scroll event before advancing the controlled animation frame, prime the compositor, advance another fixed frame and retain the next screenshot. Wait for document.fonts.ready and native screenshot font readiness; do not force unused font faces. Await asynchronous copy feedback and clear it before the next focus state. These are capture-context controls only, with no shipped mode, masks or tolerance. Compare RGBA channel values exactly and record diff bounds for failures. A failure blocks the next batch.

Check the final hosted build’s boundary geometry/type against the original local baseline at 320, 560/561, 767/768, 820/821, 1399/1400 and 1750/1751 on representative layout contexts using matching before/after computed boxes. The first normal-time measurements did not settle consistently and remain diagnostic. An ignored archive of the original source, checked against its retained hashes and built with the installed CLI, supplies two independently matching settled original runs. Browser request interception serves exact fixture bytes without a server. All 44 original-repeat/staging contexts match boxes, fonts, colours, margins and padding; this does not replace the accepted pixel baseline. The fixture and temporary tools are Trashed after proof. Preserve the source query expressions as evidence for intermediate widths. Inspect rendered contextual and close-up screenshots for each changed owner/variant, including scrolled fixed controls. Reuse normal-time existing E2E for behaviour; a frozen screenshot does not prove interaction.

### 6.5 Completion gates

- Every batch: `pnpm --dir /Users/sacino/musclehacking check`, `test`, `build`, `verify:dist`, plus V2-V4 exact acceptance. Discover inventory from that fresh build.
- Final local: `/Users/sacino/musclehacking/scripts/run-e2e-local.sh --workers=3`; run the same six agent accessibility cases serially through the wrapper with `tests/a11y --project=chromium --grep "unapproved serious accessibility" --workers=1` and a separate ignored output directory. A combined run lost the Wrangler proxy connection and shared Playwright output collided; serial execution avoids that contention, with no test or app changes. Never launch another Wrangler manually.
- Hosted: `node /Users/sacino/musclehacking/scripts/hosted-contract.mjs <preview-origin>`; `MUSCLEHACKING_BASE_URL=<preview-origin> pnpm --dir /Users/sacino/musclehacking exec playwright test tests/e2e --workers=3`; hosted agent accessibility and V6 parity.
- Final scope: no configuration/dependency/content/provider edits, no tracked captures, full scoped diff/commit review, plan validator passes, task browsers absent, port 8787 and wrapper lease released.

### 6.6 Excluded edge cases

| Case | Why excluded | Possible symptom | Covering check |
| --- | --- | --- | --- |
| Every browser/OS/GPU/DPR combination | Exact raster proof uses one fixed Chromium environment; no platform mechanism changes | Platform-specific raster/layout issue | Matching captures on that platform |
| Provider-controlled live iframe pixels and successful newsletter delivery | Provider code/data is outside scope; live media is nondeterministic and newsletter mutations require separate test credentials/authority | External media or delivery failure unrelated to refactor | Approved provider integration test; native iframe and safe failure paths remain covered |

No currently emitted page, required primary width or affected local interaction is excluded.

## Implemented Solution

- Public facts, exact icon geometry, static rail/tooltips, disclosure prefix, section endings/navigation and supplement support wrappers now have one documented owner. Native renderer adapters, page-specific copy, margins and headings remain explicit.
- Explorer CSS moves to its component, with the unique intro override in the page. Exact semantic colour roles and proven equal type/layout recipes are shared without changing values or query boundaries. No runtime/backend/cache/provider/route behaviour changes.
- Existing palette E2E assertions resolve token values while retaining exact approved colours, contrast and forbidden-palette checks; no test case or skip is added.
- Commands `pnpm check`, `pnpm test`, `pnpm build` and `pnpm verify:dist` pass for each batch; the final local lifecycle E2E has 271 passes and 25 existing skips, and all six accessibility cases pass. Three per-batch 1,325-image comparisons have zero changed pixels.
- Commit `778bf99` is safely pushed and deployed as review version `3ff8509f-59b9-4d07-9e37-ea0b7aada8cf`. Hosted HTTP (14), public-file byte equality (140), primary captures (1,325), settled boundary contexts (44) and accessibility (six) pass. Live article share-rail and phone supplement-filter inspection passes. No production release, routes, domains or DNS change.
- The initial hosted `playwright test tests/e2e --workers=3` has 265 passes, 25 existing project-specific skips and two timeouts. The follow-up repairs the test boundaries and nested polling without changing the app, deadlines, retries or skips. The exact article assertion inventory and all 28 calculator control/value cases remain intact. Focused repeated three-worker verification passes 176 cases; final local E2E passes 355 with the same 25 skips, and all six accessibility cases pass. The rebuilt 140 public files and 114 source hashes equal the accepted refactor. Final hosted verification after the repair's commit/deploy remains pending. No GitHub check/workflow/status jobs are configured for this branch; direct Wrangler owns staging releases.
- Temporary capture code and the original archive fixture are Trashed. Task browser is closed, local port/lease are absent and shared dependencies remain intact. Raw ignored evidence remains until user acceptance. Final documentation records the release and unresolved hosted validation without redeploying unchanged application code.
- Excluded edge cases are other browser/OS/GPU/DPR combinations, live provider iframe pixels and successful newsletter delivery, as detailed in section 6.6.
- Files touched:
  - `documents/migration/cloudflare-builds.md`
  - `documents/testing/README.md`
  - `DESIGN.md`
  - `documents/AGENTS.md`
  - `documents/architecture/calculator.md`
  - `documents/architecture/components.md`
  - `documents/architecture/site.md`
  - `documents/architecture/supplements.md`
  - `documents/component-reuse-audit.md`
  - `documents/content/editing.md`
  - `documents/evidence/component_reuse/acceptance.md`
  - `documents/todo/component_reuse_plan.md`
  - `src/components/CalculatorNewsletterPrompts.astro`
  - `src/components/Callout.astro`
  - `src/components/Header.astro`
  - `src/components/HomeListing.astro`
  - `src/components/Icon.astro`
  - `src/components/ProjectTip.astro`
  - `src/components/Sidebar.astro`
  - `src/components/SupplementExplorer.astro`
  - `src/components/SupplementSupport.astro`
  - `src/components/article/AffiliateDisclaimer.astro`
  - `src/components/article/NewsletterSignup.astro`
  - `src/components/article/SectionEnding.astro`
  - `src/components/article/ShareLinks.astro`
  - `src/components/article/ShareRailItem.astro`
  - `src/components/article/SocialShareRail.astro`
  - `src/config/home.ts`
  - `src/config/routes.ts`
  - `src/config/site.ts`
  - `src/features/calculator/Calculator.tsx`
  - `src/features/calculator/calculator.css`
  - `src/features/supplements/enhance.ts`
  - `src/lib/content/navigation.ts`
  - `src/lib/icons.ts`
  - `src/pages/404.astro`
  - `src/pages/blog/index.astro`
  - `src/pages/calorie-calculator/index.astro`
  - `src/pages/index.astro`
  - `src/pages/join/index.astro`
  - `src/pages/one-last-step/index.astro`
  - `src/pages/supplements/index.astro`
  - `src/styles/global.css`
  - `tests/e2e/ui-parity.spec.ts`
  - `tests/e2e/calculator-supplement-comprehensive.spec.ts`
