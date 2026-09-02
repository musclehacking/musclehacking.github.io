import { expect, test } from '@playwright/test';
import { routes } from '../../src/config/routes';

for (const route of routes) {
  test(`${route.path} emits the correct Open Graph type`, async ({ page }) => {
    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      'content',
      route.owner === 'blog' ? 'article' : 'website',
    );
  });
}
