import { readFileSync } from 'node:fs';

import { expect, test, type Locator, type Page } from '@playwright/test';

interface SupplementFixture {
  filters: Record<string, string[]>;
}

const supplementFixture = JSON.parse(
  readFileSync(
    new URL('../fixtures/legacy/supplement-filters.json', import.meta.url),
    'utf8',
  ),
) as SupplementFixture;

const filterLabels: Record<string, string> = {
  'muscle-growth': 'Muscle Growth',
  sleep: 'Sleep',
  'joint-health': 'Joint Health',
  'bone-health': 'Bone Health',
  testosterone: 'Testosterone',
  focus: 'Focus',
  'brain-function': 'Brain Function',
  'insulin-sensitivity': 'Insulin Sensitivity',
  longevity: 'Longevity',
  'show-all': 'Show All',
};

async function calculatorResult(page: Page): Promise<string> {
  return page.locator('.calculator-results').innerText();
}

async function expectResultChange(
  page: Page,
  control: Locator,
  action: () => Promise<unknown>,
): Promise<void> {
  const before = await calculatorResult(page);
  await action();
  await expect(control).not.toHaveAttribute('aria-invalid', 'true');
  await expect.poll(() => calculatorResult(page)).not.toBe(before);
  await expect(page.locator('.calculator-results')).not.toContainText(/NaN|Infinity/);
}

test('every calculator control participates in Standard, LeanGains, and keto results', async ({ page }) => {
  await page.goto('/calorie-calculator/');

  const standardActions = [
    ['#calculator-age', () => page.locator('#calculator-age').fill('46')],
    ['#calculator-weight', () => page.locator('#calculator-weight').fill('86')],
    ['#calculator-height', () => page.locator('#calculator-height').fill('187')],
    ['input[value="female"]', () => page.locator('input[value="female"]').check()],
    ['#calculator-activity', () => page.locator('#calculator-activity').selectOption('1.55')],
    ['#calculator-goal', () => page.locator('#calculator-goal').selectOption('0')],
    ['#calculator-calorie-adjustment', () => page.locator('#calculator-calorie-adjustment').fill('-15')],
    ['#calculator-standard-protein', () => page.locator('#calculator-standard-protein').selectOption('0.82')],
    ['#calculator-fat-split', () => page.locator('#calculator-fat-split').fill('40')],
  ] as const;

  for (const [selector, action] of standardActions) {
    await page.goto('/calorie-calculator/');
    await expectResultChange(page, page.locator(selector), action);
  }

  await page.goto('/calorie-calculator/?leangains');
  const leangainsActions = [
    ['#calculator-age', () => page.locator('#calculator-age').fill('46')],
    ['#calculator-weight', () => page.locator('#calculator-weight').fill('86')],
    ['#calculator-height', () => page.locator('#calculator-height').fill('187')],
    ['input[value="female"]', () => page.locator('input[value="female"]').check()],
    ['#calculator-body-fat', () => page.locator('#calculator-body-fat').selectOption('-0.5')],
    ['#calculator-muscle-mass', () => page.locator('#calculator-muscle-mass').selectOption('1')],
    ['#calculator-lg-goal', () => page.locator('#calculator-lg-goal').selectOption('maintain')],
    ['#calculator-steps', () => page.locator('#calculator-steps').fill('10000')],
    ['#calculator-lg-protein', () => page.locator('#calculator-lg-protein').fill('45')],
    ['#calculator-fat-split', () => page.locator('#calculator-fat-split').fill('40')],
  ] as const;

  for (const [selector, action] of leangainsActions) {
    await page.goto('/calorie-calculator/?leangains');
    await expectResultChange(page, page.locator(selector), action);
  }

  await page.goto('/calorie-calculator/?keto');
  const ketoActions = [
    ['#calculator-age', () => page.locator('#calculator-age').fill('31')],
    ['#calculator-weight', () => page.locator('#calculator-weight').fill('86')],
    ['#calculator-height', () => page.locator('#calculator-height').fill('187')],
    ['input[value="female"]', () => page.locator('input[value="female"]').check()],
    ['#calculator-activity', () => page.locator('#calculator-activity').selectOption('1.55')],
    ['#calculator-goal', () => page.locator('#calculator-goal').selectOption('0')],
    ['#calculator-calorie-adjustment', () => page.locator('#calculator-calorie-adjustment').fill('-15')],
    ['#calculator-keto-protein', () => page.locator('#calculator-keto-protein').fill('0.8')],
    ['#calculator-keto-carbs', () => page.locator('#calculator-keto-carbs').fill('35')],
  ] as const;

  for (const [selector, action] of ketoActions) {
    await page.goto('/calorie-calculator/?keto');
    await expectResultChange(page, page.locator(selector), action);
  }
});

