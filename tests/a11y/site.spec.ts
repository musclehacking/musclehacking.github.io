import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/blog/breakup-energy', '/calorie-calculator/', '/supplements/', '/join/', '/not-a-real-route']) {
  test(`${path} has no unapproved serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
    // AUD-07 (4 September 2026) closed every inherited contrast exception. The human
    // approved GitHub's light-mode callout palette (A11Y-01) and an AA-safe supplement
    // filter, information, and evidence-badge palette (A11Y-02), so no `color-contrast`
    // result is expected on any audited route and none is excused here.
    expect(seriousViolations).toEqual([]);
  });
}
