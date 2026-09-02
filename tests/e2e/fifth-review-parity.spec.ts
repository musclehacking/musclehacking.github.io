import { expect, test } from '@playwright/test';

/*
 * Fifth human review (2 September 2026) regressions. Every expected value below
 * was measured on the audited legacy tree served from commit 9bf25d0 in the same
 * Chromium viewport, or read from the retained legacy sources (css/addon.css,
 * js/anchor.min.js, js/e-on-delay.min.js, js/eml-flt-right.js, js/one.js).
 */

const desktop = { width: 1_440, height: 1_000 };

test.describe('fifth review parity', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Desktop Chromium only.');
  });

  test('heading self-links never reach the page endings and follow the legacy AnchorJS scope', async ({ page }) => {
    await page.setViewportSize(desktop);
    await page.goto('/calorie-calculator/');
    // Legacy: `.post-body h2, #how-to-use, .post-body h3:not(#share-t,#comm-t), .post-body h4, .post-body h5`.
    await expect(page.locator('#how-to-use > .anchorjs-link')).toHaveCount(1);
    await expect(page.locator('[data-content-ending] .anchorjs-link')).toHaveCount(0);
    await expect(page.locator('.newsletter-signup .anchorjs-link')).toHaveCount(0);
    await expect(page.locator('#share-t > .anchorjs-link, #comm-t > .anchorjs-link')).toHaveCount(0);
    await expect(page.locator('.anchorjs-link')).toHaveCount(24);

    await page.goto('/supplements/');
    await expect(page.locator('.supplement-filter-heading .anchorjs-link')).toHaveCount(0);
    await expect(page.locator('[data-content-ending] .anchorjs-link')).toHaveCount(0);
    await expect(page.locator('.anchorjs-link')).toHaveCount(204);

    // The legacy calculator article never loaded anchor.js.
    await page.goto('/blog/calorie-calculator-how-to');
    await expect(page.locator('.anchorjs-link')).toHaveCount(0);
    await page.goto('/blog/best-protein-powder-for-building-muscle');
    await expect(page.locator('.anchorjs-link')).toHaveCount(17);
  });

  test('calculator copy control uses the legacy inline geometry and the shared project tooltips', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize(desktop);
    await page.goto('/calorie-calculator/');

    const geometry = await page.evaluate(() => {
      const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const heading = box('.calculator-results h3');
      const button = box('#copyB');
      const bmr = box('.calculator-energy dt');
      const share = box('.calculator-share svg');
      return {
        headingWidth: heading.width,
        buttonOffset: { x: button.left - heading.left, y: button.top - heading.top },
        buttonSize: { width: button.width, height: button.height },
        bmrOffset: bmr.top - heading.top,
        shareIconSize: { width: share.width, height: share.height },
        infoIcon: box('.calculator-info-mark img').width,
      };
    });
    // Legacy 1440px measurements: h3 96.9 wide, #copyB 32x28 at (+106.4, +7.2), BMR heading +54.8, 35px share icons.
    expect(geometry.headingWidth).toBeCloseTo(96.9, 0);
    expect(geometry.buttonOffset.x).toBeCloseTo(106.4, 0);
    expect(geometry.buttonOffset.y).toBeCloseTo(7.2, 0);
    expect(geometry.buttonSize).toEqual({ width: 32, height: 28 });
    expect(geometry.bmrOffset).toBeCloseTo(54.8, 0);
    expect(geometry.shareIconSize).toEqual({ width: 35, height: 35 });
    expect(geometry.infoIcon).toBe(18);
    await expect(page.locator('.calculator-share svg').first()).toHaveAttribute('viewBox', '0 0 951 1024');
    await expect(page.locator('.calculator-share svg').nth(1)).toHaveAttribute('viewBox', '0 0 585 1024');

    const button = page.locator('#copyB');
    const hint = page.locator('#calculator-copy-hint .project-tip-box');
    const feedback = page.locator('#calculator-copy-feedback .project-tip-box');
    await expect(hint).toHaveAttribute('data-state', 'hidden');
    await button.hover();
    await expect(hint).toBeVisible();
    await expect(hint).toHaveText('Click to Copy (reddit-style markdown)');
    await expect(hint).toHaveAttribute('data-placement', 'right');
    await expect(hint).toHaveCSS('background-image', 'linear-gradient(90deg, rgb(0, 96, 162), rgb(0, 21, 64))');
    await expect(hint).toHaveCSS('transition-property', 'transform, visibility, opacity');
    // Let the 300 ms shift-toward-extreme entrance settle before measuring the resting placement.
    await page.waitForTimeout(400);
    const hintPlacement = await page.evaluate(() => {
      const button = document.querySelector('#copyB')!.getBoundingClientRect();
      const box = document.querySelector('#calculator-copy-hint .project-tip-box')!.getBoundingClientRect();
      return { gap: box.left - button.right, centreDelta: (box.top + box.height / 2) - (button.top + button.height / 2) };
    });
    expect(hintPlacement.gap).toBeCloseTo(10, 0);
    expect(Math.abs(hintPlacement.centreDelta)).toBeLessThanOrEqual(1);

    await button.click();
    await expect(hint).toBeHidden();
    await expect(feedback).toBeVisible();
    await expect(feedback).toHaveText('Copied!');
    await expect(feedback).toHaveAttribute('data-placement', 'top');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Calories|Protein|Fat|Carbs');
    await page.waitForTimeout(400);
    const feedbackPlacement = await page.evaluate(() => {
      const button = document.querySelector('#copyB')!.getBoundingClientRect();
      const box = document.querySelector('#calculator-copy-feedback .project-tip-box')!.getBoundingClientRect();
      return { gap: button.top - box.bottom, centreDelta: (box.left + box.width / 2) - (button.left + button.width / 2) };
    });
    expect(feedbackPlacement.gap).toBeCloseTo(6, 0);
    expect(Math.abs(feedbackPlacement.centreDelta)).toBeLessThanOrEqual(1);
    // No inline "Results copied." text: the status stays screen-reader only.
    await expect(page.locator('.calculator-copy-status')).toHaveClass(/visually-hidden/);
    await expect(feedback).toBeHidden({ timeout: 2_000 });
  });

  test('calculator keeps the Bootstrap grid to 768px and the legacy mobile stack below it', async ({ page }) => {
    await page.setViewportSize({ width: 1_000, height: 900 });
    await page.goto('/calorie-calculator/');
    const wide = await page.evaluate(() => {
      const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      return { h1: box('.calculator-title-row h1'), stats: box('.calculator-panel legend'), results: box('.calculator-results h3'), shell: box('.calculator-shell') };
    });
    // Legacy at 1000px: full-width `#app-format` without a border, one-line h1, three columns.
    expect(wide.shell.width).toBe(1_000);
    expect(wide.h1.height).toBeCloseTo(44.5, 0);
    expect(wide.stats.top).toBeCloseTo(wide.results.top + 1, 0);
    expect(wide.results.left).toBeCloseTo(597.3, 0);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    const mobile = await page.evaluate(() => {
      const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const labels = [...document.querySelectorAll('.calculator-panel .calculator-field > label')].map((label) => getComputedStyle(label).fontSize);
      return {
        diet: box('.calculator-mode-row label'),
        stats: box('.calculator-panel legend'),
        age: box('.calculator-panel .calculator-field label'),
        suffix: box('.calculator-input-group-std'),
        labels: [...new Set(labels)],
        results: box('.calculator-results h3'),
        copy: box('#copyB'),
        share: getComputedStyle(document.querySelector('.calculator-share p')!).fontSize,
      };
    });
    // Legacy 390px: Diet heading at y=287.1, Stats at 432.2, Age label at 476.3, 62px "%" suffix, 18px labels.
    expect(mobile.diet.top).toBeCloseTo(287.1, 0);
    expect(mobile.stats.top).toBeCloseTo(432.2, 0);
    expect(mobile.age.top).toBeCloseTo(476.3, 0);
    expect(mobile.suffix.width).toBe(62);
    expect(mobile.labels).toEqual(['18px']);
    expect(mobile.copy.top - mobile.results.top).toBeCloseTo(7.1, 0);
    expect(mobile.share).toBe('18px');
  });

  test('calculator prompts follow the legacy 660px scroll and 30 second timers', async ({ page }) => {
    await page.setViewportSize(desktop);
    await page.clock.install();
    await page.goto('/calorie-calculator/');
    const floating = page.locator('[data-calculator-newsletter-floating]');
    await page.evaluate(() => scrollTo(0, 660));
    await expect(floating).toBeHidden();
    await page.evaluate(() => scrollTo(0, 661));
    await expect(floating).toBeVisible();

    const dialog = page.locator('[data-calculator-newsletter-exit]');
    await page.mouse.move(700, 500);
    await page.mouse.move(700, -1);
    await page.clock.fastForward(29_500);
    await expect(dialog).toBeHidden();
    await page.clock.fastForward(1_000);
    await expect(dialog).toBeVisible();
    // The overlay scales in over 0.3 s of real time; measure the settled geometry.
    await page.waitForTimeout(500);
    const panel = dialog.locator('[data-calculator-newsletter-exit-panel]');
    const layout = await panel.evaluate((node) => {
      const panelBox = node.getBoundingClientRect();
      const heading = node.querySelector('h2')!.getBoundingClientRect();
      const input = node.querySelector('input[type="email"]')!.getBoundingClientRect();
      const close = node.querySelector('.newsletter-prompt-close')!.getBoundingClientRect();
      return { width: panelBox.width, headingTop: heading.top - panelBox.top, inputTop: input.top - panelBox.top, inputHeight: input.height, closeTop: close.top - panelBox.top, closeRight: panelBox.right - close.right };
    });
    // Legacy `.n-lett`: 700px panel, heading 35px below the top, 51.9px controls 161px below, hide button at 5px/15px.
    expect(layout.width).toBe(700);
    expect(layout.headingTop).toBeCloseTo(35, 0);
    expect(layout.inputTop).toBeCloseTo(161, 0);
    expect(layout.inputHeight).toBeCloseTo(51.9, 0);
    expect(layout.closeTop).toBeCloseTo(5, 0);
    expect(layout.closeRight).toBeCloseTo(15, 0);
    expect(await page.evaluate(() => document.activeElement?.className)).toContain('calculator-newsletter-exit');
    await expect(panel.locator('.newsletter-prompt-close')).not.toBeFocused();
  });

  test('bottom newsletter, callout links, and page rhythm match the legacy measurements', async ({ page }) => {
    await page.setViewportSize(desktop);
    await page.goto('/supplements/');
    // The intro callout "here" link uses the legacy `.markdown-alert a` inset underline.
    const here = page.locator('.supplements-page > .supplement-note a');
    await expect(here).toHaveCSS('box-shadow', 'rgb(32, 101, 147) 0px -2px 0px 0px inset');
    await expect(here).toHaveCSS('color', 'rgba(0, 0, 0, 0.84)');
    await expect(here).toHaveCSS('text-decoration-line', 'none');
    // Legacy supplement h4/h5 are 28px `.normalize-headings` headings.
    await expect(page.locator('#creatine .supplement-detail h4').first()).toHaveCSS('font-size', '28px');
    await expect(page.locator('#creatine .supplement-detail h5').first()).toHaveCSS('font-size', '28px');
    await expect(page.locator('#all-references ~ * .ref, [data-supplement-support] .ref').first()).toHaveCSS('font-size', '17px');

    await page.goto('/blog/what-is-intermittent-fasting');
    const signup = await page.locator('.newsletter-signup').evaluate((section) => {
      const box = section.getBoundingClientRect();
      const heading = section.querySelector('h2')!.getBoundingClientRect();
      const input = section.querySelector('input[type="email"]')!.getBoundingClientRect();
      const button = section.querySelector('button')!;
      return { height: box.height, headingTop: heading.top - box.top, inputHeight: input.height, buttonWeight: getComputedStyle(button).fontWeight, inputRadius: getComputedStyle(section.querySelector('input[type="email"]')!).borderRadius };
    });
    // Legacy `#em-opt`: 250.8px tall, heading 30.2px below the top (1px border, 19.2px padding, 10px margin),
    // 51.9px controls, 400-weight button, 5px radii.
    expect(signup.height).toBeCloseTo(250.8, 0);
    expect(signup.headingTop).toBeCloseTo(30.2, 0);
    expect(signup.inputHeight).toBeCloseTo(51.9, 0);
    expect(signup.buttonWeight).toBe('400');
    expect(signup.inputRadius).toBe('5px 0px 0px 5px');

    // Legacy Chromium rendering never enables ligatures (only the -moz- prefixed property exists).
    expect(await page.evaluate(() => getComputedStyle(document.body).fontFeatureSettings)).toBe('normal');
    // Legacy heading-adjacent rhythm: h2/h3 + p 8px, h4/h5 + p 6px, pictures 29px.
    const rhythm = await page.evaluate(() => {
      const first = (selector: string) => getComputedStyle(document.querySelector(selector)!).marginTop;
      return { afterH3: first('.legacy-content h3 + p'), picture: first('.legacy-content picture'), figcap: first('.legacy-content > p.figurecap') };
    });
    expect(rhythm).toEqual({ afterH3: '8px', picture: '29px', figcap: '0px' });
    // No page-level bottom padding: legacy documents end at the navigation margin.
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('main')!).paddingBottom)).toBe('0px');
  });

  test('calculator guide is sourced from the legacy calculator page', async ({ page }) => {
    await page.setViewportSize(desktop);
    await page.goto('/calorie-calculator/');
    const headings = await page.locator('.calculator-guide .legacy-content :is(h3, h4)').allTextContents();
    expect(headings).toEqual([
      'Diet', 'Standard', 'Leangains', 'Keto', 'Stats', 'Modifiers', 'Activity Level', 'Goal', 'How Much Protein?',
      'Fat/Carb Calorie Split', 'Results', 'BMR', 'TDEE', 'Daily Calories and Macros', 'Estimated Weight Loss per Week',
      'Leangains Calculator', 'Age', 'Height', 'Body Fat', 'Muscle Mass', 'Goal (Leangains specific)', 'Steps',
      'How Much Protein? (Leangains specific)',
    ]);
    await expect(page.locator('#diet')).toHaveCount(1);
    await expect(page.locator('.calculator-guide .legacy-content')).toContainText('Note that although the Leangains approach to weight lifting involves intermittent fasting');
    // Legacy `#how-to-use` sits exactly 30px below `#app-format`.
    const gap = await page.evaluate(() => document.querySelector('#how-to-use')!.getBoundingClientRect().top - document.querySelector('.calculator-shell')!.getBoundingClientRect().bottom);
    expect(gap).toBeCloseTo(30, 0);
  });
});