test('every bounded calculator field accepts its limits and rejects values outside them', async ({ page }) => {
  const cases = [
    { mode: '', selector: '#calculator-age', min: '13', max: '100', below: '12', above: '101' },
    { mode: '', selector: '#calculator-weight', min: '30', max: '300', below: '29.9', above: '300.1' },
    { mode: '', selector: '#calculator-height', min: '120', max: '250', below: '119.9', above: '250.1' },
    { mode: '', selector: '#calculator-calorie-adjustment', min: '-50', max: '50', below: '-51', above: '51' },
    { mode: '', selector: '#calculator-fat-split', min: '0', max: '100', below: '-1', above: '101' },
    { mode: '?leangains', selector: '#calculator-steps', min: '0', max: '25000', below: '-500', above: '25500' },
    { mode: '?leangains', selector: '#calculator-lg-protein', min: '30', max: '80', below: '29', above: '81' },
    { mode: '?leangains', selector: '#calculator-fat-split', min: '0', max: '100', below: '-1', above: '101' },
    { mode: '?keto', selector: '#calculator-keto-protein', min: '0.6', max: '1.6', below: '0.5', above: '1.7' },
    { mode: '?keto', selector: '#calculator-keto-carbs', min: '0', max: '100', below: '-1', above: '101' },
  ] as const;

  for (const boundary of cases) {
    await page.goto(`/calorie-calculator/${boundary.mode}`);
    const input = page.locator(boundary.selector);
    for (const valid of [boundary.min, boundary.max]) {
      await input.fill(valid);
      await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    }
    for (const invalid of [boundary.below, boundary.above]) {
      await input.fill(invalid);
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('.calculator-results')).not.toContainText(/NaN|Infinity/);
      await expect(page.getByRole('button', { name: 'Copy' })).toBeDisabled();
    }
  }

  await page.goto('/calorie-calculator/');
  await page.getByLabel('Units').selectOption('imperial');
  for (const boundary of [
    { selector: '#calculator-weight', min: '66.1', max: '661.4', below: '66', above: '661.5' },
    { selector: '#calculator-height', min: '47.2', max: '98.4', below: '47.1', above: '98.5' },
  ]) {
    const input = page.locator(boundary.selector);
    for (const valid of [boundary.min, boundary.max]) {
      await input.fill(valid);
      await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    }
    for (const invalid of [boundary.below, boundary.above]) {
      await input.fill(invalid);
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    }
  }
});

test('LeanGains preserves independent male and female body-fat and goal selections', async ({ page }) => {
  await page.goto('/calorie-calculator/?leangains');
  await page.locator('#calculator-body-fat').selectOption('-2.5');
  await page.locator('#calculator-lg-goal').selectOption('gain');

  await page.locator('input[value="female"]').check();
  await expect(page.locator('#calculator-body-fat')).toHaveValue('0');
  await expect(page.locator('#calculator-lg-goal')).toHaveValue('lose');
  await page.locator('#calculator-body-fat').selectOption('-0.5');
  await page.locator('#calculator-lg-goal').selectOption('maintain');

  await page.locator('input[value="male"]').check();
  await expect(page.locator('#calculator-body-fat')).toHaveValue('-2.5');
  await expect(page.locator('#calculator-lg-goal')).toHaveValue('gain');
  await page.locator('input[value="female"]').check();
  await expect(page.locator('#calculator-body-fat')).toHaveValue('-0.5');
  await expect(page.locator('#calculator-lg-goal')).toHaveValue('maintain');
});

