import { expect, test } from '@playwright/test';

test('article newsletter form submits a source accepted by the API', async ({ page, request }) => {
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
      origin: 'http://127.0.0.1:8787',
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: body.toString(),
  });

  expect(response.status()).toBe(503);
  expect(await response.json()).toEqual({ error: 'newsletter_unavailable' });
  expect(sourceUrl).toBe('/blog/breakup-energy');
});
