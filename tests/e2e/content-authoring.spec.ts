import { expect, test } from '@playwright/test';
import { routes } from '../../src/config/routes';

const articleRoutes = [
  ...routes.filter((route) => route.owner === 'blog').map((route) => route.path),
  '/books/',
  '/lose-fat-gain-muscle/',
];

for (const path of articleRoutes) {
  test(`${path} renders through the shared authored-content layout`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.byline')).toHaveCount(1);
    await expect(page.locator('.hero-image')).toHaveCount(1);
    await expect(page.locator('[data-content-ending]')).toHaveCount(1);
    await expect(page.locator('.markdown-alert')).toHaveCount(0);
  });
}

test('books renders its authored callout component', async ({ page }) => {
  await page.goto('/books/');
  await expect(page.locator('.project-callout')).toHaveCount(1);
});

test('calculator article keeps the notice before its hero and disables heading links', async ({ page }) => {
  await page.goto('/blog/calorie-calculator-how-to');

  const callout = page.locator('.project-callout--important');
  const hero = page.locator('.hero-image');
  await expect(callout).toHaveCount(1);
  await expect(hero).toHaveCount(1);
  expect(await page.evaluate(() => {
    const calloutElement = document.querySelector('.project-callout--important');
    const heroElement = document.querySelector('.hero-image');
    return Boolean(calloutElement && heroElement && (
      calloutElement.compareDocumentPosition(heroElement) & Node.DOCUMENT_POSITION_FOLLOWING
    ));
  })).toBe(true);
  await expect(page.locator('[data-heading-links="off"]')).toHaveCount(1);
});
