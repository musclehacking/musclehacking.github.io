import { expect, test } from '@playwright/test';
import { routes } from '../../src/config/routes';

test('UI-01 and UI-13 use placement-specific newsletter geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/');

  const sidebar = page.locator('[data-newsletter-placement="sidebar"]');
  const desktop = await sidebar.evaluate((form) => {
    const input = form.querySelector('input[type="email"]') as HTMLElement;
    const button = form.querySelector('button') as HTMLElement;
    const formBox = form.getBoundingClientRect();
    const inputBox = input.getBoundingClientRect();
    const buttonBox = button.getBoundingClientRect();
    const textRange = document.createRange();
    textRange.selectNodeContents(button);
    const textBox = textRange.getBoundingClientRect();
    return {
      buttonCentreDelta: Math.abs((buttonBox.top + buttonBox.height / 2) - (inputBox.top + inputBox.height / 2)),
      buttonTextCentreDelta: Math.abs((textBox.left + textBox.width / 2) - (buttonBox.left + buttonBox.width / 2)),
      buttonRatio: buttonBox.width / formBox.width,
      fontSize: getComputedStyle(button).fontSize,
      heightDelta: Math.abs(buttonBox.height - inputBox.height),
      inputRatio: inputBox.width / formBox.width,
      joined: inputBox.right === buttonBox.left,
      labelWraps: button.scrollWidth > button.clientWidth,
    };
  });
  expect(desktop.inputRatio).toBeCloseTo(0.67, 2);
  expect(desktop.buttonRatio).toBeCloseTo(0.33, 2);
  expect(desktop.heightDelta).toBeLessThanOrEqual(0.5);
  expect(desktop.buttonCentreDelta).toBeLessThanOrEqual(0.5);
  expect(desktop.buttonTextCentreDelta).toBeLessThanOrEqual(0.5);
  expect(desktop.joined).toBe(true);
  expect(desktop.fontSize).toBe('16.2px');
  expect(desktop.labelWraps).toBe(false);

  await page.setViewportSize({ width: 1_000, height: 1_000 });
  const stacked = await sidebar.evaluate((form) => {
    const inputBox = form.querySelector('input[type="email"]')!.getBoundingClientRect();
    const buttonBox = form.querySelector('button')!.getBoundingClientRect();
    return { buttonTop: buttonBox.top, inputBottom: inputBox.bottom, widthDelta: Math.abs(buttonBox.width - inputBox.width) };
  });
  expect(stacked.buttonTop).toBeGreaterThan(stacked.inputBottom);
  expect(stacked.widthDelta).toBeLessThanOrEqual(0.5);

  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/blog/breakup-energy');
  const articleBottom = page.locator('[data-newsletter-placement="article-bottom"]');
  const articleGeometry = await articleBottom.evaluate((form) => {
    const input = form.querySelector('input[type="email"]') as HTMLElement;
    const button = form.querySelector('button') as HTMLElement;
    return {
      buttonWidth: button.getBoundingClientRect().width,
      fontSize: getComputedStyle(button).fontSize,
      inputWidth: input.getBoundingClientRect().width,
      noWrap: getComputedStyle(button).whiteSpace === 'nowrap' && button.scrollWidth <= button.clientWidth,
    };
  });
  expect(articleGeometry).toMatchObject({ buttonWidth: 165, inputWidth: 335, fontSize: '18.9px', noWrap: true });

  await page.setViewportSize({ width: 560, height: 1_000 });
  await page.reload();
  const articleStack = await articleBottom.evaluate((form) => {
    const input = form.querySelector('input[type="email"]') as HTMLElement;
    const button = form.querySelector('button') as HTMLElement;
    const inputBox = input.getBoundingClientRect();
    const buttonBox = button.getBoundingClientRect();
    return {
      buttonTop: buttonBox.top,
      inputBottom: inputBox.bottom,
      sameWidth: Math.abs(buttonBox.width - inputBox.width) <= 0.5,
      noWrap: button.scrollWidth <= button.clientWidth,
    };
  });
  expect(articleStack.buttonTop).toBeGreaterThan(articleStack.inputBottom);
  expect(articleStack.sameWidth).toBe(true);
  expect(articleStack.noWrap).toBe(true);
});

test('UI-02 gives every project callout the approved SVG contract', async ({ page }) => {
  const iconPaths = {
    important: 'M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
    note: 'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
    warning: 'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575ZM8 2.5a.25.25 0 0 0-.22.132L1.698 14.01a.25.25 0 0 0 .22.49h12.164a.25.25 0 0 0 .22-.49L8.22 2.632A.25.25 0 0 0 8 2.5Zm-.75 4.25a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0ZM9 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
  } as const;
  let calloutTotal = 0;

  for (const route of routes) {
    await page.goto(route.path);
    const callouts = page.locator('.project-callout, .markdown-alert');
    calloutTotal += await callouts.count();
    for (let index = 0; index < await callouts.count(); index += 1) {
      const callout = callouts.nth(index);
      const className = await callout.getAttribute('class') ?? '';
      const variant = className.includes('important') ? 'important' : className.includes('warning') ? 'warning' : 'note';
      await expect(callout).not.toContainText('ⓘ');
      await expect(callout).toHaveCSS('border-left-width', '4px');
      const title = callout.locator('.alert-title');
      await expect(title).toHaveCSS('gap', '8px');
      const icon = title.locator('svg');
      await expect(icon).toHaveAttribute('width', '16');
      await expect(icon).toHaveAttribute('height', '16');
      await expect(icon).toHaveAttribute('viewBox', '0 0 16 16');
      await expect(icon.locator('path')).toHaveAttribute('d', iconPaths[variant]);
      expect(await icon.boundingBox()).toMatchObject({ width: 16, height: 16 });
    }
  }
  expect(calloutTotal).toBeGreaterThan(0);
});

