import { expect, test } from '@playwright/test';

const legacyArrowPaths = [
  'M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z',
  'm0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z',
] as const;

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'The rejected production comparison used the 1440px desktop state.');
  await page.setViewportSize({ width: 1_440, height: 1_000 });
});

test('calculator text controls use the live production Bootstrap focus ring', async ({ page }) => {
  await page.goto('/calorie-calculator/');
  const weight = page.locator('#calculator-weight');
  await weight.focus();

  await expect(weight).toHaveCSS('border-color', 'rgb(128, 189, 255)');
  await expect(weight).toHaveCSS('box-shadow', 'rgba(0, 123, 255, 0.25) 0px 0px 0px 3.2px');
  await expect(weight).toHaveCSS('outline-style', 'none');
  await expect(weight).toHaveCSS('border-radius', '4px 0px 0px 4px');
});

test('heading anchors use the production AnchorJS inline contract, weight, and hover travel', async ({ page }) => {
  await page.goto('/supplements/');

  const heading = page.locator('#creatine h2');
  const link = heading.locator(':scope > .anchorjs-link');
  await expect(link).toHaveAttribute('data-anchorjs-icon', '\uE9CB');
  await expect(link.locator('svg')).toHaveCount(0);
  await expect(link).toHaveCSS('font-family', 'anchorjs-icons');

  // The production glyph inherits nothing from the bold heading: anchor.js sets
  // `font: 1em/1 anchorjs-icons` and antialiased smoothing inline.
  await expect(link).toHaveCSS('font-weight', '400');
  await expect(link).toHaveCSS('-webkit-font-smoothing', 'antialiased');
  // Production inline geometry at the 40px heading: margin-left -1.25em with
  // 0.25em padding on both sides, animated by `transition: all .25s linear`.
  await expect(link).toHaveCSS('margin-left', '-50px');
  await expect(link).toHaveCSS('padding-left', '10px');
  await expect(link).toHaveCSS('padding-right', '10px');
  await expect(link).toHaveCSS('transition-duration', '0.25s');
  await expect(link).toHaveCSS('transition-timing-function', 'linear');
  // anchor.js prepends the control as the heading's first child.
  expect(await heading.evaluate((node) => node.firstChild === node.querySelector('.anchorjs-link'))).toBe(true);

  const alignment = await heading.evaluate((node) => {
    const anchor = node.querySelector(':scope > .anchorjs-link') as HTMLElement;
    const textNode = [...node.childNodes].find((child) => child.nodeType === 3 && child.textContent?.trim());
    const range = document.createRange();
    range.selectNodeContents(textNode!);
    const text = range.getBoundingClientRect();
    const icon = anchor.getBoundingClientRect();
    return {
      centreDelta: (icon.top + icon.height / 2) - (text.top + text.height / 2),
      rightGap: text.left - icon.right,
    };
  });
  expect(alignment.centreDelta).toBeCloseTo(-2.9, 1);
  expect(alignment.rightGap).toBeCloseTo(5.6, 1);

  // Production hover travel: the parent-heading hover moves the glyph from
  // -1.25em to -1.125em (5px right at this heading size).
  await heading.hover();
  await expect(link).toHaveCSS('margin-left', '-45px');
  await link.hover();
  await expect(link).toHaveCSS('color', 'rgb(57, 113, 151)');
});

test('heading tooltips reproduce the production tippy placement, arrow direction, and copied state', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/supplements/');

  const heading = page.locator('#creatine h2');
  const link = heading.locator(':scope > .anchorjs-link');
  await link.hover();
  const popover = page.locator(`#${await link.getAttribute('aria-controls')} .project-tip-box`);
  await expect(popover).toBeVisible();
  await expect(popover).toHaveText('Click to Copy');

  // Production tippy mechanics: 300ms ease transition over transform,
  // visibility, and opacity, entering 20px from the far side.
  await expect(popover).toHaveCSS('transition-property', 'transform, visibility, opacity');
  await expect(popover).toHaveCSS('transition-duration', '0.3s');
  await expect(popover).toHaveCSS('transition-timing-function', 'ease');
  await expect(popover).toHaveAttribute('data-placement', 'top');

  const arrow = popover.locator('.project-popover-arrow');
  const arrowPaths = arrow.locator('path');
  await expect(arrowPaths).toHaveCount(2);
  await expect(arrowPaths.nth(0)).toHaveAttribute('d', legacyArrowPaths[0]);
  await expect(arrowPaths.nth(1)).toHaveAttribute('d', legacyArrowPaths[1]);

  // The arrow SVG is rotated 180deg so its tip terminates at the anchor, and
  // the settled box bottom sits flush with the anchor top, centred over it.
  await expect(arrow.locator('svg')).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
  // Let the anchor's 0.25s hover travel and the tooltip entrance settle first.
  await page.waitForTimeout(450);
  const geometry = await page.evaluate(() => {
    const anchor = document.querySelector('#creatine h2 > .anchorjs-link')!.getBoundingClientRect();
    const box = document.querySelector('[id^="heading-popover-creatine"] .project-tip-box')!.getBoundingClientRect();
    const arrowSvg = document.querySelector('[id^="heading-popover-creatine"] .project-popover-arrow svg')!.getBoundingClientRect();
    return {
      bottomFlush: box.bottom - anchor.top,
      centreDx: (box.left + box.width / 2) - (anchor.left + anchor.width / 2),
      arrowTipBelowBox: arrowSvg.bottom - box.bottom,
    };
  });
  expect(Math.abs(geometry.bottomFlush)).toBeLessThanOrEqual(1.5);
  expect(Math.abs(geometry.centreDx)).toBeLessThanOrEqual(1.5);
  expect(geometry.arrowTipBelowBox).toBeCloseTo(6, 0);

  // Production copied state: the hover tippy hides on click while a separate
  // click-triggered tooltip enters fresh, holds 750ms, then dismisses itself.
  const feedback = page.locator(`#${await link.getAttribute('aria-controls')}-feedback .project-tip-box`);
  await expect(feedback).toBeHidden();
  await link.click();
  await expect(feedback).toBeVisible();
  await expect(feedback).toHaveText('Link Copied');
  await expect(popover).toBeHidden();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#creatine');
  await expect(feedback).toBeHidden({ timeout: 1_500 });
});

