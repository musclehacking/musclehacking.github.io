import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('a keyboard reader can skip repeated navigation and reach the main content', async ({ page }) => {
  await page.goto('/blog/breakup-energy');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test.describe('static homepage', () => {
  // Delivery policy follows measured loading, rather than a fixed request count.
  test.use({ javaScriptEnabled: false });
  test('the production homepage retains its typography without JavaScript', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.locator('h1').evaluate((heading) => getComputedStyle(heading).fontFamily)).toContain('muscle2');
    expect(await page.evaluate(() => document.fonts.check('20px muscle2'))).toBe(true);
  });
});

test('article videos defer their provider requests until near the reading position', async ({ page }) => {
  await page.route('**/*youtube-nocookie.com/**', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Video fixture</title>' }));
  await page.goto('/blog/reject-modernity-embrace-masculinity');
  const frames = page.locator('iframe.video');
  expect(await frames.count()).toBeGreaterThan(0);
  for (const frame of await frames.all()) await expect(frame).toHaveAttribute('loading', 'lazy');
  await frames.first().scrollIntoViewIfNeeded();
  await expect(frames.first()).toBeVisible();
});

test('article table illustrations wait until they approach the reading position', async ({ page }) => {
  await page.goto('/blog/healthy-organic-post');
  const images = page.locator('.legacy-content table img');
  expect(await images.count()).toBeGreaterThan(0);
  for (const image of await images.all()) await expect(image).toHaveAttribute('loading', 'lazy');
});

test('supplement contents avoid a full heading scan on each scroll frame', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/supplements/');
  await expect(page.locator('[data-supplement-filter="muscle-growth"]')).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => document.fonts.ready);
  const counts = await page.evaluate(async () => {
    const rect = Element.prototype.getBoundingClientRect;
    const rects = Element.prototype.getClientRects;
    let reads = 0;
    const isTarget = (element: Element) => element.matches('[data-supplement-id], [data-supplement-support]');
    Element.prototype.getBoundingClientRect = function () { if (isTarget(this)) reads += 1; return rect.call(this); };
    Element.prototype.getClientRects = function () { if (isTarget(this)) reads += 1; return rects.call(this); };
    try {
      for (let index = 0; index < 30; index += 1) {
        window.scrollTo(0, 1400 + index * 10);
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      }
      return reads;
    } finally {
      Element.prototype.getBoundingClientRect = rect;
      Element.prototype.getClientRects = rects;
    }
  });
  console.log(`Supplement target reads across 30 nearby scroll frames: ${counts}`);
  expect(counts).toBeLessThan(150);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.supplement-toc')).toBeHidden();
  // Hidden mobile contents have no visual update to perform while simply reading.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  const hiddenReads = await page.evaluate(async () => {
    const original = Element.prototype.getBoundingClientRect;
    let reads = 0;
    Element.prototype.getBoundingClientRect = function () {
      if (this.matches('[data-supplement-id], [data-supplement-support]')) reads += 1;
      return original.call(this);
    };
    try {
      for (let step = 0; step < 10; step += 1) {
        scrollBy(0, 10);
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      }
      return reads;
    } finally { Element.prototype.getBoundingClientRect = original; }
  });
  expect(hiddenReads).toBe(0);
});

test('newsletter forms describe an explicit subscription action without automatic submission', async ({ page }) => {
  await page.goto('/calorie-calculator/');
  const names: string[] = [];
  for (const form of await page.locator('form.newsletter-form').all()) {
    const name = await form.getAttribute('toolname');
    expect(name).toBeTruthy();
    expect(await form.getAttribute('tooldescription')).toBeTruthy();
    expect(await form.getAttribute('toolautosubmit')).toBeNull();
    names.push(name!);
  }
  expect(new Set(names).size).toBe(names.length);
});

test('the newsletter dialog keeps the reading position until each close path releases scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install();
  for (const close of ['escape', 'button', 'backdrop']) {
    await page.goto('/calorie-calculator/');
    await expect(page.locator('#how-to-use .anchorjs-link')).toHaveCount(1);
    await page.evaluate(() => scrollTo(0, 800));
    await expect(page.locator('[data-calculator-newsletter-floating]')).toBeVisible();
    await page.clock.fastForward(30_400);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    // Chromium also locks implicitly; the explicit root lock protects WebKit readers.
    await expect(page.locator('html')).toHaveCSS('overflow-y', 'hidden');
    const before = await page.evaluate(() => scrollY);
    await page.mouse.move(5, 100);
    await page.mouse.wheel(0, 400);
    await page.clock.runFor(100);
    expect(await page.evaluate(() => scrollY)).toBe(before);
    if (close === 'escape') await page.keyboard.press('Escape');
    else if (close === 'button') await dialog.getByRole('button', { name: 'Close newsletter prompt' }).click();
    else await page.mouse.click(5, 100);
    await page.clock.runFor(400);
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('html')).not.toHaveCSS('overflow-y', 'hidden');
    await page.mouse.move(700, 500);
    await page.mouse.wheel(0, 400);
    await page.clock.runFor(100);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  }
});

test('the static IndexNow proof is readable by GET and HEAD without becoming a page', async ({ request }) => {
  const source = readFileSync(new URL('../../public/indexnow.txt', import.meta.url), 'utf8');
  expect(source.trim()).toMatch(/^[a-f0-9]{32}$/);
  const get = await request.get('/indexnow.txt', { maxRedirects: 0 });
  expect(get.status()).toBe(200);
  expect(get.headers()['content-type']).toMatch(/^text\/plain(?:;|$)/);
  expect(await get.text()).toBe(source);
  const head = await request.head('/indexnow.txt', { maxRedirects: 0 });
  expect(head.status()).toBe(200);
  expect(head.headers()['content-type']).toBe(get.headers()['content-type']);
  expect((await head.body()).length).toBe(0);
  for (const path of ['/sitemap.xml', '/llms.txt']) {
    expect(await (await request.get(path)).text()).not.toContain('/indexnow.txt');
  }
});