test('reopened UI parity restores prose links and legacy navigation tracking', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 1_147 });
  await page.goto('/');

  const aboutLink = page.locator('.sidebar-about a[href="/calorie-calculator/"]');
  expect(await aboutLink.evaluate((link) => {
    const style = getComputedStyle(link);
    return {
      boxShadow: style.boxShadow,
      color: style.color,
      decoration: style.textDecorationLine,
      transitionDuration: style.transitionDuration,
      transitionTiming: style.transitionTimingFunction,
    };
  })).toMatchObject({
    boxShadow: 'rgb(32, 101, 147) 0px -2px 0px 0px inset',
    color: 'rgba(0, 0, 0, 0.84)',
    decoration: 'none',
    transitionDuration: '0.2s',
    transitionTiming: 'linear',
  });

  const navigation = page.locator('.nav-links');
  expect((await navigation.boundingBox())!.width).toBeCloseTo(651.875, 0);
  for (const link of await navigation.locator(':scope > li > a').all()) {
    await expect(link).toHaveCSS('letter-spacing', '-0.36px');
  }

  await page.goto('/calorie-calculator/');
  const floatingLink = page.locator('.calculator-newsletter-floating .newsletter-prompt-note a[href="/supplements/"]');
  await expect(floatingLink).toHaveCSS('color', 'rgba(0, 0, 0, 0.84)');
  await expect(floatingLink).toHaveCSS('text-decoration-line', 'none');
  await expect(floatingLink).toHaveCSS('box-shadow', 'rgb(32, 101, 147) 0px -2px 0px 0px inset');
});