test('note callout icons share one inline row and the legacy palette on every surface', async ({ page }) => {
  const surfaces = [
    { path: '/supplements/', selector: '.supplement-note .alert-title' },
    { path: '/', selector: '.home-note .alert-title' },
    { path: '/calorie-calculator/', selector: '.project-callout--note .alert-title' },
    { path: '/books/', selector: '.project-callout--note .alert-title' },
    { path: '/lose-fat-gain-muscle/', selector: '.project-callout--note .alert-title' },
  ] as const;

  for (const surface of surfaces) {
    await page.goto(surface.path);
    const title = page.locator(surface.selector).first();
    await expect(title).toBeVisible();
    // Legacy addon.css palette: --color-accent-fg #2F81F7 for Note.
    await expect(title).toHaveCSS('color', 'rgb(47, 129, 247)');
    const rows = await title.evaluate((node) => {
      const svg = node.querySelector('svg')!.getBoundingClientRect();
      const textNode = [...node.childNodes, ...[...node.children].flatMap((child) => [...child.childNodes])]
        .find((child) => child.nodeType === 3 && child.textContent?.trim());
      const range = document.createRange();
      range.selectNodeContents(textNode!);
      const text = range.getBoundingClientRect();
      return {
        sameRow: text.left >= svg.right - 1 && Math.abs((svg.top + svg.height / 2) - (text.top + text.height / 2)) < 8,
        svgSize: [svg.width, svg.height],
        gap: text.left - svg.right,
      };
    });
    expect(rows.sameRow, `${surface.path} icon and title word must share one row`).toBe(true);
    expect(rows.svgSize).toEqual([16, 16]);
    expect(rows.gap).toBeCloseTo(8, 0);
  }

  // Important keeps the legacy purple; Warning keeps the legacy amber.
  await page.goto('/blog/calorie-calculator-how-to');
  const important = page.locator('.project-callout--important .alert-title').first();
  await expect(important).toHaveCSS('color', 'rgb(163, 113, 247)');
});

test('share rail icons match the production visible-path geometry inside the 40px circles', async ({ page }) => {
  await page.goto('/supplements/');
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  await expect(page.locator('#sh-box')).toHaveAttribute('aria-hidden', 'false');

  // Production computed geometry captured from the retained legacy build at
  // 1440px: [x, y, width, height] of each icon SVG inside its 40px circle.
  const productionIconBoxes = {
    'tw-box': { x: 10, y: 9.14, w: 20, h: 21.53 },
    'f-box': { x: 12, y: 8.17, w: 14, h: 24.5 },
    'li-box': { x: 3.59, y: 3.02, w: 32.8, h: 32.8 },
    'e-box': { x: 9, y: 8.92, w: 22, h: 22 },
    'l-box': { x: 9, y: 8.92, w: 22, h: 22 },
  } as const;

  for (const [id, expected] of Object.entries(productionIconBoxes)) {
    const measured = await page.evaluate((circleId) => {
      const circle = document.getElementById(circleId)!;
      const svg = circle.querySelector('svg.icon')!.getBoundingClientRect();
      const box = circle.getBoundingClientRect();
      return { x: svg.x - box.x, y: svg.y - box.y, w: svg.width, h: svg.height };
    }, id);
    expect(measured.x, `${id} icon x`).toBeCloseTo(expected.x, 0);
    expect(measured.y, `${id} icon y`).toBeCloseTo(expected.y, 0);
    expect(measured.w, `${id} icon width`).toBeCloseTo(expected.w, 0);
    expect(measured.h, `${id} icon height`).toBeCloseTo(expected.h, 0);
  }

  // The Facebook and LinkedIn icons must use the retained legacy ids that key
  // the production per-icon width and offset rules.
  await expect(page.locator('#f-box svg#faceb')).toHaveCount(1);
  await expect(page.locator('#li-box svg#lkn')).toHaveCount(1);
  await expect(page.locator('#e-box svg#eml')).toHaveCount(1);
  await expect(page.locator('#l-box svg#lnk')).toHaveCount(1);
});

