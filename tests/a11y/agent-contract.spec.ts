import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { AGENT_ACCESSIBILITY_RULES } from './agent-accessibility.rules';

// Discover built documents rather than maintaining another public route inventory.
const output = fileURLToPath(new URL('../../dist/client/', import.meta.url));
const routes = readdirSync(output, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.html'))
  .map((file) => new URL(load(readFileSync(`${output}${file}`, 'utf8'))('link[rel="canonical"]').attr('href')!).pathname)
  .sort();

async function scan(page: Page) {
  const results = await new AxeBuilder({ page }).withRules([...AGENT_ACCESSIBILITY_RULES]).analyze();
  expect(results.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    return ['127.0.0.1', 'localhost'].includes(host) ? route.continue() : route.abort();
  });
});

for (const route of routes) {
  test(`${route} exposes valid names, roles and relationships`, async ({ page }) => {
    await page.goto(route);
    await scan(page);
  });
}

test('mobile navigation exposes its expanded state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  // The existing CSS hamburger contributes to the computed accessible name.
  const menu = page.getByRole('button', { name: /Menu$/ });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await scan(page);
});

for (const mode of ['leangains', 'keto']) {
  test(`calculator ${mode} controls expose valid names and relationships`, async ({ page }) => {
    await page.goto(`/calorie-calculator/?${mode}`);
    await expect(page.locator('.calculator-results')).toBeVisible();
    await scan(page);
  });
}

test('supplement filtering and evidence disclosure preserve the accessibility tree', async ({ page }) => {
  await page.goto('/supplements/');
  await page.getByRole('button', { name: 'Show All', exact: true }).click();
  await expect(page.locator('[data-supplement-filter="show-all"]')).toHaveAttribute('aria-pressed', 'true');
  await scan(page);
  await page.locator('[data-supplement-filter="muscle-growth"]').click();
  const evidence = page.locator('[data-supplement-popover]:visible').first();
  await evidence.focus();
  await expect(evidence).toHaveAttribute('aria-expanded', 'true');
  await scan(page);
});

test('the newsletter dialog exposes its open state and restores focus when dismissed', async ({ page }) => {
  await page.clock.install();
  await page.goto('/calorie-calculator/');
  const invoker = page.locator('#calculator-age');
  await invoker.focus();
  await page.clock.fastForward(30_100);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await scan(page);
  await page.keyboard.press('Escape');
  await page.clock.fastForward(400);
  await expect(dialog).not.toBeVisible();
  await expect(invoker).toBeFocused();
});
