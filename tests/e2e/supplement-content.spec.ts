import { expect, test } from '@playwright/test';

test('supplement research and citation targets remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/supplements/');

  await expect(page.locator('[data-supplement-filter][aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator('[data-supplement-id]:visible')).toHaveCount(19);
  await expect(page.locator('[data-supplement-evidence]:visible')).toHaveCount(0);
  await expect(page.locator('#creatine-primary-benefits')).toHaveText('Primary Benefits');
  await expect(page.locator('#creatine a[href="#creatine-ref-1"]').first()).toBeVisible();
  await expect(page.locator('#creatine-ref-1 a[href^="https://pubmed.ncbi.nlm.nih.gov/"]')).toBeVisible();
  await expect(page.locator('#all-references a')).not.toHaveCount(0);

  const missingCitationTargets = await page.locator('a.inl-ref[href^="#"]').evaluateAll((links) =>
    links
      .map((link) => link.getAttribute('href'))
      .filter((href): href is string => Boolean(href))
      .filter((href) => document.getElementById(href.slice(1)) === null),
  );
  expect(missingCitationTargets).toEqual([]);

  await context.close();
});

test('supplement term help exposes the recorded explanation', async ({ page }) => {
  await page.goto('/supplements/');

  const trigger = page.locator('#creatine button.supplement-term', { hasText: 'ADP' }).first();
  await trigger.click();

  const panelId = await trigger.getAttribute('aria-controls');
  expect(panelId).not.toBeNull();
  await expect(page.locator(`#${panelId}`)).toContainText('ADP stands for Adenosine Diphosphate.');
});