test('share rail tooltips use the production bouncy right-side entrance and copied state', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/supplements/');
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));

  const railBox = await page.locator('#sh-box').boundingBox();
  const twitterCircle = await page.locator('#tw-box').boundingBox();
  expect(railBox).not.toBeNull();
  expect(twitterCircle).not.toBeNull();
  // Production: the first 40px circle starts 8px below the rail top.
  expect(twitterCircle!.y - railBox!.y).toBeCloseTo(8, 1);

  const labels = [
    ['tw-box', 'Share on Twitter', 'rgb(27, 166, 255)'],
    ['f-box', 'Share on Facebook', 'rgb(17, 100, 187)'],
    ['li-box', 'Share on Linkedin', 'rgb(0, 119, 181)'],
    ['e-box', 'Email this to Someone', 'rgb(0, 172, 152)'],
    ['l-box', 'Click to Copy URL', 'rgb(31, 97, 141)'],
  ] as const;

  for (const [id, label, colour] of labels) {
    const trigger = page.locator(`#${id} a`);
    await trigger.hover();
    const tip = page.locator(`#${id} [data-share-tooltip]`);
    await expect(tip).toBeVisible();
    await expect(tip).toHaveText(label);
    await expect(tip).toHaveCSS('background-color', colour);
    await expect(tip).toHaveAttribute('data-placement', 'right');
    // Production tippy: 300ms ease over transform/visibility/opacity, hidden
    // state 20px toward the extreme (a linear 8px slide is rejected).
    await expect(tip).toHaveCSS('transition-property', 'transform, visibility, opacity');
    await expect(tip).toHaveCSS('transition-duration', '0.3s');
    await expect(tip).toHaveCSS('transition-timing-function', 'ease');
    const arrowPaths = tip.locator('.project-tip-arrow path');
    await expect(arrowPaths).toHaveCount(2);
    await expect(arrowPaths.nth(0)).toHaveAttribute('d', legacyArrowPaths[0]);
    await expect(arrowPaths.nth(1)).toHaveAttribute('d', legacyArrowPaths[1]);
    // Production popper offset: the settled box sits 10px right of the circle,
    // vertically centred on it. Let the 300ms entrance settle before reading.
    await page.waitForTimeout(400);
    const geometry = await page.evaluate((circleId) => {
      const circle = document.getElementById(circleId)!.getBoundingClientRect();
      const box = document.querySelector(`#${circleId} [data-share-tooltip]`)!.getBoundingClientRect();
      return {
        dx: box.left - circle.right,
        dyCentre: (box.top + box.height / 2) - (circle.top + circle.height / 2),
      };
    }, id);
    expect(geometry.dx).toBeCloseTo(10, 0);
    expect(Math.abs(geometry.dyCentre)).toBeLessThanOrEqual(1);
    // Hidden-state travel proves the entrance direction and distance.
    const hiddenTravel = await page.evaluate((circleId) => {
      const box = document.querySelector(`#${circleId} [data-share-tooltip]`) as HTMLElement;
      const previous = box.dataset.state;
      const previousTransition = box.style.transition;
      box.style.transition = 'none';
      box.dataset.state = 'hidden';
      const transform = getComputedStyle(box).transform;
      box.dataset.state = previous ?? 'hidden';
      box.style.transition = previousTransition;
      return transform;
    }, id);
    expect(hiddenTravel).toBe('matrix(1, 0, 0, 1, 20, 0)');
  }

  const copy = page.locator('[data-copy-page-link]');
  await copy.hover();
  await expect(page.locator('#l-box [data-share-tooltip]')).toHaveText('Click to Copy URL');
  const before = await page.evaluate(() => ({ href: location.href, scrollY }));
  await copy.click();
  const feedback = page.locator('#l-box [data-share-feedback]');
  await expect(feedback).toBeVisible();
  await expect(feedback).toHaveText('Link Copied!');
  await expect(page.locator('#l-box [data-share-tooltip]')).toBeHidden();
  expect(await page.evaluate(() => ({ href: location.href, scrollY }))).toEqual(before);
  // Production hold: the copied tooltip dismisses itself after one second.
  await expect(feedback).toBeHidden({ timeout: 2_000 });
});

