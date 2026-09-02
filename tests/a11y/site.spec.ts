import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/blog/breakup-energy', '/calorie-calculator/', '/supplements/', '/join/', '/not-a-real-route']) {
  test(`${path} has no unapproved serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
    const unapprovedViolations = seriousViolations.filter((violation) => {
      if (violation.id !== 'color-contrast') return true;

      // UI-02 and UI-03 require the exact retained legacy palette. Keep the
      // inherited contrast exceptions limited to the callout title colour
      // (#2F81F7/#A371F7/#D29922 from legacy addon.css) and, on the supplement
      // route only, the filter and evidence controls covered by that parity rule.
      return violation.nodes.some((node) => node.target.some((target) => {
        const selector = String(target);
        if (selector.endsWith('.alert-title') || selector.startsWith('span[data-supplement-category-note-label')) return false;
        if (path !== '/supplements/') return true;
        return !selector.startsWith('button[data-supplement-filter=')
          && !selector.startsWith('button[aria-controls="evidence-help-');
      }));
    });
    expect(unapprovedViolations).toEqual([]);
  });
}
