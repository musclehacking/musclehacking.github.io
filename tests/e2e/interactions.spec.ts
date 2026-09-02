import { expect, test } from '@playwright/test';

test('calculator renders exact Standard, LeanGains, and keto defaults', async ({ page }) => {
  await page.goto('/calorie-calculator/');
  await expect(page.getByText('1805 cal', { exact: true })).toBeVisible();
  await expect(page.getByText('2166 cal', { exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '176', exact: true })).toBeVisible();
  await expect(page.locator('.calculator-change')).toContainText('-0.39 kg per week');

  await page.goto('/calorie-calculator/?leangains');
  await expect(page.getByText('2240 cal', { exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '218', exact: true })).toBeVisible();
  await expect(page.locator('.calculator-change')).toContainText('-0.45 kg per week');

  await page.goto('/calorie-calculator/?keto');
  await expect(page.getByRole('cell', { name: '105', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '20', exact: true })).toBeVisible();
});

test('calculator unit toggle preserves results for the same physical inputs', async ({ page }) => {
  await page.goto('/calorie-calculator/');
  await expect(
    page.locator('astro-island[component-url*="Calculator"]'),
  ).not.toHaveAttribute('ssr', '');

  await page.getByLabel('Units').selectOption('imperial');

  await expect(page.getByLabel('Weight', { exact: true })).toHaveValue('176.4');
  await expect(page.getByLabel('Height', { exact: true })).toHaveValue('70.9');
  await expect(page.getByText('1805 cal', { exact: true })).toBeVisible();
  await expect(page.getByText('2166 cal', { exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1733', exact: true })).toBeVisible();

  await page.getByLabel('Units').selectOption('metric');

  await expect(page.getByLabel('Weight', { exact: true })).toHaveValue('80');
  await expect(page.getByLabel('Height', { exact: true })).toHaveValue('180.1');
  await expect(page.getByText('1805 cal', { exact: true })).toBeVisible();
  await expect(page.getByText('2166 cal', { exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1733', exact: true })).toBeVisible();
});

test('calculator keeps accepted imperial boundary weights valid after switching to metric', async ({ page }) => {
  await page.goto('/calorie-calculator/');
  const units = page.getByLabel('Units');
  const weight = page.getByLabel('Weight', { exact: true });
  const copy = page.getByRole('button', { name: 'Copy' });

  for (const [imperialWeight, metricWeight] of [
    ['66.1', '30'],
    ['661.4', '300'],
  ] as const) {
    await units.selectOption('imperial');
    await weight.fill(imperialWeight);
    await expect(weight).not.toHaveAttribute('aria-invalid', 'true');
    await expect(copy).toBeEnabled();

    await units.selectOption('metric');
    await expect(weight).toHaveValue(metricWeight);
    await expect(weight).not.toHaveAttribute('aria-invalid', 'true');
    await expect(copy).toBeEnabled();
  }
});

test('calculator copies its current results and confirms success', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (text: string) => {
          Reflect.set(window, '__calculatorCopiedText', text);
          return Promise.resolve();
        },
      },
    });
  });

  await page.goto('/calorie-calculator/');
  await expect(
    page.locator('astro-island[component-url*="Calculator"]'),
  ).not.toHaveAttribute('ssr', '');
  await page.getByRole('button', { name: 'Copy' }).click();

  await expect(page.locator('.calculator-copy-status')).toHaveText('Results copied.');
  const copiedText = await page.evaluate(() =>
    Reflect.get(window, '__calculatorCopiedText'),
  );
  expect(copiedText).toContain('Your BMR is equal to 1805');
  expect(copiedText).toContain('Your TDEE is equal to 2166');
  expect(copiedText).toContain('1733|176|57|129|');
});