test('supplement evidence panel exposes the production-side triangle and geometry', async ({ page }) => {
  await page.goto('/supplements/');
  const badge = page.locator('#creatine [data-supplement-evidence]');
  await badge.hover();
  const panel = page.locator('#evidence-help-creatine');
  await expect(panel).toBeVisible();
  await page.waitForTimeout(250);
  await expect(panel).toHaveCSS('width', '276px');
  await expect(panel).toHaveCSS('border', '1px solid rgba(0, 0, 0, 0.2)');
  await expect(panel).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.06) 0px 0px 2px 0px, rgba(0, 0, 0, 0.12) 0px 14px 32px 0px');
  await expect(panel).toHaveCSS('overflow', 'visible');

  const geometry = await page.evaluate(() => {
    const badge = document.querySelector('#creatine [data-supplement-evidence]')!.getBoundingClientRect();
    const panel = document.querySelector('#evidence-help-creatine')!.getBoundingClientRect();
    const arrowBorder = getComputedStyle(document.querySelector('#evidence-help-creatine')!, '::before');
    const arrowFill = getComputedStyle(document.querySelector('#evidence-help-creatine')!, '::after');
    return {
      badgeToPanelGap: panel.left - badge.right,
      arrowDisplay: arrowBorder.display,
      arrowRightWidth: arrowBorder.borderRightWidth,
      arrowRightColor: arrowBorder.borderRightColor,
      arrowFillRightWidth: arrowFill.borderRightWidth,
      arrowFillRightColor: arrowFill.borderRightColor,
    };
  });
  expect(geometry.badgeToPanelGap).toBeCloseTo(8, 0);
  expect(geometry).toMatchObject({
    arrowDisplay: 'block',
    arrowRightWidth: '8px',
    arrowRightColor: 'rgba(0, 0, 0, 0.25)',
    arrowFillRightWidth: '7px',
    arrowFillRightColor: 'rgb(255, 255, 255)',
  });
});

test('list rhythm, guide TOC spacing, and back-to-top match the legacy addon.css contract', async ({ page }) => {
  await page.goto('/supplements/');
  const firstItem = page.locator('#creatine .supplement-detail ul li').first();
  await expect(firstItem).toHaveCSS('margin-bottom', '5px');
  await expect(firstItem).toHaveCSS('line-height', '33.18px');
  const afterList = page.locator('#creatine .supplement-detail ul + p').first();
  await expect(afterList).toHaveCSS('margin-top', '29px');
  await expect(afterList).toHaveCSS('margin-bottom', '0px');
  await expect(afterList).toHaveCSS('line-height', '35px');

  await page.goto('/calorie-calculator/');
  const noteList = page.locator('.calculator-guide .legacy-content ul').first();
  const guideParagraph = page.locator('.calculator-guide .legacy-content ul + p').first();
  await expect(guideParagraph).toHaveCSS('margin-top', '29px');
  await expect(guideParagraph).toHaveCSS('line-height', '35px');
  const listGap = await page.evaluate(() => {
    const list = document.querySelector('.calculator-guide .legacy-content ul')!;
    const next = list.nextElementSibling!;
    return next.getBoundingClientRect().top - list.getBoundingClientRect().bottom;
  });
  expect(listGap).toBeCloseTo(29, 0);
  await expect(noteList).toHaveCSS('margin-top', '10px');
  await expect(page.locator('#toc_container > #toc-ul > li').first()).toHaveCSS('margin-top', '0px');
  await expect(page.locator('#toc_container > #toc-ul > li').nth(1)).toHaveCSS('margin-top', '5px');
  await expect(page.locator('#toc_container ul ul').first()).toHaveCSS('margin-bottom', '0px');

  // Legacy #back-to-top: fixed 60px circle, 2%/3% offsets, icon background, 0.6 opacity after 1000px.
  const backToTop = page.locator('.back-to-top');
  await expect(backToTop).toHaveCSS('position', 'fixed');
  await expect(backToTop).toHaveCSS('width', '60px');
  await expect(backToTop).toHaveCSS('height', '60px');
  await expect(backToTop).toHaveCSS('border-radius', '50%');
  await expect(backToTop).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.6)');
  expect(await backToTop.evaluate((node) => getComputedStyle(node).backgroundImage)).toContain('/img/icon-back-to-top.svg');
  await page.evaluate(() => window.scrollTo(0, 1100));
  await expect(backToTop).toHaveClass(/show/);
  await expect(backToTop).toHaveCSS('opacity', '0.6');
  const box = (await backToTop.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(viewport.width - (box.x + box.width)).toBeCloseTo(viewport.width * 0.02, 0);
  expect(viewport.height - (box.y + box.height)).toBeCloseTo(viewport.height * 0.03, 0);
});
