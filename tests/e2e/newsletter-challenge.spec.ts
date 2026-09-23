import { expect, test, type Page } from '@playwright/test';
import { site } from '../../src/config/site';

const TURNSTILE_SCRIPT = /^https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/u;
const DUMMY_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';

/**
 * Serves a stand-in for Cloudflare's api.js so the flow is hermetic. It records the render
 * options and either writes a token field (as real Turnstile does) or reports an error.
 */
async function stubTurnstile(page: Page, outcome: 'pass' | 'error') {
  const scriptRequests: string[] = [];
  const renders: unknown[] = [];
  // A binding survives the navigation that follows a successful native submit.
  await page.exposeFunction('__recordTurnstileRender', (options: unknown) => renders.push(options));
  await page.route(TURNSTILE_SCRIPT, async (route) => {
    scriptRequests.push(route.request().url());
    await route.fulfill({
      contentType: 'text/javascript',
      body: `window.turnstile = {
          render(container, options) {
            window.__recordTurnstileRender({ sitekey: options.sitekey, action: options.action, field: options['response-field-name'] });
            setTimeout(() => {
              if (${JSON.stringify(outcome)} === 'error') { options['error-callback'](); return; }
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = options['response-field-name'];
              input.value = ${JSON.stringify(DUMMY_TOKEN)};
              container.appendChild(input);
              options.callback(input.value);
            }, 50);
            return 'widget-1';
          },
          remove() {},
        };`,
    });
  });
  return { scriptRequests, renders };
}

test('newsletter submit runs the invisible Turnstile challenge and posts its token', async ({ page }) => {
  const { scriptRequests, renders } = await stubTurnstile(page, 'pass');
  await page.goto('/join/');
  // Nothing is fetched from Cloudflare until the reader submits.
  expect(scriptRequests).toEqual([]);

  const form = page.locator('form.newsletter-form').first();
  await form.locator('input[name="email"]').fill('reader@example.com');
  const posted = page.waitForRequest((request) => request.url().endsWith('/api/subscribe') && request.method() === 'POST');
  await form.locator('button[type="submit"]').click();

  const body = new URLSearchParams((await posted).postData() ?? '');
  expect(scriptRequests).toEqual(['https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit']);
  expect(body.get('cf-turnstile-response')).toBe(DUMMY_TOKEN);
  expect(body.get('email')).toBe('reader@example.com');
  expect(renders).toEqual([
    { sitekey: site.turnstileSiteKey, action: 'subscribe', field: 'cf-turnstile-response' },
  ]);
});

test('a failed Turnstile challenge shows the legacy alert and does not post', async ({ page }) => {
  await stubTurnstile(page, 'error');
  await page.goto('/join/');
  let posts = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/subscribe')) posts += 1;
  });

  const form = page.locator('form.newsletter-form').first();
  await form.locator('input[name="email"]').fill('reader@example.com');
  const dialog = page.waitForEvent('dialog');
  await form.locator('button[type="submit"]').click();
  const alert = await dialog;
  expect(alert.message()).toBe('Submission failed. Please try again.');
  await alert.dismiss();
  await expect(form).not.toHaveAttribute('aria-busy', 'true');
  expect(posts).toBe(0);
});

test('document CSP allows only the Turnstile origin for the challenge script and frame', async ({ request }) => {
  const csp = (await request.get('/join/')).headers()['content-security-policy'] ?? '';
  expect(csp).toMatch(/script-src 'self' https:\/\/challenges\.cloudflare\.com[ ;]/u);
  expect(csp).toContain('frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com;');
  expect(csp).not.toContain('google.com');
});