test('calculator clears copy success when the displayed results change', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () => Promise.resolve(),
      },
    });
  });

  await page.goto('/calorie-calculator/');
  await expect(
    page.locator('astro-island[component-url*="Calculator"]'),
  ).not.toHaveAttribute('ssr', '');
  await page.getByRole('button', { name: 'Copy' }).click();
  await expect(page.locator('.calculator-copy-status')).toHaveText('Results copied.');

  await page.getByLabel('Weight', { exact: true }).fill('81');

  await expect(page.getByText('1815 cal', { exact: true })).toBeVisible();
  await expect(page.locator('.calculator-copy-status')).toBeEmpty();
});

test('calculator ignores an old copy result after the displayed results change', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () => new Promise<void>((resolve) => {
          Reflect.set(window, '__resolveCalculatorCopy', resolve);
        }),
      },
    });
  });

  await page.goto('/calorie-calculator/');
  await expect(
    page.locator('astro-island[component-url*="Calculator"]'),
  ).not.toHaveAttribute('ssr', '');
  // The clipboard-invalidation contract is what matters here; a programmatic click avoids the
  // fixed header/share-bar overlap that pointer clicks hit on the scrolled mobile layout.
  await page.getByRole('button', { name: 'Copy' }).evaluate((button) => (button as HTMLButtonElement).click());
  await expect.poll(() => page.evaluate(
    () => typeof Reflect.get(window, '__resolveCalculatorCopy'),
  )).toBe('function');
  await page.getByLabel('Weight', { exact: true }).fill('81');
  await page.evaluate(() => Reflect.get(window, '__resolveCalculatorCopy')());

  await expect(page.getByText('1815 cal', { exact: true })).toBeVisible();
  await expect(page.locator('.calculator-copy-status')).toBeEmpty();
});

test('calculator reports clipboard permission failures without a page error', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () => Promise.reject(
          new DOMException('Write permission denied', 'NotAllowedError'),
        ),
      },
    });
  });

  await page.goto('/calorie-calculator/');
  await page.getByRole('button', { name: 'Copy' }).click();

  await expect(page.locator('.calculator-copy-status')).toHaveText(
    'Could not copy results. Please try again.',
  );
  expect(pageErrors).toEqual([]);
});