test('calculator preserves exact legacy weekly-change formatting for non-default goals', async ({ page }) => {
  await page.goto('/calorie-calculator/');
  for (const [goal, expected] of [
    ['-10', 'Estimated -0.2 kg per week'],
    ['0', 'Estimated -0 kg per week'],
    ['10', 'Estimated +0.2 kg per week'],
  ] as const) {
    await page.locator('#calculator-goal').selectOption(goal);
    await expect(page.locator('.calculator-change')).toContainText(expected);
  }

  await page.locator('#calculator-diet').selectOption('leangains');
  await page.locator('#calculator-lg-goal').selectOption('maintain');
  await expect(page.locator('.calculator-change')).toContainText('Estimated -0 kg per week');
});

test('calculator info, slider, copy, and embedded share controls expose their full interaction contract', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Pointer tooltip states are covered once in desktop Chromium.');
  await page.goto('/calorie-calculator/');

  const dietHelp = page.getByRole('link', { name: 'Learn more about Diet' });
  await expect(dietHelp.locator('img')).toHaveAttribute('src', '/img/info.png');
  await dietHelp.hover();
  await expect(dietHelp.getByRole('tooltip')).toBeVisible();
  // Legacy vue-popper copy: "Click for more info" beside the icon, black 10px-radius panel.
  await expect(dietHelp.getByRole('tooltip')).toHaveText('Click for more info');
  await expect(dietHelp.getByRole('tooltip')).toHaveCSS('border-radius', '10px');
  await expect(dietHelp.getByRole('tooltip')).toHaveCSS('font-size', '16px');

  const range = page.getByRole('slider', { name: 'Fat and carbohydrate calorie split slider' });
  await range.hover();
  await expect(page.locator('#calculator-fat-split-range-value')).toBeVisible();
  await expect(page.locator('#calculator-fat-split-range-value')).toHaveText('50 % fat');

  const copy = page.getByRole('button', { name: 'Copy' });
  await copy.hover();
  const copyHint = page.locator('#calculator-copy-hint .project-tip-box');
  await expect(copyHint).toBeVisible();
  await expect(copyHint).toHaveText('Click to Copy (reddit-style markdown)');
  await expect(copyHint).toHaveAttribute('data-placement', 'right');
  await expect(copyHint).toHaveAttribute('data-theme', 'muscle');

  const twitter = page.locator('.calculator-share a[aria-label="Share on Twitter"]');
  await expect(twitter).toHaveAttribute('target', '_blank');
  await expect(twitter).toHaveAttribute('rel', /nofollow/);
  await expect(twitter).toHaveAttribute('title', 'Share on Twitter');
  await expect(twitter).toHaveAttribute('href', /text=Check\+out\+this\+calorie\+and\+macro\+calculator/);
  const facebook = page.locator('.calculator-share a[aria-label="Share on Facebook"]');
  await expect(facebook).toHaveAttribute('target', '_blank');
  await expect(facebook).toHaveAttribute('rel', /nofollow/);
  await expect(facebook).toHaveAttribute('title', 'Share on Facebook');

  await page.getByLabel('Diet', { exact: true }).selectOption('leangains');
  await expect(page.getByRole('link', { name: 'Learn more about Stats' })).toHaveCount(0);
});