test('UI-03 and UI-04 restore supplement controls and evidence hover', async ({ page }) => {
  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/supplements/');
  const active = page.getByRole('button', { name: 'Muscle Growth', exact: true });
  const inactive = page.getByRole('button', { name: 'Sleep', exact: true });
  const information = page.getByRole('button', { name: 'What is this?', exact: true });
  const badge = page.locator('#creatine [data-supplement-evidence]');

  expect(await active.evaluate((button) => {
    const style = getComputedStyle(button);
    return {
      background: style.backgroundColor,
      border: style.borderWidth,
      color: style.color,
      fontFamily: style.fontFamily,
      padding: `${style.paddingTop} ${style.paddingRight}`,
      radius: style.borderRadius,
    };
  })).toMatchObject({
    background: 'rgb(31, 97, 141)',
    border: '1px',
    color: 'rgb(255, 255, 255)',
    padding: '6px 12px',
    radius: '16px',
  });
  await expect(active).toHaveCSS('font-family', /muscle2/);
  await expect(inactive).toHaveCSS('background-color', 'rgb(76, 136, 175)');
  await expect(inactive).toHaveCSS('border-radius', '8px');
  await expect(information).toHaveCSS('background-color', 'rgb(111, 164, 201)');
  await expect(information).toHaveCSS('border-radius', '8px');
  await expect(inactive).toHaveCSS('box-shadow', /rgba?\(0, 0, 0/);
  await inactive.hover();
  await expect(inactive).toHaveCSS('background-color', 'rgb(57, 113, 151)');
  const inactiveBox = await inactive.boundingBox();
  await page.mouse.move(inactiveBox!.x + inactiveBox!.width / 2, inactiveBox!.y + inactiveBox!.height / 2);
  await page.mouse.down();
  await expect(inactive).toHaveCSS('background-color', 'rgb(31, 97, 141)');
  await page.mouse.up();
  await inactive.focus();
  await expect(inactive).toBeFocused();
  await inactive.click();
  await page.mouse.move(0, 0);
  await expect(inactive).toHaveCSS('background-color', 'rgb(31, 97, 141)');
  await expect(inactive).toHaveCSS('border-radius', '16px');
  await active.click();
  await expect(badge).toHaveCSS('font-size', '18.9px');
  await expect(badge).toHaveCSS('font-weight', '600');
  await expect(badge).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(badge).toHaveCSS('background-color', 'rgba(37, 167, 92, 0.95)');
  await expect(badge).toHaveCSS('padding', '2px 8px');
  // The audited legacy page reaches references only through inline `.inl-ref` links;
  // the intro "here" link keeps the legacy inset underline treatment.
  const introLink = page.locator('.supplements-page > .supplement-note a[href="#supplement-information"]');
  await expect(introLink).toHaveCSS('color', 'rgba(0, 0, 0, 0.84)');
  await expect(introLink).toHaveCSS('text-decoration-line', 'none');
  await expect(introLink).toHaveCSS('box-shadow', 'rgb(32, 101, 147) 0px -2px 0px 0px inset');
  await expect(page.getByRole('link', { name: 'View Creatine references' })).toHaveCount(0);
  await introLink.hover();
  await expect(introLink).toHaveCSS('box-shadow', 'rgba(63, 149, 208, 0.2) 0px -21px 0px 0px inset');
  const [headingBox, badgeBox] = await Promise.all([
    page.locator('#creatine h2').boundingBox(),
    badge.boundingBox(),
  ]);
  expect(Math.abs(badgeBox!.y - headingBox!.y)).toBeLessThanOrEqual(0.5);

  await badge.hover();
  await expect(badge).toHaveAttribute('aria-expanded', 'true');
  const panel = page.locator('#evidence-help-creatine');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('What is this?');
  await expect(panel).toContainText('This is the efficacy of the supplement based on current research.');
  const placement = await Promise.all([badge.boundingBox(), panel.boundingBox()]);
  expect(placement[1]!.x).toBeGreaterThan(placement[0]!.x + placement[0]!.width);
  expect(Math.abs((placement[1]!.y + placement[1]!.height / 2) - (placement[0]!.y + placement[0]!.height / 2))).toBeLessThan(60);

  await page.mouse.move(placement[1]!.x + 10, placement[1]!.y + 10);
  await expect(panel).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(panel).toBeHidden();

  await badge.focus();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(badge).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const filterRows = await page.locator('.supplement-filters button').evaluateAll((buttons) => new Set(buttons.map((button) => button.getBoundingClientRect().top)).size);
  expect(filterRows).toBeGreaterThan(1);
  const filterOverflow = await page.locator('.supplement-filters').evaluate((filters) => filters.scrollWidth - filters.clientWidth);
  expect(filterOverflow).toBeLessThanOrEqual(0);
});

test('UI-05 heading links animate, copy the canonical fragment, and preserve scroll position', async ({ page, context }, testInfo) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/calorie-calculator/');
  const heading = page.locator('#diet');
  const link = heading.locator(':scope > .anchorjs-link');

  if (testInfo.project.name === 'mobile-chromium') {
    await expect(link).toBeHidden();
    await expect(page.locator('#share-t > .anchorjs-link')).toHaveCount(0);
    return;
  }

  const popoverId = await link.getAttribute('aria-controls');
  expect(popoverId).toBeTruthy();
  const panel = page.locator(`#${popoverId} .project-tip-box`);
  await expect(link).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toHaveAttribute('role', 'tooltip');
  await expect(panel).toBeHidden();

  await link.hover();
  await expect(link).toHaveAttribute('data-anchorjs-icon', '\uE9CB');
  await expect(link.locator('svg')).toHaveCount(0);
  await expect(link).toHaveCSS('font-family', 'anchorjs-icons');
  await expect(link).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveText('Click to Copy');
  await expect(panel).toHaveCSS('background-image', 'linear-gradient(90deg, rgb(0, 96, 162), rgb(0, 21, 64))');
  await expect(panel).toHaveCSS('font-size', '14.7px');
  await expect(panel).toHaveCSS('border-radius', '4px');
  await expect(panel).toHaveCSS('transition-duration', '0.3s');
  await expect(panel).toHaveCSS('transition-property', 'transform, visibility, opacity');
  await expect(panel.locator('.project-popover-arrow')).toHaveCount(1);

  await link.focus();
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(link).toBeFocused();

  await page.evaluate(() => window.scrollTo({ top: 1_200, behavior: 'instant' }));
  const beforeActivation = await page.evaluate(() => ({ hash: location.hash, scrollY }));
  await link.evaluate((element) => (element as HTMLAnchorElement).click());
  const feedbackPanel = page.locator(`#${popoverId}-feedback .project-tip-box`);
  await expect(feedbackPanel).toHaveText('Link Copied');
  await expect(feedbackPanel).toBeVisible();
  await expect(panel).toBeHidden();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('https://www.musclehacking.com/calorie-calculator/#diet');
  await page.waitForTimeout(800);
  await expect(feedbackPanel).toBeHidden();
  expect(await page.evaluate(() => ({ hash: location.hash, scrollY }))).toEqual(beforeActivation);
  await expect(page.locator('#share-t > .anchorjs-link')).toHaveCount(0);

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new Error('denied'); } },
    });
  });
  const failureLink = page.locator('#standard > .anchorjs-link');
  await failureLink.click();
  const failurePanel = page.locator(`#${await failureLink.getAttribute('aria-controls')}-feedback .project-tip-box`);
  await expect(failurePanel).toHaveText('Copy Failed');
  await expect(failurePanel).toBeVisible();
  expect(new URL(page.url()).hash).toBe(beforeActivation.hash);

  for (const path of ['/calorie-calculator/', '/supplements/', '/blog/reject-modernity-embrace-masculinity']) {
    await page.goto(path);
    const headingLinks = page.locator(':is(h2, h3, h4, h5) > .anchorjs-link');
    expect(await headingLinks.count()).toBeGreaterThan(0);
  }

  await page.goto('/supplements/');
  for (const [headingSelector, expectedTopDelta] of [['#creatine h2', -2.9], ['#creatine-primary-benefits', -2.3]] as const) {
    const target = page.locator(headingSelector);
    const anchor = target.locator(':scope > .anchorjs-link');
    const [targetBox, anchorBox] = await Promise.all([target.boundingBox(), anchor.boundingBox()]);
    await expect(anchor).toHaveCSS('color', 'rgb(167, 167, 167)');
    expect(anchorBox!.y - targetBox!.y).toBeCloseTo(expectedTopDelta, 0);
  }
});