test('calculator help links expose guide sections to keyboard users', async ({ page }) => {
  await page.goto('/calorie-calculator/');

  const standardHelpLinks = [
    ['Stats', '#stats'],
    ['Activity Level', '#activity-level'],
    ['Goal', '#goal'],
    ['How Much Protein', '#how-much-protein'],
    ['Fat/Carb Calorie Split', '#fat-carb-calorie-split'],
    ['BMR', '#bmr'],
    ['TDEE', '#tdee'],
    ['Daily Calories and Macros', '#daily-calories-and-macros'],
    ['Estimated Weight Change per Week', '#estimated-weight-loss-per-week'],
  ] as const;

  for (const [name, fragment] of standardHelpLinks) {
    await expect(page.getByRole('link', { name: `Learn more about ${name}` })).toHaveAttribute(
      'href',
      fragment,
    );
    await expect(page.locator(fragment)).toHaveCount(1);
  }

  await page.getByLabel('Diet', { exact: true }).selectOption('leangains');
  const leangainsHelpLinks = [
    ['Age', '#age'],
    ['Weight', '#the-leangains-method'],
    ['Height', '#height'],
    ['Body Fat', '#body-fat'],
    ['Muscle Mass', '#muscle-mass'],
    ['Leangains Goal', '#goal-leangains'],
    ['Steps', '#steps'],
    ['Leangains Protein', '#how-much-protein-leangains'],
  ] as const;

  for (const [name, fragment] of leangainsHelpLinks) {
    await expect(page.getByRole('link', { name: `Learn more about ${name}` })).toHaveAttribute(
      'href',
      fragment,
    );
    await expect(page.locator(fragment)).toHaveCount(1);
  }

  // Native smooth scrolling is validated by the browser, but it makes the
  // fragment visibility assertion timing-dependent under traced mobile runs.
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

  const stepsHelp = page.getByRole('link', { name: 'Learn more about Steps' });
  await stepsHelp.focus();
  await stepsHelp.press('Enter');
  await expect(page).toHaveURL(/#steps$/);
  await expect(page.locator('#steps')).toBeInViewport();
});

test('supplement filters preserve exact visible order', async ({ page }) => {
  await page.goto('/supplements/');
  const proseLink = page.locator('.supplement-detail a:not(.inl-ref):not(.anchorjs-link)').first();
  await expect(proseLink).toHaveCSS('color', 'rgba(0, 0, 0, 0.84)');
  await expect(proseLink).toHaveCSS('box-shadow', 'rgb(32, 101, 147) 0px -2px 0px 0px inset');
  const visibleNames = async () => page.locator('[data-supplement-id]:visible h2').allTextContents();
  await expect.poll(visibleNames).toEqual(['Creatine', 'Whey Protein', 'Beta-Alanine', 'Alpha GPC', 'Ashwagandha', 'Melatonin', 'Fish Oil', 'Spirulina']);

  await page.getByRole('button', { name: 'Sleep', exact: true }).click();
  await expect.poll(visibleNames).toEqual(['Melatonin', 'Ashwagandha', 'L-Theanine']);

  await page.getByRole('button', { name: 'Show All', exact: true }).click();
  await expect.poll(visibleNames).toHaveLength(19);
  expect((await visibleNames()).at(-1)).toBe('Glucosamine');

  await page.getByRole('button', { name: 'Muscle Growth', exact: true }).click();
  const evidenceButton = page.locator('[data-supplement-id="creatine"] .popover-trigger');
  await evidenceButton.focus();
  await evidenceButton.press('Enter');
  await expect(page.locator('#evidence-help-creatine')).toBeVisible();
  await page.getByRole('button', { name: 'Show All', exact: true }).click();
  await expect(page.locator('#evidence-help-creatine')).toBeHidden();
  await expect(evidenceButton).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Muscle Growth', exact: true }).click();
  await evidenceButton.focus();
  await evidenceButton.press('Enter');
  await expect(page.locator('#evidence-help-creatine')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#evidence-help-creatine')).toBeHidden();
  await expect(evidenceButton).toBeFocused();
});

test('supplement filters update their context note and first-result state', async ({ page }) => {
  await page.goto('/supplements/');
  const pageWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client);

  const note = page.locator('[data-supplement-category-note]');
  const categoryTop = page.locator('.category-top');
  const cases = [
    {
      filter: 'Muscle Growth',
      firstResult: 'Creatine',
      title: 'Note',
      note: 'This category includes includes supplements that increase either muscle growth or power output.',
    },
    { filter: 'Sleep', firstResult: 'Melatonin' },
    { filter: 'Joint Health', firstResult: 'Fish Oil' },
    { filter: 'Bone Health', firstResult: 'Vitamin D' },
    {
      filter: 'Testosterone',
      firstResult: 'Zinc',
      title: 'Important',
      note: 'Zinc and magnesium supplements may contribute to normalizing testosterone levels only if there is an underlying deficiency in these minerals. Supplementing with these minerals in the absence of a deficiency has not been shown to improve testosterone levels.',
    },
    { filter: 'Focus', firstResult: 'Alpha GPC' },
    { filter: 'Brain Function', firstResult: 'Creatine' },
    {
      filter: 'Insulin Sensitivity',
      firstResult: 'Ceylon Cinnamon',
      title: 'Note',
      note: 'This category includes includes supplements that improve either insulin sensitivity or glucose control.',
    },
    { filter: 'Longevity', firstResult: 'Beta-Alanine' },
    { filter: 'Show All', firstResult: 'Creatine' },
  ] as const;

  for (const filterCase of cases) {
    await page.getByRole('button', { name: filterCase.filter, exact: true }).click();
    await expect(categoryTop).toHaveCount(1);
    await expect(categoryTop.locator('h2')).toHaveText(filterCase.firstResult);

    if ('note' in filterCase) {
      await expect(note).toBeVisible();
      await expect(note.locator('strong')).toContainText(filterCase.title);
      await expect(note.locator('p')).toContainText(filterCase.note);
    } else {
      await expect(note).toBeHidden();
    }
  }

  await page.getByRole('button', { name: 'What is this?', exact: true }).click();
  await expect(note).toBeHidden();
  await expect(categoryTop).toHaveCount(1);
  await expect(categoryTop).toHaveAttribute('id', 'supplement-information');
});

test('desktop supplement headings preserve their legacy self-links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/supplements/');

  const supplementHeading = page.locator('#creatine > .supplement-heading > h2');
  const detailHeading = page.locator('#creatine h3').filter({ hasText: 'Primary Benefits' }).first();

  await expect(supplementHeading.locator(':scope > a.anchorjs-link[href="#creatine"]')).toBeVisible();
  await expect(detailHeading).toHaveAttribute('id', 'creatine-primary-benefits');
  await expect(detailHeading.locator(':scope > a.anchorjs-link[href="#creatine-primary-benefits"]')).toBeVisible();
});

