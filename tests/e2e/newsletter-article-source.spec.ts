import { expect, test } from '@playwright/test';
import { configuredOrigin } from './configured-origin';

test('article newsletter form submits a source accepted by the API', async ({ page, request }, testInfo) => {
  await page.goto('/blog/breakup-energy');

  const sourceUrl = await page
    .locator('form.newsletter-form input[name="sourceUrl"]')
    .inputValue();
  const body = new URLSearchParams({
    email: 'reader@example.com',
    campaign: 'article-bottom',
    formId: 'article-bottom',
    sourceUrl,
    company: '',
  });

  const response = await request.post('/api/subscribe', {
    headers: {
      origin: configuredOrigin(testInfo),
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: body.toString(),
  });

  // The source passed validation: the request only fails closed at the challenge or provider
  // step (503 without a Turnstile secret, 400 challenge_failed with one), never invalid_source.
  expect([
    [503, 'newsletter_unavailable'],
    [400, 'challenge_failed'],
  ]).toContainEqual([response.status(), (await response.json()).error]);
  expect(sourceUrl).toBe('/blog/breakup-energy');
});