test('every supplement filter matches the audited membership, order, TOC, and selected state', async ({ page }) => {
  await page.goto('/supplements/');

  for (const [filterId, expectedNames] of Object.entries(supplementFixture.filters)) {
    const label = filterLabels[filterId];
    expect(label, `Missing label for ${filterId}`).toBeTruthy();
    const button = page.getByRole('button', { name: label, exact: true });
    await button.click();

    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveClass(/\bactive\b/);
    await expect.poll(() =>
      page.locator('[data-supplement-id]:visible h2').allTextContents(),
    ).toEqual(expectedNames);
    await expect.poll(() =>
      page.locator('[data-supplement-toc] a').allTextContents(),
    ).toEqual([...expectedNames, 'What is this?', 'References']);
    await expect(page.locator('.category-top h2')).toHaveText(expectedNames[0] ?? '');

    const otherPressed = await page.locator(
      `[data-supplement-filter]:not([data-supplement-filter="${filterId}"])[aria-pressed="true"]`,
    ).count();
    expect(otherPressed).toBe(0);
    if (filterId === 'show-all') {
      await expect(page.locator('[data-supplement-evidence]:visible')).toHaveCount(0);
    } else {
      await expect(page.locator('[data-supplement-evidence]:visible')).toHaveCount(expectedNames.length);
    }
  }

  const information = page.getByRole('button', { name: 'What is this?', exact: true });
  await information.click();
  await expect(information).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-supplement-id]:visible')).toHaveCount(0);
  await expect(page.locator('.category-top')).toHaveAttribute('id', 'supplement-information');
  await expect(page.locator('[data-supplement-toc] a')).toHaveText(['What is this?', 'References']);

  await page.goto('/supplements/');
  await page.locator('[data-supplement-information-link]').click();
  await expect(page.getByRole('button', { name: 'What is this?', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-supplement-id]:visible')).toHaveCount(0);
  await expect(page.locator('#supplement-information')).toBeInViewport();
});

test('all visible supplement badges have exact metrics and every evidence popover opens in view', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'The complete badge matrix is viewport-specific and is covered once in desktop Chromium.');
  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/supplements/');
  const observedLevels = new Set<string>();

  for (const [filterId, expectedNames] of Object.entries(supplementFixture.filters)) {
    if (filterId === 'show-all') continue;
    await page.getByRole('button', { name: filterLabels[filterId], exact: true }).click();
    const badges = page.locator('[data-supplement-evidence]:visible');
    await expect(badges).toHaveCount(expectedNames.length);

    for (let index = 0; index < expectedNames.length; index += 1) {
      const badge = badges.nth(index);
      const level = (await badge.innerText()).trim();
      observedLevels.add(level);
      expect(['high', 'medium', 'low']).toContain(level);
      await expect(badge).toHaveCSS('font-family', /muscle2/);
      await expect(badge).toHaveCSS('font-size', '18.9px');
      await expect(badge).toHaveCSS('font-weight', '600');
      await expect(badge).toHaveCSS('line-height', '21.735px');
      await expect(badge).toHaveCSS('color', 'rgb(255, 255, 255)');
      const expectedBackground = {
        high: 'rgba(37, 167, 92, 0.95)',
        medium: 'rgba(245, 178, 59, 0.95)',
        low: 'rgba(231, 77, 60, 0.85)',
      }[level];
      expect(expectedBackground).toBeTruthy();
      await expect(badge).toHaveCSS('background-color', expectedBackground!);
      await expect(badge).toHaveCSS('border-radius', '5px');
      await expect(badge).toHaveCSS('padding', '2px 8px');

      const heading = page.locator('[data-supplement-id]:visible .supplement-heading h2').nth(index);
      const [headingBox, badgeBox] = await Promise.all([heading.boundingBox(), badge.boundingBox()]);
      expect(headingBox).not.toBeNull();
      expect(badgeBox).not.toBeNull();
      expect(Math.abs(badgeBox!.y - headingBox!.y)).toBeLessThanOrEqual(0.5);
      expect(badgeBox!.x).toBeGreaterThanOrEqual(headingBox!.x + headingBox!.width + 3);

      await badge.click();
      const panelId = await badge.getAttribute('aria-controls');
      const panel = page.locator(`#${panelId}`);
      await expect(badge).toHaveAttribute('aria-expanded', 'true');
      await expect(panel).toBeVisible();
      await expect(panel).toContainText('What is this?');
      await expect(panel).toContainText('This is the efficacy of the supplement based on current research.');
      await expect(panel.locator('.evidence-help-title')).toHaveCSS('background-color', 'rgb(57, 113, 151)');
      await expect(panel.locator('.evidence-help-title')).toHaveCSS('font-size', '18px');
      await expect(panel).toHaveCSS('animation-name', 'evidence-popover-enter');
      const panelBox = await panel.boundingBox();
      expect(panelBox).not.toBeNull();
      expect(panelBox!.x).toBeGreaterThanOrEqual(badgeBox!.x + badgeBox!.width);
      expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(1_440);
      expect(panelBox!.y).toBeGreaterThanOrEqual(0);
      expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(1_000);
      await page.keyboard.press('Escape');
      await expect(panel).toBeHidden();
      await expect(badge).toBeFocused();
    }
  }

  expect([...observedLevels].sort()).toEqual(['high', 'low', 'medium']);
});