test('Show All does not leave empty evidence controls visible', async ({ page }) => {
  await page.goto('/supplements/');
  await page.getByRole('button', { name: 'Show All', exact: true }).click();

  await expect(page.locator('[data-supplement-evidence]:visible')).toHaveCount(0);
});

test('newsletter fails closed without provider credentials and rejects other methods', async ({ request }) => {
  for (const method of ['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE']) {
    const response = await request.fetch('/api/subscribe', { method, headers: { origin: 'http://127.0.0.1:8787' } });
    expect(response.status()).toBe(405);
    expect(response.headers().allow).toBe('POST');
    expect(response.headers()['content-security-policy']).toContain("default-src 'none'");
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  }

  const body = new URLSearchParams({
    email: 'reader@example.com',
    campaign: 'site',
    formId: 'join',
    sourceUrl: '/join/',
    company: '',
  });
  const crossOrigin = await request.post('/api/subscribe', {
    headers: { origin: 'https://attacker.example', 'content-type': 'application/x-www-form-urlencoded' },
    data: body.toString(),
  });
  expect(crossOrigin.status()).toBe(403);

  const postResponse = await request.post('/api/subscribe', {
    headers: {
      origin: 'http://127.0.0.1:8787',
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: body.toString(),
  });
  expect(postResponse.status()).toBe(503);
  expect(postResponse.headers()['cache-control']).toBe('no-store');
  expect(await postResponse.json()).toEqual({ error: 'newsletter_unavailable' });
});

test('newsletter safely rejects malformed multipart input', async ({ request }) => {
  const response = await request.post('/api/subscribe', {
    headers: {
      origin: 'http://127.0.0.1:8787',
      'content-type': 'multipart/form-data; boundary=broken',
    },
    data: 'this body has no multipart boundary',
  });

  expect(response.status()).toBe(400);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(response.headers()['content-security-policy']).toContain("default-src 'none'");
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-frame-options']).toBe('DENY');
  expect(await response.json()).toEqual({ error: 'malformed_form' });
});

test('core content and navigation remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/blog/breakup-energy');
  await expect(page.locator('h1')).toHaveText('Breakup Energy');
  await expect(page.getByRole('link', { name: 'Muscle Hacking home' })).toBeVisible();
  await page.goto('/supplements/');
  await expect(page.locator('[data-supplement-id]')).toHaveCount(19);
  await page.goto('/join/');
  await expect(page.locator('form.newsletter-form')).toHaveAttribute('method', 'post');
  await expect(page.locator('form.newsletter-form')).toHaveAttribute('action', '/api/subscribe');
  await context.close();
});

test('back-to-top control appears only after the page has been scrolled', async ({ page }) => {
  // Legacy scroll.nojquery.js ships the control on the calculator and supplement routes only,
  // and reveals it after a 1000px scroll.
  await page.goto('/books/');
  await expect(page.getByRole('link', { name: 'Back to top' })).toHaveCount(0);

  await page.goto('/supplements/');
  const backToTop = page.getByRole('link', { name: 'Back to top' });
  await expect(backToTop).toBeHidden();

  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(backToTop).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 1001));
  await expect(backToTop).toBeVisible();
});
