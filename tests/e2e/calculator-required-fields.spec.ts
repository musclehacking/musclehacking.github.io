import { expect, test } from '@playwright/test';

test('cleared required calculator fields invalidate every affected mode', async ({ page }) => {
  const cases = [
    { mode: '', selector: '#calculator-calorie-adjustment' },
    { mode: '', selector: '#calculator-fat-split' },
    { mode: '?leangains', selector: '#calculator-steps' },
    { mode: '?leangains', selector: '#calculator-fat-split' },
    { mode: '?keto', selector: '#calculator-calorie-adjustment' },
    { mode: '?keto', selector: '#calculator-keto-carbs' },
  ] as const;

  for (const requiredField of cases) {
    await page.goto(`/calorie-calculator/${requiredField.mode}`);
    const input = page.locator(requiredField.selector);

    await input.fill('');

    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('.calculator-error')).toContainText('Enter a number');
    await expect(page.getByRole('button', { name: 'Copy' })).toBeDisabled();
  }
});
