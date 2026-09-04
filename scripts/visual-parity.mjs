import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const repositoryRoot = '/Users/sacino/musclehacking';
const baselineRoot = process.env.VISUAL_BASELINE_DIR ?? '/Users/sacino/Documents/codex/web-development/musclehacking/legacy-baseline-9bf25d0/screenshots';
const outputRoot = process.env.VISUAL_OUTPUT_DIR ?? '/Users/sacino/Documents/codex/web-development/musclehacking/astro-candidate/screenshots';
const baseUrl = process.env.VISUAL_BASE_URL ?? 'http://127.0.0.1:8787';
/*
 * AUD-03 (independent audit, 4 September 2026). `VISUAL_CAPTURE_BASELINE=1` re-records
 * baselines from the audited legacy tree instead of comparing against them, using the
 * identical viewport, GIF-frame pinning, settle loop, and double-screenshot raster flush
 * as the comparison path. Serve the legacy tree with `python3 -m http.server 4173` from
 * the repository root. `VISUAL_CAPTURE_VIEWPORTS` limits which viewports are rewritten.
 */
const captureBaseline = process.env.VISUAL_CAPTURE_BASELINE === '1';
const legacyBaseUrl = process.env.VISUAL_LEGACY_URL ?? 'http://127.0.0.1:4173';
const legacyCommit = process.env.VISUAL_LEGACY_COMMIT ?? '9bf25d0';
const capturedViewports = (process.env.VISUAL_CAPTURE_VIEWPORTS ?? 'desktop,mobile').split(',').map((name) => name.trim());
const allowedMismatch = Number(process.env.VISUAL_MISMATCH_THRESHOLD ?? '0.02');
const maxChannelDelta = 16;
const comparisonRadius = 1;
// Include antialiased borders and control shadows without masking adjacent content.
const maskPadding = 4;
const routesFixture = JSON.parse(await readFile(path.join(repositoryRoot, 'tests/fixtures/legacy/routes.json'), 'utf8'));
const confirmationGifPath = path.join(repositoryRoot, 'public/img/hit-me-up-bb-girl.gif');
const modernityHeroPath = path.join(repositoryRoot, 'public/img/reject-modernity-embrace-masculinity.png');
const modernityHeroHash = createHash('sha256').update(await readFile(modernityHeroPath)).digest('hex');
if (modernityHeroHash !== '0940e4c8a4ec0bc75e5fc709efe2a9c419968f056310d3f611fe693d1a6ab7c9') {
  throw new Error('The modernity hero no longer matches the audited legacy source asset.');
}
const confirmationGifFrames = Object.fromEntries(await Promise.all([
  ['desktop', 16],
  ['mobile', 46],
].map(async ([viewport, page]) => {
  const frame = await sharp(confirmationGifPath, { page }).png().toBuffer();
  return [viewport, `data:image/png;base64,${frame.toString('base64')}`];
})));

