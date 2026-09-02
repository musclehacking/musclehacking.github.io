import { expect, test } from '@playwright/test';

test('desktop calculator preserves the recorded legacy control geometry and styling', async ({ page }) => {
  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/calorie-calculator/');

  const geometry = await page.locator('.calculator-shell').evaluate((shell) => {
    const rect = (element: Element | null) => {
      if (!(element instanceof HTMLElement)) throw new Error('Missing calculator element.');
      const bounds = element.getBoundingClientRect();
      return {
        height: bounds.height,
        width: bounds.width,
        x: bounds.x,
        y: bounds.y,
      };
    };
    const female = shell.querySelector('.calculator-segmented label:nth-child(2) span');
    const range = shell.querySelector('input[type="range"]');
    const weightSuffix = shell.querySelector('#calculator-weight + span');
    const copyButton = shell.querySelector<HTMLButtonElement>('.calculator-results-heading button');
    const guideHeading = document.querySelector('.calculator-guide h2');

    return {
      copyButton: {
        ...rect(copyButton),
        borderRadius: copyButton ? getComputedStyle(copyButton).borderRadius : '',
        hasSvg: Boolean(copyButton?.querySelector('svg')),
      },
      female: {
        ...rect(female),
        background: female ? getComputedStyle(female).backgroundColor : '',
      },
      guideGap: rect(guideHeading).y - rect(shell).height - rect(shell).y,
      range: rect(range),
      shell: rect(shell),
      weightSuffix: rect(weightSuffix),
    };
  });

  expect(geometry.shell).toMatchObject({ x: 220, y: 80, width: 1_000 });
  expect(geometry.shell.height).toBeCloseTo(692, 0);
  // Legacy: `#how-to-use { margin-top: 30px }` is the only gap below `#app-format`.
  expect(geometry.guideGap).toBeCloseTo(30, 0);
  // Legacy vue-slider track: the 298.66px Modifiers column minus the 8px wrapper padding.
  expect(geometry.range.width).toBeCloseTo(282.7, 0);
  expect(geometry.range.height).toBe(6);
  expect(geometry.weightSuffix.width).toBeCloseTo(47, 0);
  expect(geometry.female.background).toBe('rgb(54, 124, 168)');
  expect(geometry.copyButton).toMatchObject({ width: 32, height: 28, borderRadius: '7px' });
  expect(geometry.copyButton.hasSvg).toBe(true);
});

test('calculator guide heading receives its recorded desktop self-link', async ({ page }) => {
  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/calorie-calculator/');

  const heading = page.getByRole('heading', {
    level: 2,
    name: 'Calorie & Macro Calculator: How To Use It',
  });
  await expect(heading).toHaveAttribute('id', 'how-to-use');
  await expect(heading.locator(':scope > a.anchorjs-link[href="#how-to-use"]')).toBeVisible();
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 810, height: 1_080 },
  { width: 900, height: 1_080 },
]) {
  test(`calculator controls fit within a ${viewport.width} pixel viewport`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/calorie-calculator/');

    const layout = await page.locator('.calculator-shell').evaluate((shell) => {
      const viewportWidth = document.documentElement.clientWidth;
      const controls = Array.from(
        shell.querySelectorAll<HTMLElement>('input:not([type="hidden"]), select, button'),
      ).filter((control) => control.getClientRects().length > 0);

      return {
        documentWidth: document.documentElement.scrollWidth,
        overflowingElements: Array.from(document.body.querySelectorAll<HTMLElement>('*'))
          .filter((element) => {
            const bounds = element.getBoundingClientRect();
            return element.getClientRects().length > 0 && bounds.right > viewportWidth;
          })
          .map((element) => `${element.tagName}.${element.className}`),
        overflowingControls: controls
          .filter((control) => {
            const bounds = control.getBoundingClientRect();
            return bounds.left < 0 || bounds.right > viewportWidth;
          })
          .map((control) => control.getAttribute('aria-label') ?? control.id ?? control.tagName),
        viewportWidth,
      };
    });

    expect(layout.documentWidth, JSON.stringify(layout, null, 2)).toBeLessThanOrEqual(
      layout.viewportWidth,
    );
    expect(layout.overflowingControls).toEqual([]);
  });
}