test('UI-06 header uses the legacy shield and real wordmark image at its source breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1_994, height: 900 });
  await page.goto('/');
  const mark = page.locator('.site-brand-mark');
  const wordmark = page.locator('.site-brand-wordmark');
  await expect(mark).toBeVisible();
  await expect(wordmark).toBeVisible();
  await expect(mark).toHaveAttribute('src', '/img/muscle-hacking.png');
  await expect(wordmark).toHaveAttribute('src', '/img/musclehacking.png');
  expect(await mark.boundingBox()).toMatchObject({ width: 52, height: 50 });
  expect(await wordmark.boundingBox()).toMatchObject({ width: 416, height: 30 });
  const [markBox, wordmarkBox] = await Promise.all([mark.boundingBox(), wordmark.boundingBox()]);
  expect(wordmarkBox!.x - markBox!.x - markBox!.width).toBeCloseTo(20, 1);

  for (const width of [1_750, 1_440, 1_000, 820, 560, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(mark).toBeVisible();
    await expect(wordmark).toBeHidden();
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await mark.boundingBox()).toMatchObject({ width: 52, height: 50 });
  const newsletterIcon = page.locator('.nav-icon--email');
  const toggle = page.locator('.nav-toggle');
  await expect(toggle).toBeVisible();
  expect((await newsletterIcon.boundingBox())!.x - (await mark.boundingBox())!.x).toBeCloseTo(72, 0);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('link', { name: 'Calorie Calculator', exact: true })).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(page.locator('.site-header')).toHaveCSS('position', 'fixed');
  expect((await page.locator('.site-header').boundingBox())!.y).toBe(0);

  await page.setViewportSize({ width: 1_440, height: 900 });
  await page.goto('/');
  const emailIcon = page.locator('.nav-icon--email');
  expect(await emailIcon.boundingBox()).toMatchObject({ width: 23, height: 23 });
  await expect(emailIcon).toHaveCSS('margin-left', '3px');
  await expect(emailIcon).toHaveCSS('margin-right', '8px');
  const social = page.locator('.header-social-link').first();
  const glyph = social.locator('svg');
  const [socialBox, glyphBox] = await Promise.all([social.boundingBox(), glyph.boundingBox()]);
  expect(socialBox!.width - glyphBox!.width).toBeCloseTo(20, 0);
});

test('home and floating share controls stay inside audited narrow viewports', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  const featureBox = await page.locator('.home-feature').first().boundingBox();
  expect(featureBox!.x).toBeGreaterThanOrEqual(0);
  expect(featureBox!.x + featureBox!.width).toBeLessThanOrEqual(320);

  for (const width of [768, 769, 820, 821]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/blog/breakup-energy');
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    const railBox = await page.locator('#sh-box').boundingBox();
    expect(railBox!.x).toBeGreaterThanOrEqual(0);
    expect(railBox!.x + railBox!.width).toBeLessThanOrEqual(width);
  }
});