test('filter buttons expose exact standard, hover, focus, pressed, and active visual states', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Pointer and computed-style matrix is covered once in desktop Chromium.');
  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/supplements/');

  const assertBaseMetrics = async (button: Locator) => {
    await expect(button).toHaveCSS('font-family', /muscle2/);
    await expect(button).toHaveCSS('font-size', '16px');
    await expect(button).toHaveCSS('font-weight', '400');
    await expect(button).toHaveCSS('line-height', '24px');
    await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(button).toHaveCSS('padding', '6px 12px');
    await expect(button).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px');
  };

  for (const label of Object.values(filterLabels)) {
    const button = page.getByRole('button', { name: label, exact: true });
    await page.getByRole('button', { name: 'Muscle Growth', exact: true }).click();
    if (label === 'Muscle Growth') await page.getByRole('button', { name: 'Sleep', exact: true }).click();
    await assertBaseMetrics(button);
    await expect(button).toHaveCSS('background-color', 'rgb(76, 136, 175)');
    await expect(button).toHaveCSS('border-radius', '8px');
    await button.hover();
    await expect(button).toHaveCSS('background-color', 'rgb(57, 113, 151)');
    await button.focus();
    await expect(button).toBeFocused();
    const box = await button.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await expect(button).toHaveCSS('background-color', 'rgb(31, 97, 141)');
    await expect(button).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.13) 0px 3px 5px 0px inset');
    await page.mouse.up();
    await button.click();
    await expect(button).toHaveCSS('background-color', 'rgb(31, 97, 141)');
    await expect(button).toHaveCSS('border-radius', '16px');
  }

  const information = page.getByRole('button', { name: 'What is this?', exact: true });
  await page.getByRole('button', { name: 'Muscle Growth', exact: true }).click();
  await assertBaseMetrics(information);
  await expect(information).toHaveCSS('background-color', 'rgb(111, 164, 201)');
  await expect(information).toHaveCSS('border-radius', '8px');
  await information.click();
  await expect(information).toHaveCSS('background-color', 'rgb(31, 97, 141)');
  await expect(information).toHaveCSS('border-radius', '16px');
});

test('evidence popovers remain contained at intermediate and mobile widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Explicit viewport matrix is covered once in Chromium.');
  for (const width of [820, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/supplements/');
    const badge = page.locator('[data-supplement-evidence]:visible').first();
    await badge.click();
    const panel = page.locator(`#${await badge.getAttribute('aria-controls')}`);
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(900);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
  }
});

test('calculator guide has no duplicate IDs', async ({ page }) => {
  await page.goto('/calorie-calculator/');
  const duplicateIds = await page.locator('[id]').evaluateAll((elements) => {
    const counts = new Map<string, number>();
    for (const element of elements) {
      counts.set(element.id, (counts.get(element.id) ?? 0) + 1);
    }
    return [...counts.entries()].filter(([, count]) => count > 1);
  });
  expect(duplicateIds).toEqual([]);
});

