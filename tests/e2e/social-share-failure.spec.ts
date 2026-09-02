import { expect, test } from '@playwright/test';

test('copy-link total failure reports the error, cleans up, and uses the canonical URL fallback', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'The mobile share rail intentionally omits the copy control.');

  await page.goto('/blog/breakup-energy');
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));

  const copyLink = page.locator('[data-copy-page-link]');
  const canonicalUrl = await copyLink.getAttribute('href');
  expect(canonicalUrl).toBe('https://www.musclehacking.com/blog/breakup-energy');

  // Keep this regression local while preserving the handler's real anchor-driven fallback path.
  await copyLink.evaluate((link) => link.setAttribute('href', '#copy-fallback'));

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('Clipboard unavailable')) },
    });
    document.execCommand = () => {
      throw new Error('Legacy copy unavailable');
    };
  });

  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));
  await copyLink.click();

  await expect(page.locator('#l-box [data-copy-page-feedback]')).toHaveText('Copy Failed');
  await expect(copyLink).toHaveAttribute('data-copied', 'false');
  await expect(page.locator('body > textarea')).toHaveCount(0);
  expect(new URL(page.url()).hash).toBe('#copy-fallback');
  expect(pageErrors).toEqual([]);
});