const routeName = (routePath) => {
  if (routePath === '/') return 'home';
  return routePath.replace(/^\//, '').replace(/\/$/, '').replaceAll('/', '-');
};

// The audited legacy tree is a plain file tree: directories carry `index.html` and
// articles are single `.html` documents.
const legacyRoutePath = (routePath) => {
  const [pathname, query] = routePath.split('?');
  const file = /^\/blog\/[^/]+$/.test(pathname)
    ? `${pathname}.html`
    : (pathname === '/' ? '/index.html' : `${pathname}index.html`);
  return query ? `${file}?${query}` : file;
};

const pixelsMatch = (baseline, candidate, baselineOffset, candidateOffset) => Math.max(
  Math.abs(baseline[baselineOffset] - candidate[candidateOffset]),
  Math.abs(baseline[baselineOffset + 1] - candidate[candidateOffset + 1]),
  Math.abs(baseline[baselineOffset + 2] - candidate[candidateOffset + 2]),
) <= maxChannelDelta;

// Legacy equivalents of the candidate `prepare` hooks. The legacy supplement filters
// are Bootstrap `.filter-btn` buttons that carry `.active`, not `aria-pressed`.
const legacyPrepare = {
  '/supplements/': async (page) => page.waitForFunction(() => document
    .querySelector('#muscle-power-output-btn')?.classList.contains('active') === true),
  '/one-last-step/': async (page) => {
    const viewport = await page.evaluate(() => (window.innerWidth >= 800 ? 'desktop' : 'mobile'));
    await page.locator('img[src$="hit-me-up-bb-girl.gif"]').evaluate(async (image, source) => {
      image.src = source;
      await image.decode();
    }, confirmationGifFrames[viewport]);
  },
  'supplements-show-all': async (page) => {
    await page.locator('.filter-btn.show-all').click();
    await page.waitForFunction(() => document
      .querySelector('.filter-btn.show-all')?.classList.contains('active') === true);
  },
};

const states = [
  ...routesFixture.routes.map(({ path: routePath }) => ({
    path: routePath,
    name: routeName(routePath),
    prepare: routePath === '/supplements/'
      ? async (page) => page.waitForFunction(() => {
          const activeFilter = document.querySelector('[data-supplement-filter="muscle-growth"]');
          const noteText = document.querySelector('[data-supplement-category-note-text]');
          return activeFilter?.getAttribute('aria-pressed') === 'true' && Boolean(noteText?.textContent?.trim());
        })
      : routePath === '/one-last-step/'
        ? async (page) => {
            const viewport = await page.evaluate(() => window.innerWidth >= 800 ? 'desktop' : 'mobile');
            await page.locator('img[src$="hit-me-up-bb-girl.gif"]').evaluate(async (image, source) => {
              image.src = source;
              await image.decode();
            }, confirmationGifFrames[viewport]);
          }
      : undefined,
  })),
  { path: '/calorie-calculator/?leangains', name: 'calculator-leangains' },
  { path: '/calorie-calculator/?keto', name: 'calculator-keto' },
  {
    path: '/supplements/',
    name: 'supplements-show-all',
    prepare: async (page) => {
      await page.getByRole('button', { name: 'Show All', exact: true }).click();
      await page.waitForFunction(() => {
        const activeFilter = document.querySelector('[data-supplement-filter="show-all"]');
        const visibleEmptyEvidence = Array.from(document.querySelectorAll('[data-supplement-evidence]'))
          .some((element) => !element.hidden && !element.textContent?.trim());
        return activeFilter?.getAttribute('aria-pressed') === 'true' && !visibleEmptyEvidence;
      });
    },
  },
];

const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};

const approvedVisualPolicy = ({ name, viewport }) => {
  const masks = [
    {
      selector: '.newsletter-form button',
      reason: 'approved accessible newsletter button colour',
    },
    {
      selector: '.calculator-segmented input:not(:checked) + span',
      reason: 'approved accessible inactive calculator colour',
    },
    {
      selector: '[data-supplement-filter], .evidence-badge',
      reason: 'approved accessible supplement control colours',
    },
    {
      selector: '.anchorjs-link',
      reason: 'approved accessible darker heading-link colour',
    },
  ];
  const fixedMasks = [];

  if (name === 'blog-reject-modernity-embrace-masculinity') {
    masks.push({
      selector: 'iframe.video',
      reason: 'provider-controlled YouTube iframe raster',
    });
    masks.push({
      selector: '.hero-image',
      reason: 'browser raster of byte-identical audited legacy hero asset',
    });
  }

  if (viewport === 'mobile' && (name === 'calorie-calculator' || name.startsWith('calculator'))) {
    masks.push({
      selector: '.calculator-shell',
      reason: 'approved fluid narrow-screen calculator layout',
    });
  }

  if (viewport === 'mobile' && (name === 'supplements' || name === 'supplements-show-all')) {
    masks.push({
      selector: '.supplements-page',
      reason: 'approved fluid narrow-screen supplement layout',
    });
  }

  if (
    viewport === 'desktop'
    && (
      name === 'calorie-calculator'
      || name.startsWith('calculator')
      || name === 'supplements'
      || name === 'supplements-show-all'
    )
  ) {
    fixedMasks.push({
      reason: 'legacy provider-controlled reCAPTCHA badge omitted by migration policy',
      selector: 'legacy-recaptcha-badge',
      rect: { x: 1366, y: 922, width: 74, height: 68 },
    });
  }

  return {
    masks,
    fixedMasks,
    approvedReason: name === 'supplements-show-all'
      ? 'approved stable Show All viewport without the legacy scroll jump'
      : undefined,
  };
};

