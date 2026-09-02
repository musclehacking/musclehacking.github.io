import { expect, test } from '@playwright/test';

test('a touchscreen tap leaves the evidence popover open', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Touch activation requires the touch-enabled browser project.');

  await page.goto('/supplements/');

  const badge = page.locator('[data-supplement-evidence]:visible').first();
  const panelId = await badge.getAttribute('aria-controls');
  expect(panelId).toBeTruthy();

  await badge.tap();

  await expect(badge).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator(`#${panelId}`)).toBeVisible();

  await page.getByRole('heading', { level: 1 }).tap();

  await expect(badge).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator(`#${panelId}`)).toBeHidden();
});
