import { expect, test } from '@playwright/test';

/*
 * Regressions for the 23 September 2026 hosted review of /supplements/ against the legacy
 * tree. Each case pins the legacy value the candidate previously missed.
 */

const isMobile = () => test.info().project.name === 'mobile-chromium';

// Legacy octicon "report" path from `supplements/index.html`.
const IMPORTANT_ICON_PATH = 'M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z';

test('heading link icon never depends on the icon font loading', async ({ page }) => {
  test.skip(isMobile(), 'Heading links are hidden below 800px, as in legacy.');
  // The reported empty square is the missing-glyph box drawn when this font fails.
  await page.route('**/fonts/anchorjs-icons.ttf', (route) => route.abort());
  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/supplements/');

  const link = page.locator('#creatine .anchorjs-link').first();
  await expect(link).toBeVisible();
  const icon = await link.evaluate((element) => {
    const glyph = getComputedStyle(element, '::after');
    const mask = getComputedStyle(element, '::before');
    return {
      glyphFill: glyph.webkitTextFillColor,
      mask: mask.maskImage || mask.webkitMaskImage,
      width: parseFloat(mask.width),
      background: mask.backgroundColor,
    };
  });
  // The font glyph (or its missing-glyph box) is never painted; the visible icon is an SVG mask.
  expect(icon.glyphFill).toBe('rgba(0, 0, 0, 0)');
  expect(icon.mask).toContain('data:image/svg+xml');
  expect(icon.width).toBeGreaterThan(0);
  expect(icon.background).toBe('rgb(167, 167, 167)');
});

test('glossary terms read as prose links and open a titled popover without reflow', async ({ page }) => {
  await page.setViewportSize(isMobile() ? { width: 390, height: 844 } : { width: 1_440, height: 1_000 });
  await page.goto('/supplements/');

  const trigger = page.locator('#creatine button.supplement-term', { hasText: 'ADP' }).first();
  const item = trigger.locator('xpath=ancestor::li[1]');
  const before = (await item.boundingBox())!.height;
  const style = await trigger.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { font: computed.fontFamily, size: computed.fontSize, background: computed.backgroundColor, height: element.getBoundingClientRect().height };
  });
  expect(style.font.startsWith('muscle2')).toBe(true);
  expect(style.size).toBe(isMobile() ? '18px' : '21px');
  expect(style.background).toBe('rgba(0, 0, 0, 0)');
  expect(style.height).toBeLessThanOrEqual(26);

  await trigger.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  // Touch devices tap; a mouse uses the legacy hover trigger.
  if (test.info().project.use.hasTouch) await trigger.tap();
  else await trigger.hover();
  const panel = page.locator(`#${await trigger.getAttribute('aria-controls')}`);
  await expect(panel).toBeVisible();
  await expect(panel.locator('.evidence-help-title')).toHaveText('What is ADP?');
  await expect(panel.locator('.evidence-help-body')).toContainText('ADP stands for Adenosine Diphosphate.');
  await expect(panel).toHaveCSS('position', isMobile() ? 'fixed' : 'absolute');
  expect((await item.boundingBox())!.height).toBe(before);
});

test('the Testosterone Important note uses the legacy icon and two paragraphs', async ({ page }) => {
  await page.goto('/supplements/');
  await page.getByRole('button', { name: 'Testosterone', exact: true }).click();

  const note = page.locator('[data-supplement-category-note]');
  await expect(note.locator('[data-supplement-category-note-label]')).toHaveText('Important');
  await expect(note.locator('[data-supplement-category-note-icon]')).toHaveAttribute('d', IMPORTANT_ICON_PATH);
  const text = note.locator('[data-supplement-category-note-text]');
  await expect(text.locator('br')).toHaveCount(2);
  expect(await text.evaluate((element) => element.lastChild?.textContent)).toMatch(/^Supplementing with these minerals/u);
});

test('the side table of contents marks the current section like Bootstrap ScrollSpy', async ({ page }) => {
  test.skip(isMobile(), 'The side table of contents is hidden on narrow screens, as in legacy.');
  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/supplements/');

  const active = page.locator('[data-supplement-toc] a.active');
  await expect(active).toHaveCount(0);

  await page.evaluate(() => window.scrollTo({ top: document.getElementById('whey-protein')!.getBoundingClientRect().top + window.scrollY + 20, behavior: 'instant' }));
  await expect(active).toHaveCount(1);
  await expect(active).toHaveText('Whey Protein');
  await expect(active).toHaveCSS('color', 'rgb(0, 0, 0)');
  await expect(active).toHaveCSS('border-left', '3px solid rgb(31, 97, 141)');

  // Text keeps its legacy x position despite the added rail.
  const inactive = page.locator('[data-supplement-toc] a:not(.active)').first();
  const textX = await inactive.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().left;
  });
  expect(textX).toBeCloseTo(12, 0);

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect(active).toHaveText('References');
});

test('mobile byline and evidence badge inherit the 18px legacy body size', async ({ page }) => {
  test.skip(!isMobile(), 'Mobile-only sizes.');
  await page.goto('/supplements/');
  await expect(page.locator('.supplements-page .byline')).toHaveCSS('font-size', '18px');
  await expect(page.locator('#creatine .evidence-badge')).toHaveCSS('font-size', '16.2px');
});

test('accented letters and symbols render from muscle2, not a fallback font', async ({ page }) => {
  await page.goto('/supplements/');
  const widths = await page.evaluate(async () => {
    const sample = 'é ó ł ñ – × ½';
    for (const style of ['', 'bold ', 'italic ']) await document.fonts.load(`${style}21px muscle2`, sample);
    const context = document.createElement('canvas').getContext('2d')!;
    const measure = (font: string) => {
      context.font = font;
      return context.measureText(sample).width;
    };
    // If muscle2 covers the glyphs, the fallback family after it cannot change the width.
    return ['', 'bold ', 'italic '].map((style) => [
      measure(`${style}21px muscle2, monospace`),
      measure(`${style}21px muscle2, cursive`),
    ]);
  });
  for (const [withMonospace, withCursive] of widths) expect(withMonospace).toBe(withCursive);
});
