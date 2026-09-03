import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const repositoryRoot = '/Users/sacino/musclehacking';
const evidenceRoot = '/Users/sacino/Documents/codex/web-development/musclehacking/content-authoring-baseline';
const legacyOrigin = 'http://127.0.0.1:4173';
const candidateOrigin = 'http://127.0.0.1:8787';
const routes = [
  'australian-health-star-rating',
  'best-protein-powder-for-building-muscle',
  'breakup-energy',
  'calorie-calculator-how-to',
  'change',
  'healthy-low-calorie-foods',
  'healthy-organic-post',
  'idols',
  'normal',
  'reject-modernity-embrace-masculinity',
  'weak',
  'what-is-intermittent-fasting',
].map((slug) => ({
  name: slug,
  legacyPath: `/blog/${slug}.html`,
  candidatePath: `/blog/${slug}`,
}));
routes.push(
  { name: 'books', legacyPath: '/books/', candidatePath: '/books/' },
  { name: 'lose-fat-gain-muscle', legacyPath: '/lose-fat-gain-muscle/', candidatePath: '/lose-fat-gain-muscle/' },
);

const viewports = {
  desktop: { width: 1440, height: 1000, tolerance: 1 },
  mobile: { width: 390, height: 844, tolerance: 2 },
};

const settle = async (page, url) => {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  if (response?.status() !== 200) throw new Error(`${url} returned ${response?.status()}`);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    for (const image of images) image.loading = 'eager';
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    window.scrollTo(0, 0);
  });
};

const browser = await chromium.launch({ headless: true });
const results = [];
const failures = [];

try {
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    const outputDirectory = path.join(evidenceRoot, 'side-by-side', viewportName);
    await mkdir(outputDirectory, { recursive: true });

    for (const route of routes) {
      const context = await browser.newContext({ viewport });
      const legacyPage = await context.newPage();
      const candidatePage = await context.newPage();
      await Promise.all([
        settle(legacyPage, `${legacyOrigin}${route.legacyPath}`),
        settle(candidatePage, `${candidateOrigin}${route.candidatePath}`),
      ]);

      const [legacyHeight, candidateHeight] = await Promise.all([
        legacyPage.evaluate(() => document.documentElement.scrollHeight),
        candidatePage.evaluate(() => document.documentElement.scrollHeight),
      ]);
      const delta = candidateHeight - legacyHeight;
      results.push({ route: route.candidatePath, viewport: viewportName, legacyHeight, candidateHeight, delta });

      const [legacyPng, candidatePng] = await Promise.all([
        legacyPage.screenshot({ fullPage: true, animations: 'disabled' }),
        candidatePage.screenshot({ fullPage: true, animations: 'disabled' }),
      ]);
      const evidenceHeight = Math.max(
        (await sharp(legacyPng).metadata()).height ?? legacyHeight,
        (await sharp(candidatePng).metadata()).height ?? candidateHeight,
      );
      await sharp({
        create: {
          width: viewport.width * 2,
          height: evidenceHeight,
          channels: 4,
          background: '#ffffff',
        },
      }).composite([
        { input: legacyPng, left: 0, top: 0 },
        { input: candidatePng, left: viewport.width, top: 0 },
      ]).png().toFile(path.join(outputDirectory, `${route.name}.png`));
      await context.close();

      if (Math.abs(delta) > viewport.tolerance) {
        failures.push(`${route.candidatePath} ${viewportName}: ${delta}px (tolerance ${viewport.tolerance}px)`);
      }
    }
  }
} finally {
  await browser.close();
}

await writeFile(path.join(evidenceRoot, 'document-heights.json'), `${JSON.stringify(results, null, 2)}\n`);
if (failures.length) throw new Error(`Document-height parity failed:\n${failures.join('\n')}`);
console.log(`Verified ${results.length} document-height measurements and wrote side-by-side screenshots to ${path.join(evidenceRoot, 'side-by-side')}.`);
