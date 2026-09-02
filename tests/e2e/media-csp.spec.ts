import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __cspViolations: string[];
  }
}

const EMBEDDED_ARTICLE_PATH = '/blog/reject-modernity-embrace-masculinity';
const YOUTUBE_PRIVACY_ORIGIN = 'https://www.youtube-nocookie.com';

test('approved YouTube embeds satisfy the content security policy', async ({ page }) => {
  const consoleViolations: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error' && /content security policy/i.test(message.text())) {
      consoleViolations.push(message.text());
    }
  });

  await page.addInitScript(() => {
    const cspViolations: string[] = [];
    window.__cspViolations = cspViolations;
    window.addEventListener('securitypolicyviolation', (event) => {
      cspViolations.push(`${event.violatedDirective}: ${event.blockedURI}`);
    });
  });

  const response = await page.goto(EMBEDDED_ARTICLE_PATH, { waitUntil: 'domcontentloaded' });
  const csp = response?.headers()['content-security-policy'];

  expect(csp).toContain(`frame-src ${YOUTUBE_PRIVACY_ORIGIN}`);
  await expect(page.locator(`iframe[src^="${YOUTUBE_PRIVACY_ORIGIN}/embed/"]`)).toHaveCount(7);

  const browserViolations = await page.evaluate(() => window.__cspViolations);
  expect(browserViolations).toEqual([]);
  expect(consoleViolations).toEqual([]);
});