test('heading self-links and direct fragments preserve their distinct copy and navigation contracts', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop heading controls are hidden below the legacy 800px breakpoint.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1_440, height: 1_000 });

  for (const path of ['/calorie-calculator/', '/supplements/']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(await page.locator(':is(.legacy-content, [data-heading-links]) :is(h2, h3, h4, h5) > .anchorjs-link:visible').count()).toBeGreaterThan(5);
    // Snapshot every control once the supplement enhancer has settled so card reordering cannot
    // detach an nth locator mid-assertion. Every anchor must carry the production glyph contract.
    const controls = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(':is(.legacy-content, [data-heading-links]) :is(h2, h3, h4, h5) > .anchorjs-link')].map((link) => {
        const style = getComputedStyle(link);
        const linkBox = link.getBoundingClientRect();
        const headingBox = link.parentElement!.getBoundingClientRect();
        return {
          icon: link.getAttribute('data-anchorjs-icon'),
          svgCount: link.querySelectorAll('svg').length,
          fontFamily: style.fontFamily,
          color: style.color,
          visible: style.display !== 'none' && linkBox.width > 0,
          rightOverhang: linkBox.x + linkBox.width - headingBox.x,
        };
      }),
    );
    expect(controls.length).toBeGreaterThan(5);
    for (const control of controls) {
      expect(control.icon).toBe('\uE9CB');
      expect(control.svgCount).toBe(0);
      expect(control.fontFamily).toBe('anchorjs-icons');
      expect(control.color).toBe('rgb(167, 167, 167)');
      if (control.visible) expect(control.rightOverhang).toBeLessThanOrEqual(1);
    }
  }

  await page.goto('/calorie-calculator/');
  const heading = page.locator('#diet');
  const link = heading.locator(':scope > .anchorjs-link');
  await link.hover();
  const popoverBox = page.locator(`#${await link.getAttribute('aria-controls')} .project-tip-box`);
  await expect(popoverBox).toBeVisible();
  await expect(popoverBox).toHaveText('Click to Copy');
  await expect(popoverBox).toHaveAttribute('data-state', 'visible');
  await expect(popoverBox).toHaveCSS('transition-property', 'transform, visibility, opacity');
  await expect(popoverBox).toHaveCSS('transition-duration', '0.3s');
  // Let the production 0.25s hover travel finish so the click does not retry with a forced scroll alignment.
  await page.waitForTimeout(350);
  const before = await page.evaluate(() => ({ href: location.href, y: scrollY }));
  await link.click();
  const feedbackBox = page.locator('#heading-popover-diet-feedback .project-tip-box');
  await expect(feedbackBox).toBeVisible();
  await expect(feedbackBox).toHaveText('Link Copied');
  await expect(popoverBox).toHaveAttribute('data-state', 'hidden');
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(
    'https://www.musclehacking.com/calorie-calculator/#diet',
  );
  expect(await page.evaluate(() => ({ href: location.href, y: scrollY }))).toEqual(before);
  await expect(feedbackBox).toBeHidden({ timeout: 1_500 });

  for (const directUrl of [
    '/calorie-calculator/#fat-carb-calorie-split',
    '/supplements/#creatine-primary-benefits',
  ]) {
    await page.goto(directUrl);
    const id = directUrl.split('#')[1];
    const target = page.locator(`#${id}`);
    await expect(target).toBeInViewport();
    const headerBottom = await page.locator('.site-header').evaluate(
      (element) => element.getBoundingClientRect().bottom,
    );
    await expect.poll(
      () => target.evaluate((element) => element.getBoundingClientRect().top),
      { message: `fixed-header offset for ${directUrl}` },
    ).toBeLessThanOrEqual(headerBottom + 100);
    const targetTop = await target.evaluate((element) => element.getBoundingClientRect().top);
    expect(targetTop).toBeGreaterThanOrEqual(headerBottom);
  }
});

test('floating share rail reveals, animates, and copies without navigation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop five-control rail is covered once; mobile geometry remains in the route parity suite.');
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (value: string) => {
          Reflect.set(window, '__shareCopiedText', value);
          return Promise.resolve();
        },
      },
    });
  });
  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/supplements/');
  const rail = page.locator('[data-social-share-rail]');
  await expect(rail).toHaveAttribute('aria-hidden', 'true');
  await expect(rail).toHaveAttribute('inert', '');
  await expect(rail.locator('a')).toHaveCount(5);

  await page.evaluate(() => window.scrollTo(0, 660));
  await expect(rail).toHaveAttribute('aria-hidden', 'true');
  await page.evaluate(() => window.scrollTo(0, 661));
  await expect(rail).toHaveAttribute('aria-hidden', 'false');
  await expect(rail).not.toHaveAttribute('inert', '');
  await expect(rail).toHaveCSS('opacity', '1');
  await expect(rail).toHaveCSS('transition-duration', '0.3s');

  const twitter = rail.locator('#tw-box');
  await twitter.hover();
  await expect(twitter).toHaveCSS('box-shadow', 'rgb(2, 206, 255) 0px 0px 0px 4px');
  const copy = rail.getByRole('link', { name: 'Copy page link' });
  const before = await page.evaluate(() => ({ href: location.href, y: scrollY }));
  await copy.click();
  const copyFeedback = rail.locator('#l-box [data-share-feedback]');
  await expect(copyFeedback).toBeVisible();
  await expect(copyFeedback).toHaveAttribute('data-state', 'visible');
  await expect(copyFeedback).toHaveText('Link Copied!');
  await expect(copyFeedback).toBeHidden({ timeout: 2_000 });
  expect(await page.evaluate(() => Reflect.get(window, '__shareCopiedText'))).toBe(
    'https://www.musclehacking.com/supplements/',
  );
  expect(await page.evaluate(() => ({ href: location.href, y: scrollY }))).toEqual(before);
});