test('UI-07 keeps calculator floating and exit prompts independent', async ({ page }) => {
  await page.setViewportSize({ width: 1_440, height: 1_000 });
  // Legacy js/e-on-delay.min.js reveals the exit prompt 30 seconds after load; drive that timer.
  await page.clock.install();
  await page.goto('/calorie-calculator/');
  const floating = page.locator('[data-calculator-newsletter-floating]');
  // Legacy js/eml-flt-right.js reveals the floating prompt once pageYOffset > 660.
  await page.evaluate(() => scrollTo(0, 600));
  await expect(floating).toBeHidden();
  await page.evaluate(() => scrollTo(0, 700));
  await expect(floating).toBeVisible();
  await expect(floating.locator('[data-newsletter-placement="floating"]')).toBeVisible();
  const floatingGeometry = await floating.evaluate((prompt) => {
    const form = prompt.querySelector('[data-newsletter-placement="floating"]') as HTMLElement;
    const button = form.querySelector('button') as HTMLElement;
    const promptBox = prompt.getBoundingClientRect();
    const formBox = form.getBoundingClientRect();
    const buttonStyle = getComputedStyle(button);
    const textRange = document.createRange();
    textRange.selectNodeContents(button);
    const textBox = textRange.getBoundingClientRect();
    const buttonBox = button.getBoundingClientRect();
    return {
      formCentreDelta: Math.abs((formBox.left + formBox.width / 2) - (promptBox.left + (promptBox.width - 25) / 2)),
      promptWidth: promptBox.width,
      buttonAlign: buttonStyle.alignItems,
      buttonJustify: buttonStyle.justifyContent,
      buttonTextCentreDelta: Math.abs((textBox.left + textBox.width / 2) - (buttonBox.left + buttonBox.width / 2)),
    };
  });
  expect(floatingGeometry).toMatchObject({ promptWidth: 350, buttonAlign: 'center', buttonJustify: 'center' });
  expect(floatingGeometry.formCentreDelta).toBeLessThanOrEqual(0.5);
  expect(floatingGeometry.buttonTextCentreDelta).toBeLessThanOrEqual(0.5);

  const invoker = page.getByRole('button', { name: 'Copy', exact: true });
  await invoker.focus();
  const dialog = page.locator('[data-calculator-newsletter-exit]');
  await page.clock.fastForward(29_000);
  await expect(dialog).toBeHidden();
  await page.clock.fastForward(1_500);
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Cut through the BS—get evidence-based advice');
  await expect(dialog.locator('[data-newsletter-placement="modal"]')).toBeVisible();
  // Legacy `.exit-int-p-up` is the full-viewport overlay; `.n-lett` is the centred 700px panel.
  const panel = dialog.locator('[data-calculator-newsletter-exit-panel]');
  await expect(dialog).toHaveCSS('width', '1440px');
  await expect(panel).toHaveCSS('width', '700px');
  await expect(dialog).toHaveCSS('background-color', 'rgba(33, 33, 33, 0.8)');
  await expect(dialog).toHaveCSS('transition-duration', '0.3s');
  await expect(dialog).toHaveAttribute('data-open', 'true');
  await expect(panel.locator('.newsletter-prompt-close img[src="/img/hidden.png"]')).toBeVisible();
  await expect(panel.locator('h2')).toHaveCSS('font-weight', '400');
  expect(await dialog.evaluate((element) => document.activeElement === element)).toBe(true);
  await expect(dialog).toHaveCSS('outline-style', 'none');
  await page.keyboard.press('Tab');
  const focusedInside = await dialog.evaluate((element) => element.contains(document.activeElement));
  expect(focusedInside).toBe(true);
  await page.keyboard.press('Escape');
  await page.clock.fastForward(400);
  await expect(dialog).toBeHidden();
  await expect(invoker).toBeFocused();

  await page.reload();
  await invoker.focus();
  await page.clock.fastForward(30_500);
  await expect(dialog).toBeVisible();
  await dialog.click({ position: { x: 1, y: 1 } });
  await page.clock.fastForward(400);
  await expect(dialog).toBeHidden();
  await expect(invoker).toBeFocused();
});

test('UI-08 calculator guide restores its distinct intro, image, TOC, and Diet hierarchy', async ({ page }) => {
  await page.goto('/calorie-calculator/');
  await expect(page.locator('#intro-start')).toContainText('estimate how much weight you’ll lose or gain');
  const image = page.locator('img[src="/img/leangains-calculator.jpg"]');
  await expect(image).toHaveAttribute('alt', 'Cheerios Commercial');
  await expect(image).toHaveAttribute('width', '700');
  await expect(image).toHaveAttribute('height', '400');
  const topLevel = page.locator('.calculator-guide #toc-ul > li > a');
  await expect(topLevel).toHaveText(['Diet', 'Stats', 'Modifiers', 'Results', 'Leangains Calculator']);
  for (const [id, label] of [['diet', 'Diet'], ['standard', 'Standard'], ['leangains', 'Leangains'], ['keto', 'Keto']] as const) {
    // The production AnchorJS control is prepended, so the label is the heading's first text node.
    expect(await page.locator(`#${id}`).evaluate((heading) =>
      [...heading.childNodes].find((node) => node.nodeType === 3 && node.textContent?.trim())?.textContent?.trim(),
    )).toBe(label);
  }
  await expect(page.locator('#goal-leangains')).toHaveCount(1);
  await expect(page.locator('#how-much-protein-leangains')).toHaveCount(1);

  await page.goto('/blog/calorie-calculator-how-to');
  await expect(page.locator('#diet')).toHaveCount(0);
  await expect(page.locator('#goal-lg')).toHaveCount(1);
});

test('UI-09 restores article, calculator guide, and supplement heading hierarchy', async ({ page }) => {
  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/blog/reject-modernity-embrace-masculinity');
  await expect(page.locator('.legacy-content h3').first()).toHaveCSS('font-size', '40px');
  await expect(page.locator('.legacy-content h3').first()).toHaveCSS('line-height', '46px');

  await page.goto('/calorie-calculator/');
  await expect(page.locator('#activity-level')).toHaveCSS('font-size', '32px');

  await page.goto('/supplements/');
  await expect(page.locator('#creatine h2')).toHaveCSS('font-size', '40px');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/blog/reject-modernity-embrace-masculinity');
  const mobileArticleHeading = page.locator('.legacy-content h3').first();
  await expect(mobileArticleHeading).toHaveCSS('font-size', '32px');
  await expect(mobileArticleHeading).toHaveCSS('margin-top', '28px');
  await expect(mobileArticleHeading).toHaveCSS('scroll-margin-top', '90px');
  await page.goto('/calorie-calculator/');
  await expect(page.locator('#activity-level')).toHaveCSS('font-size', '26px');
  // Legacy `h3 + h4 { margin-top: 20px }` outranks the mobile 22px h4 margin.
  await expect(page.locator('#activity-level')).toHaveCSS('margin-top', '20px');
});

