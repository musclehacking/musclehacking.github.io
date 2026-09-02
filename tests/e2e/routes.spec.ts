import { expect, test } from '@playwright/test';
import { routes } from '../../src/config/routes';
import { site } from '../../src/config/site';

const blogRoute = routes.find((route) => route.path === '/blog/');
const homeRoute = routes.find((route) => route.path === '/');
const supplementsRoute = routes.find((route) => route.path === '/supplements/');

if (!blogRoute) throw new Error('Missing /blog/ route registry entry.');
if (!homeRoute) throw new Error('Missing / route registry entry.');
if (!supplementsRoute) throw new Error('Missing /supplements/ route registry entry.');

for (const route of routes) {
  test(`${route.path} renders its semantic and metadata contract`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).not.toHaveText('');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${site.origin}${route.path}`);
    expect(await page.title()).not.toBe('');
  });
}

test('blog index keeps corrected metadata and the rendered legacy listing contract', async ({ page }) => {
  await page.goto(blogRoute.path);

  await expect(page).toHaveTitle(blogRoute.title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', blogRoute.description);
  await expect(page.locator('h1')).toHaveText(homeRoute.title);
  await expect(page.locator('.sidebar')).toHaveCount(1);
  await expect(page.locator('.sidebar .newsletter-form input[name="sourceUrl"]')).toHaveValue('/blog/');
});

test('supplements metadata matches its route registry contract', async ({ page }) => {
  await page.goto(supplementsRoute.path);

  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', supplementsRoute.description);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', supplementsRoute.description);
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', supplementsRoute.description);
});

test('article quotations preserve the recorded legacy geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/blog/normal');

  const quote = page.locator('.article-page .legacy-content blockquote').first();
  const quoteParagraph = quote.locator('p').first();
  const contentParagraph = page.locator('.article-page .legacy-content > p').first();

  await expect(quote).toHaveCSS('border-left-width', '3px');
  await expect(quote).toHaveCSS('border-left-style', 'solid');
  await expect(quote).toHaveCSS('margin-left', '-23px');
  await expect(quote).toHaveCSS('padding-left', '20px');
  await expect(quote).toHaveCSS('font-style', 'italic');

  const quoteTextBox = await quoteParagraph.boundingBox();
  const contentTextBox = await contentParagraph.boundingBox();
  expect(quoteTextBox).not.toBeNull();
  expect(contentTextBox).not.toBeNull();
  expect(Math.abs(quoteTextBox!.x - contentTextBox!.x)).toBeLessThanOrEqual(0.5);
});

test('mobile article lists preserve the recorded legacy rhythm and marker', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/blog/normal');

  const list = page.locator('.article-page .legacy-content > ul').first();
  const firstItem = list.locator(':scope > li').first();

  await expect(list).toHaveCSS('margin-top', '21px');
  await expect(list).toHaveCSS('padding-left', '0px');
  await expect(list).toHaveCSS('list-style-type', 'none');
  await expect(firstItem).toHaveCSS('margin-left', '30px');

  const marker = await firstItem.evaluate((item) => {
    const styles = getComputedStyle(item, '::before');
    return {
      content: styles.content,
      fontSize: styles.fontSize,
      paddingRight: styles.paddingRight,
    };
  });
  expect(marker).toEqual({ content: '"•"', fontSize: '14.4px', paddingRight: '15px' });
});

test('legacy compact article lists keep their explicit spacing exception', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/blog/breakup-energy');

  await expect(page.locator('.article-page .legacy-content > #ul-nm1')).toHaveCSS('margin-top', '10px');
  await expect(page.locator('.article-page .legacy-content > #ul-nm2')).toHaveCSS('margin-top', '10px');
});

test('canonical calculator guide receives the recorded legacy article geometry', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/calorie-calculator/');

  const guide = page.locator('.calculator-guide .legacy-content');
  const quote = guide.locator('blockquote').first();
  const list = guide.locator('> ul:not([id])').first();

  await expect(quote).toHaveCSS('border-left-width', '3px');
  await expect(quote).toHaveCSS('font-style', 'italic');
  await expect(list).toHaveCSS('margin-top', '21px');
  await expect(list).toHaveCSS('padding-left', '0px');
  await expect(list.locator(':scope > li').first()).toHaveCSS('margin-left', '30px');
  await expect(guide.locator('> #ul-nm7')).toHaveCSS('margin-top', '10px');
});

test('legacy calculator guide preserves the recorded Important callout icon', async ({ page }) => {
  await page.goto('/blog/calorie-calculator-how-to');

  const callout = page.getByRole('complementary', { name: 'Important' });
  const icon = callout.locator('.alert-title > svg.octicon.octicon-report');
  await expect(callout.locator('.alert-title')).toHaveText('Important');
  await expect(icon).toHaveAttribute('aria-hidden', 'true');
  await expect(icon).toHaveAttribute('viewBox', '0 0 16 16');
  await expect(icon).toHaveAttribute('width', '16');
  await expect(icon).toHaveAttribute('height', '16');
  await expect(icon.locator('path')).toHaveAttribute('d', 'M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z');
  await expect(callout).not.toContainText('▣');
  expect(await icon.boundingBox()).toMatchObject({ width: 16, height: 16 });
});

test('desktop longform headings preserve their legacy self-links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/lose-fat-gain-muscle/');

  const heading = page.locator('.legacy-content h2').filter({ hasText: 'Introduction (Read This)' }).first();
  await expect(heading).toHaveAttribute('id', 'introduction-read-this');
  await expect(heading.locator(':scope > a.anchorjs-link[href="#introduction-read-this"]')).toBeVisible();
});

test('confirmation page preserves the legacy desktop navigation set', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/one-last-step/');

  await expect(page.locator('header nav a[href="/join/"]')).toHaveCount(0);
});

test('confirmation page preserves the recorded mobile image geometry and content rhythm', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/one-last-step/');

  const image = page.locator('.confirmation-image');
  const firstParagraph = page.locator('.confirmation-page > p').first();
  const firstList = page.locator('.confirmation-page > ul').first();

  // Legacy 390px: the article container is 350px wide (20px gutters); the image fills it.
  await expect(image).toHaveCSS('width', '350px');
  await expect(firstParagraph).toHaveCSS('margin-top', '21px');
  await expect(firstList).toHaveCSS('margin-top', '21px');
});

test('mixed route shapes and custom 404 match the legacy contract', async ({ request }) => {
  const article = await request.get('/blog/breakup-energy');
  expect(article.status()).toBe(200);

  const articleSlash = await request.get('/blog/breakup-energy/', { maxRedirects: 0 });
  expect(articleSlash.status()).toBe(404);
  expect(await articleSlash.text()).toContain('Page not found');

  const section = await request.get('/books', { maxRedirects: 0 });
  expect(section.status()).toBe(301);
  expect(section.headers().location).toBe('/books/');

  const sectionSlash = await request.get('/books/');
  expect(sectionSlash.status()).toBe(200);

  const unknown = await request.get('/not-a-real-route');
  expect(unknown.status()).toBe(404);
  expect(await unknown.text()).toContain('Page not found');
});

test('the local Static Assets preview does not implement the external apex redirect', async ({ request }) => {
  const response = await request.get('/blog/change?baseline=1', {
    headers: { host: 'musclehacking.com' },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(200);
  expect(response.headers().location).toBeUndefined();
});

test('discovery output is production-only and feed links resolve', async ({ request }) => {
  for (const path of ['/sitemap.xml', '/feed.xml', '/robots.txt', '/llms.txt']) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).not.toContain('[object Object]');
    expect(body).not.toContain('workers.dev');
  }

  const feed = await (await request.get('/feed.xml')).text();
  const links = [...feed.matchAll(/<link>(https:\/\/www\.musclehacking\.com\/blog\/[^<]+)<\/link>/g)].map((match) => new URL(match[1]!).pathname);
  expect(links).toHaveLength(12);
  for (const path of links) expect((await request.get(path)).status()).toBe(200);
});

test('static security and cache headers are present', async ({ request }) => {
  const document = await request.get('/');
  expect(document.headers()['content-security-policy']).toContain("script-src 'self'");
  expect(document.headers()['content-security-policy']).not.toContain("script-src 'self' 'unsafe-inline'");
  expect(document.headers()['x-content-type-options']).toBe('nosniff');
  expect(document.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');

  const html = await document.text();
  const assetPath = html.match(/(?:src|href)="(\/_astro\/[^"]+\.(?:js|css))"/)?.[1];
  expect(assetPath).toBeTruthy();
  const asset = await request.get(assetPath!);
  expect(asset.headers()['cache-control']).toContain('immutable');
});