const pointInMask = (x, y, masks) => masks.some(({ rect }) => (
  x >= rect.x - maskPadding
  && x < rect.x + rect.width + maskPadding
  && y >= rect.y - maskPadding
  && y < rect.y + rect.height + maskPadding
));

const browser = await chromium.launch({ headless: true });
const results = [];
const captured = [];

try {
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    if (captureBaseline && !capturedViewports.includes(viewportName)) continue;
    await mkdir(path.join(outputRoot, viewportName), { recursive: true });
    if (captureBaseline) await mkdir(path.join(baselineRoot, viewportName), { recursive: true });

    for (const state of states) {
      const page = await browser.newPage({ viewport });
      try {
        const requestPath = captureBaseline ? legacyRoutePath(state.path) : state.path;
        const origin = captureBaseline ? legacyBaseUrl : baseUrl;
        const response = await page.goto(`${origin}${requestPath}`, { waitUntil: 'domcontentloaded' });
        if (response?.status() !== 200) throw new Error(`${requestPath} returned ${response?.status()}`);
        await page.evaluate(() => document.fonts.ready);
        const prepare = captureBaseline ? legacyPrepare[state.name] ?? legacyPrepare[state.path] : state.prepare;
        if (prepare) await prepare(page);
        await page.waitForFunction(() => Array.from(document.images)
          .filter((image) => {
            const rect = image.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < window.innerHeight;
          })
          .every((image) => image.complete && image.naturalWidth > 0));
        await page.evaluate(async () => {
          const visibleImages = Array.from(document.images).filter((image) => {
            const rect = image.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < window.innerHeight;
          });
          await Promise.all(visibleImages.map((image) => image.decode()));

          const geometry = () => JSON.stringify(Array.from(document.body.children, (element) => {
            const rect = element.getBoundingClientRect();
            return [rect.x, rect.y, rect.width, rect.height];
          }));
          let previous = geometry();
          for (let attempt = 0; attempt < 10; attempt += 1) {
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const current = geometry();
            if (current === previous) return;
            previous = current;
          }
          throw new Error('Page geometry did not settle before visual capture.');
        });

        const baselinePath = path.join(baselineRoot, viewportName, `${state.name}.png`);
        if (captureBaseline) {
          // Same double screenshot as the comparison path: the first call forces
          // Chromium to raster the current page before the retained capture.
          await page.locator('img, h1').first().screenshot({ animations: 'disabled' });
          await page.screenshot({ animations: 'disabled' });
          await page.screenshot({ path: baselinePath, animations: 'disabled' });
          captured.push({ viewport: viewportName, name: state.name, source: `${legacyBaseUrl}${requestPath}` });
          continue;
        }

        const policy = approvedVisualPolicy({ name: state.name, viewport: viewportName });
        const selectorMasks = (await Promise.all(policy.masks.map(async ({ selector, reason }) => ({
          reason,
          selector,
          rects: await page.locator(selector).evaluateAll((elements) => elements
            .map((element) => element.getBoundingClientRect())
            .filter((rect) => rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight)
            .map((rect) => ({
              height: rect.height,
              width: rect.width,
              x: rect.x,
              y: rect.y,
            }))),
        })))).flatMap(({ reason, selector, rects }) => rects.map((rect) => ({ reason, selector, rect })));
        const masks = [...selectorMasks, ...policy.fixedMasks];

        const candidatePath = path.join(outputRoot, viewportName, `${state.name}.png`);
        // Force Chromium to raster the current page before retaining evidence. Rapidly
        // replacing pages can otherwise return a mixed compositor frame with current
        // navigation and stale body geometry from the previously closed page.
        await page.locator('.site-brand').screenshot({ animations: 'disabled' });
        await page.screenshot({ animations: 'disabled' });
        await page.screenshot({ path: candidatePath, animations: 'disabled' });

        const baseline = await sharp(baselinePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const candidate = await sharp(candidatePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        if (baseline.info.width !== candidate.info.width || baseline.info.height !== candidate.info.height) {
          throw new Error(`${state.name} ${viewportName} dimensions differ`);
        }

        // Local fonts can rasterise an edge one pixel away while the element geometry
        // remains unchanged. Match within a one-pixel neighbourhood so the 2 percent
        // gate measures visible layout and colour changes instead of antialias noise.
        let rawMismatchedPixels = 0;
        let evaluatedMismatchedPixels = 0;
        for (let y = 0; y < baseline.info.height; y += 1) {
          for (let x = 0; x < baseline.info.width; x += 1) {
            const baselineOffset = (y * baseline.info.width + x) * 4;
            if (pixelsMatch(baseline.data, candidate.data, baselineOffset, baselineOffset)) continue;

            let matchesNeighbour = false;
            for (let yOffset = -comparisonRadius; yOffset <= comparisonRadius && !matchesNeighbour; yOffset += 1) {
              for (let xOffset = -comparisonRadius; xOffset <= comparisonRadius && !matchesNeighbour; xOffset += 1) {
                const candidateX = x + xOffset;
                const candidateY = y + yOffset;
                if (
                  candidateX < 0
                  || candidateX >= candidate.info.width
                  || candidateY < 0
                  || candidateY >= candidate.info.height
                ) continue;

                const candidateOffset = (candidateY * candidate.info.width + candidateX) * 4;
                matchesNeighbour = pixelsMatch(
                  baseline.data,
                  candidate.data,
                  baselineOffset,
                  candidateOffset,
                );
              }
            }

            if (!matchesNeighbour) {
              rawMismatchedPixels += 1;
              if (!pointInMask(x, y, masks)) evaluatedMismatchedPixels += 1;
            }
          }
        }

        const pixelCount = baseline.info.width * baseline.info.height;
        results.push({
          viewport: viewportName,
          name: state.name,
          mismatch: evaluatedMismatchedPixels / pixelCount,
          rawMismatch: rawMismatchedPixels / pixelCount,
          approvedReason: policy.approvedReason,
          maskReasons: [...new Set(masks.map(({ reason }) => reason))],
        });
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}

if (captureBaseline) {
  const provenance = {
    capturedAt: new Date().toISOString(),
    decision: 'AUD-03 / VIS-01, approved by the human on 4 September 2026 and recorded in documents/migration/human-review-packet.md',
    legacyCommit,
    legacyOrigin: legacyBaseUrl,
    method: 'scripts/visual-parity.mjs VISUAL_CAPTURE_BASELINE=1',
    playwright: JSON.parse(await readFile(path.join(repositoryRoot, 'node_modules/@playwright/test/package.json'), 'utf8')).version,
    viewports: Object.fromEntries(capturedViewports.map((name) => [name, viewports[name]])),
    captures: captured,
  };
  for (const viewportName of capturedViewports) {
    await writeFile(
      path.join(baselineRoot, viewportName, 'PROVENANCE.json'),
      `${JSON.stringify({ ...provenance, captures: captured.filter((entry) => entry.viewport === viewportName) }, null, 2)}\n`,
    );
  }
  for (const entry of captured) console.log(`CAPTURED ${entry.viewport.padEnd(7)} ${entry.name.padEnd(50)} from ${entry.source}`);
  console.log(`\nRewrote ${captured.length} baselines from legacy commit ${legacyCommit}. Provenance written beside them.`);
} else {
  for (const result of results) {
    const status = result.approvedReason
      ? 'APPROVED'
      : result.mismatch <= allowedMismatch
        ? 'PASS'
        : 'FAIL';
    const masks = result.maskReasons.length > 0 ? `; masks: ${result.maskReasons.join(', ')}` : '';
    const approval = result.approvedReason ? `; ${result.approvedReason}` : '';
    console.log(`${status.padEnd(8)} ${result.viewport.padEnd(7)} ${result.name.padEnd(50)} evaluated ${(result.mismatch * 100).toFixed(2)}%; raw ${(result.rawMismatch * 100).toFixed(2)}%${masks}${approval}`);
  }

  const failures = results.filter(({ mismatch, approvedReason }) => !approvedReason && mismatch > allowedMismatch);
  if (failures.length > 0) {
    throw new Error(`${failures.length} of ${results.length} screenshots exceed the ${(allowedMismatch * 100).toFixed(0)}% mismatch threshold`);
  }
}