test('UI-10 restores the complete legacy home grid, overlay alignment, and recent posts', async ({ page }) => {
  const expectedHrefs = [
    '/blog/breakup-energy',
    '/lose-fat-gain-muscle/',
    '/blog/idols',
    '/blog/weak',
    '/blog/change',
    '/books/',
    '/supplements/',
    '/blog/normal',
    '/blog/reject-modernity-embrace-masculinity',
    '/blog/best-protein-powder-for-building-muscle',
    '/blog/healthy-low-calorie-foods',
    '/blog/australian-health-star-rating',
    '/blog/healthy-organic-post',
    '/blog/what-is-intermittent-fasting',
    '/blog/calorie-calculator-how-to',
  ];

  for (const [width, expectedTitleX, expectedImageX] of [
    [1_994, 233.921875, 231.765625],
    [1_440, 92.359375, 93.28125],
    [390, 12.875, 17.40625],
  ] as const) {
    await page.setViewportSize({ width, height: 1_000 });
    await page.goto('/');
    const titleBox = await page.locator('.home-title').boundingBox();
    const imageBox = await page.locator('.article-card').first().locator('img').boundingBox();
    const overlayBox = await page.locator('.article-card').first().locator('.feature-title').boundingBox();
    const excerptBox = await page.locator('.article-card').first().locator('.feature-excerpt').boundingBox();
    expect(titleBox!.x).toBeCloseTo(expectedTitleX, 0);
    expect(imageBox!.x).toBeCloseTo(expectedImageX, 0);
    expect(Math.abs(overlayBox!.x - imageBox!.x)).toBeLessThanOrEqual(0.5);
    expect(Math.abs((overlayBox!.y + overlayBox!.height) - (imageBox!.y + imageBox!.height))).toBeLessThanOrEqual(0.5);
    expect(excerptBox!.y - (imageBox!.y + imageBox!.height)).toBeCloseTo(16, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  }

  for (const width of [821, 959, 1_000, 1_200, 1_250]) {
    await page.setViewportSize({ width, height: 1_147 });
    await page.goto('/');
    const [contentBox, imageBox, listBox, sidebarBox] = await Promise.all([
      page.locator('.content-column').boundingBox(),
      page.locator('.article-card').first().locator('img').boundingBox(),
      page.locator('.article-list').boundingBox(),
      page.locator('.sidebar').boundingBox(),
    ]);
    expect(imageBox!.x + imageBox!.width).toBeLessThanOrEqual(contentBox!.x + contentBox!.width + 0.5);
    expect(listBox!.x + listBox!.width).toBeLessThanOrEqual(sidebarBox!.x + 0.5);
    expect(imageBox!.x + imageBox!.width).toBeLessThanOrEqual(sidebarBox!.x + 0.5);
  }

  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/');
  const cards = page.locator('.article-card');
  expect(await cards.count()).toBe(15);
  expect(await cards.evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(expectedHrefs);
  await expect(page.locator('.sidebar-recent h2')).toHaveText('Recent Posts');
  const recentLinks = page.locator('.sidebar-recent a');
  expect(await recentLinks.count()).toBe(15);
  expect(await recentLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(expectedHrefs);

  for (let index = 0; index < await cards.count(); index += 1) {
    const card = cards.nth(index);
    await card.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const before = await card.boundingBox();
    await expect(card).toHaveAttribute('href', /\//);
    await expect(card).toHaveCSS('border-left-width', '6px');
    await expect(card.locator('.feature-title')).toHaveCSS('position', 'absolute');
    expect(await card.locator('.feature-title').evaluate((title) => getComputedStyle(title, '::before').opacity)).toBe('0.75');
    await expect(card).toHaveCSS('border-left-color', 'rgb(255, 255, 255)');
    await card.hover();
    await expect(card).toHaveCSS('border-left-color', 'rgb(31, 97, 141)');
    expect(await card.boundingBox()).toEqual(before);
    await card.focus();
    await expect(card).toHaveCSS('border-left-color', 'rgb(31, 97, 141)');
    await expect(card.locator('.feature-excerpt')).toBeVisible();
  }
  await cards.last().scrollIntoViewIfNeeded();
  await expect(cards.last()).toBeVisible();
});

test('UI-11 excludes the unapproved footer from the complete route matrix', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route.path);
    await expect(page.locator('.site-footer')).toHaveCount(0);
    await expect(page.locator('footer')).toHaveCount(0);
  }
});

test('UI-12 restores previous and next article navigation at desktop and mobile', async ({ page }) => {
  for (const path of ['/calorie-calculator/', '/supplements/', '/lose-fat-gain-muscle/', '/books/']) {
    await page.setViewportSize({ width: 1_440, height: 1_000 });
    await page.goto(path);
    await page.locator('#post-nav').scrollIntoViewIfNeeded();
    await expect(page.locator('#post-nav')).toBeVisible();
    expect(await page.locator('#post-nav a').count()).toBe(2);
  }

  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/blog/breakup-energy');
  const previous = page.locator('#post-prev');
  const next = page.locator('#post-next');
  await expect(page.locator('#post-nav')).toHaveCSS('border-top-width', '1px');
  for (const link of [previous, next]) {
    await expect(link).toHaveCSS('width', '315px');
    await expect(link).toHaveCSS('border-bottom-width', '1px');
    await expect(link.locator('.span-t')).toHaveCSS('display', 'block');
  }
  const [previousBox, nextBox] = await Promise.all([previous.boundingBox(), next.boundingBox()]);
  expect(previousBox!.x).toBeLessThan(nextBox!.x);
  expect(await page.locator('#pre-arrow').evaluate((element) => getComputedStyle(element, '::before').content)).toBe('"←"');
  expect(await page.locator('#post-arrow').evaluate((element) => getComputedStyle(element, '::after').content)).toBe('"→"');
  await previous.hover();
  await expect(previous).toHaveCSS('border-bottom-color', 'rgb(0, 0, 0)');
  expect(await page.locator('#post-nav').evaluate((navigation) => {
    const newsletter = document.querySelector('[data-newsletter-placement="article-bottom"]');
    const share = document.querySelector('.share-links');
    return Boolean(newsletter && share
      && (newsletter.compareDocumentPosition(share) & Node.DOCUMENT_POSITION_FOLLOWING)
      && (share.compareDocumentPosition(navigation) & Node.DOCUMENT_POSITION_FOLLOWING));
  })).toBe(true);
  const serverHtml = await (await page.request.get('/blog/breakup-energy')).text();
  const newsletterOffset = serverHtml.indexOf('data-newsletter-placement="article-bottom"');
  const shareOffset = serverHtml.indexOf('class="share-links"');
  const navigationOffset = serverHtml.indexOf('id="post-nav"');
  expect(newsletterOffset).toBeGreaterThan(-1);
  expect(shareOffset).toBeGreaterThan(newsletterOffset);
  expect(navigationOffset).toBeGreaterThan(shareOffset);
  expect(serverHtml.match(/id="post-nav"/g)).toHaveLength(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  for (const link of [previous, next]) {
    expect((await link.boundingBox())!.width).toBeLessThanOrEqual(360);
    await expect(link).toHaveCSS('text-align', 'center');
  }

  await page.setViewportSize({ width: 1_440, height: 1_000 });
  await page.goto('/blog/calorie-calculator-how-to');
  await expect(page.locator('#post-prev')).toHaveCount(0);
  await expect(page.locator('#post-next')).toHaveCSS('float', 'right');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('#post-next')).toHaveCSS('float', 'none');
  await expect(page.locator('#post-next')).toHaveCSS('text-align', 'center');
});

test('reopened article endings restore share, comment, disclaimers, wrapping, and floating rail', async ({ page }) => {
  const isMobile = test.info().project.name === 'mobile-chromium';
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1_440, height: 1_000 });

  const articleSlugs = [
    'australian-health-star-rating',
    'best-protein-powder-for-building-muscle',
    'breakup-energy',
    'calorie-calculator-how-to',
    'change',
    'healthy-low-calorie-foods',
    'healthy-organic-post',
    'idols',
    'normal',
    'reject-modernity-embrace-masculinity',
    'weak',
    'what-is-intermittent-fasting',
  ];
  const railRoutes = new Set(articleSlugs.filter((slug) => slug !== 'calorie-calculator-how-to'));
  const wrappingRoutes = new Set(['breakup-energy', 'change', 'idols', 'weak']);
  const disclaimerRoutes = new Set(['healthy-low-calorie-foods']);

  const expectSharePayloads = async (expectedSocialTitle?: string) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    const socialTitle = expectedSocialTitle ?? (await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim();
    const documentTitle = await page.title();
    const rail = page.locator('#sh-box');
    const twitter = new URL(await rail.locator('#tw-box a').getAttribute('href') ?? '');
    const facebook = new URL(await rail.locator('#f-box a').getAttribute('href') ?? '');
    const linkedIn = new URL(await rail.locator('#li-box a').getAttribute('href') ?? '');
    const email = new URL(await rail.locator('#e-box a').getAttribute('href') ?? '');
    expect(twitter.searchParams.get('text')).toBe(`${socialTitle} ${canonical}`);
    expect(twitter.searchParams.get('via')).toBe('musclehacking');
    expect(facebook.searchParams.get('u')).toBe(canonical);
    expect(facebook.searchParams.get('title')).toBe(documentTitle);
    expect(linkedIn.pathname).toBe('/shareArticle');
    expect(linkedIn.searchParams.get('mini')).toBe('true');
    expect(linkedIn.searchParams.get('url')).toBe(canonical);
    expect(linkedIn.searchParams.get('title')).toBe(documentTitle);
    expect(email.searchParams.get('subject')).toBe('Worth a read');
    expect(email.searchParams.get('body')).toBe(`You might find this interesting: ${canonical}`);
  };

  for (const slug of articleSlugs) {
    await page.goto(`/blog/${slug}`);
    const ending = page.locator('[data-content-ending]');
    await expect(ending.locator('[data-newsletter-placement="article-bottom"]')).toHaveCount(1);
    await expect(ending.locator('#share')).toHaveCount(1);
    await expect(ending.locator('#comm')).toHaveCount(1);
    await expect(ending.locator('#post-nav')).toHaveCount(1);
    await expect(ending.locator('#share a')).toHaveCount(2);
    await expect(ending.locator('#share a').nth(0)).toHaveAttribute('aria-label', 'Share on Twitter');
    await expect(ending.locator('#share a').nth(1)).toHaveAttribute('aria-label', 'Share on Facebook');
    await expect(ending.locator('#comm a')).toHaveAttribute('href', 'https://www.reddit.com/r/musclehacking/');
    expect(await ending.evaluate((node) => Array.from(node.children).map((child) => child.id || child.classList[0]))).toEqual(
      disclaimerRoutes.has(slug)
        ? ['newsletter-signup', 'share', 'comm', 'affiliate-disclaimer', 'post-nav']
        : ['newsletter-signup', 'share', 'comm', 'post-nav'],
    );
    await expect(page.locator('#sh-box')).toHaveCount(railRoutes.has(slug) ? 1 : 0);
    if (railRoutes.has(slug)) await expectSharePayloads();
    const title = ending.locator('#post-nav .span-t').first();
    if (await title.count()) {
      await expect(title).toHaveCSS('white-space', wrappingRoutes.has(slug) ? 'normal' : 'nowrap');
    }
  }

  for (const path of ['/calorie-calculator/', '/supplements/', '/books/', '/lose-fat-gain-muscle/']) {
    await page.goto(path);
    const ending = page.locator('[data-content-ending]');
    await expect(ending.locator('#share')).toHaveCount(1);
    await expect(ending.locator('#comm')).toHaveCount(1);
    await expect(ending.locator('#post-nav .span-t').first()).toHaveCSS('white-space', 'normal');
    await expect(page.locator('#sh-box')).toHaveCount(1);
    expect(await ending.evaluate((node) => Array.from(node.children).map((child) => child.id || child.classList[0]))).toEqual(
      path === '/lose-fat-gain-muscle/'
        ? ['newsletter-signup', 'share', 'comm', 'post-nav']
        : ['newsletter-signup', 'share', 'comm', 'affiliate-disclaimer', 'post-nav'],
    );
    await expectSharePayloads(path === '/supplements/' ? 'Beyond the Hype: Supplements That Work' : undefined);
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    await expect(page.locator('#sh-box')).toHaveCSS('opacity', '1');
    await expect(page.locator('#sh-box .sh-box2')).toHaveCount(5);
  }

  for (const path of ['/calorie-calculator/', '/supplements/', '/books/']) {
    await page.goto(path);
    await expect(page.locator('.affiliate-disclaimer')).toBeVisible();
  }
  await page.goto('/lose-fat-gain-muscle/');
  await expect(page.locator('.affiliate-disclaimer')).toHaveCount(0);

  await page.goto('/blog/healthy-low-calorie-foods');
  await expect(page.locator('.affiliate-disclaimer')).toContainText('irrespective of the $ involved');
  await page.goto('/blog/breakup-energy');
  const rail = page.locator('#sh-box');
  await expect(rail).toHaveCSS('opacity', '0');
  await expect(rail).toHaveCSS('visibility', 'hidden');
  await expect(rail).toHaveAttribute('aria-hidden', 'true');
  await expect(rail).toHaveAttribute('inert', '');
  const copyLink = rail.locator('[data-copy-page-link]');
  await copyLink.focus();
  await expect(copyLink).not.toBeFocused();
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  if (!isMobile) await expect(rail).toHaveCSS('position', 'fixed');
  await expect(rail).toHaveCSS('opacity', '1');
  await expect(rail).toHaveCSS('visibility', 'visible');
  await expect(rail).toHaveAttribute('aria-hidden', 'false');
  await expect(rail).not.toHaveAttribute('inert', '');
  await expect(rail).toHaveCSS('transition-duration', '0.3s');
  const twitterCircle = rail.locator('#tw-box');
  if (isMobile) {
    expect(await twitterCircle.boundingBox()).toMatchObject({ width: 130, height: 40 });
    await expect(rail.locator('.sh-box2').nth(0)).toBeVisible();
    await expect(rail.locator('.sh-box2').nth(1)).toBeVisible();
    await expect(rail.locator('.sh-box2').nth(2)).toBeVisible();
    await expect(rail.locator('.sh-box2').nth(3)).toBeHidden();
    await expect(rail.locator('.sh-box2').nth(4)).toBeHidden();
  } else {
    expect(await twitterCircle.boundingBox()).toMatchObject({ width: 40, height: 40 });
    await twitterCircle.hover();
    await expect(twitterCircle).toHaveCSS('box-shadow', 'rgb(2, 206, 255) 0px 0px 0px 4px');
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error('Clipboard unavailable')) },
      });
      document.execCommand = () => true;
    });
    await copyLink.click();
    await expect(copyLink).toHaveAttribute('data-copied', 'true');
  }

  await page.goto('/supplements/');
  await expect(page.locator('#share a[aria-label="Share on Twitter"]')).toHaveAttribute(
    'href',
    'https://twitter.com/intent/tweet?text=Check+out+this+supplement+guide:+https://www.musclehacking.com/supplements/%20from%20@musclehacking',
  );
});
