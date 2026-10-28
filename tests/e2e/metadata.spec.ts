import { expect, test } from '@playwright/test';
import { routes } from '../../src/config/routes';

for (const route of routes) {
  test(`${route.path} emits the correct Open Graph type`, async ({ page }) => {
    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      'content',
      route.owner === 'blog' ? 'article' : 'website',
    );
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', image!);
    await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute('content', await page.locator('meta[property="og:image:alt"]').getAttribute('content') ?? '');
    await expect(page.locator('link[rel="describedby"]')).toHaveAttribute('href', 'https://www.musclehacking.com/llms.txt');
    const scripts = page.locator('script[type="application/ld+json"]');
    await expect(scripts).toHaveCount(route.indexable ? 1 : 0);
    if (route.indexable) {
      const graph = JSON.parse(await scripts.textContent() ?? '')['@graph'];
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(graph.find((node: Record<string, unknown>) => node['@type'] === 'WebPage')['@id']).toBe(`${canonical}#webpage`);
      const article = graph.find((node: Record<string, unknown>) => node['@type'] === 'BlogPosting');
      if (article) expect(article.headline).toBe((await page.locator('h1').innerText()).trim());
    }
  });
}

test('llms discovery serves UTF-8 operating guidance with working canonical resources', async ({ request }) => {
  const response = await request.get('/llms.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('text/plain; charset=utf-8');
  const output = await response.text();
  expect(output).toMatch(/^# Muscle Hacking\n\n> /);
  expect(output).toContain('**How to get started:**');
  const urls = [...output.matchAll(/^- \[.+?\]\((.+?)\)/gm)].map((match) => match[1]!);
  expect(new Set(urls).size).toBe(urls.length);
  for (const url of urls) {
    expect(new URL(url).origin).toBe('https://www.musclehacking.com');
    const resource = await request.get(new URL(url).pathname, { maxRedirects: 0 });
    expect(resource.status(), url).toBe(200);
  }
});
