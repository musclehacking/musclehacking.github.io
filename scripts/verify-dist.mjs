import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { blogSlugs, routes } from '../src/config/routes.ts';
import { site } from '../src/config/site.ts';
import { findForbiddenOutputMatches } from './verify-dist-output.ts';

const clientRoot = new URL('../dist/client/', import.meta.url).pathname;
const legacyBlogRoot = new URL('../blog/', import.meta.url).pathname;
const legacyPages = JSON.parse(readFileSync(new URL('../tests/fixtures/legacy/pages.json', import.meta.url), 'utf8')).pages;
const expectedTitles = JSON.parse(readFileSync(new URL('../tests/fixtures/expected-titles.json', import.meta.url), 'utf8'));
const failures = [];
const fail = (message) => failures.push(message);

const routeFile = (route) => {
  if (route.path === '/') return 'index.html';
  if (route.slashMode === 'no-slash') return `${route.path.slice(1)}.html`;
  return `${route.path.slice(1)}index.html`;
};

const expectedHtmlFiles = routes.map(routeFile);
for (const relativePath of [...expectedHtmlFiles, '404.html', 'feed.xml', 'sitemap.xml', 'robots.txt', 'llms.txt', '_headers']) {
  if (!existsSync(join(clientRoot, relativePath))) fail(`Missing output: ${relativePath}`);
}

const knownRoutePaths = new Set(routes.flatMap((route) => [route.path, route.path.replace(/\/$/, '') || '/']));
const generatedHtml = [...expectedHtmlFiles, '404.html'];

for (const relativePath of generatedHtml) {
  const html = readFileSync(join(clientRoot, relativePath), 'utf8');
  const $ = load(html);
  const label = `/${relativePath}`;
  if ($('title').length !== 1 || !$('title').text().trim()) fail(`${label}: expected one non-empty title`);
  if ($('title').text() !== expectedTitles[relativePath]) fail(`${label}: document title differs from the pre-authoring build`);
  if ($('meta[name="description"]').length !== 1 || !$('meta[name="description"]').attr('content')?.trim()) fail(`${label}: expected one description`);
  if ($('meta[property="og:title"]').length !== 1) fail(`${label}: expected one og:title`);
  if ($('meta[property="og:site_name"]').length !== 1) fail(`${label}: expected one og:site_name`);
  if ($('meta[property="og:locale"]').length !== 1) fail(`${label}: expected one og:locale`);
  if ($('meta[property="og:locale"]').attr('content') !== site.openGraphLocale) fail(`${label}: og:locale must be ${site.openGraphLocale}`);
  if ($('meta[name="twitter:title"]').length !== 1) fail(`${label}: expected one twitter:title`);
  if ($('link[rel="canonical"]').length !== 1) fail(`${label}: expected one canonical`);
  if ($('html').attr('lang') !== 'en') fail(`${label}: expected html lang=en`);
  if (!$('link[rel="canonical"]').attr('href')?.startsWith(site.origin)) fail(`${label}: canonical must use production origin`);
  if ($('main').length !== 1) fail(`${label}: expected one main landmark`);
  if ($('h1').length !== 1 || !$('h1').first().text().trim()) fail(`${label}: expected one visible h1`);
  const headerPolicy = readFileSync(join(clientRoot, '_headers'), 'utf8');
  $('script:not([src])').each((_, script) => {
    const source = $(script).html() ?? '';
    const hash = `'sha256-${createHash('sha256').update(source).digest('base64')}'`;
    if (!headerPolicy.includes(hash)) fail(`${label}: inline script hash is missing from CSP`);
  });

  $('img').each((_, image) => {
    if ($(image).attr('alt') === undefined) fail(`${label}: image is missing alt`);
    if (!$(image).attr('width') || !$(image).attr('height')) fail(`${label}: image is missing dimensions`);
  });

  $('a[href]').each((_, anchor) => {
    const href = $(anchor).attr('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || /^https?:\/\//.test(href)) return;
    const path = href.split(/[?#]/, 1)[0];
    if (!path?.startsWith('/')) return;
    if (knownRoutePaths.has(path) || ['/sitemap.xml', '/feed.xml', '/robots.txt', '/llms.txt', '/404.html'].includes(path)) return;
    if (existsSync(join(clientRoot, path.slice(1)))) return;
    fail(`${label}: broken internal link ${href}`);
  });
}

for (const legacyPage of legacyPages) {
  const route = routes.find(({ path }) => path === legacyPage.path);
  if (!route) {
    fail(`${legacyPage.path}: legacy newsletter placement has no matching public route`);
    continue;
  }

  const html = readFileSync(join(clientRoot, routeFile(route)), 'utf8');
  const $ = load(html);
  const actualFormCount = $('form.newsletter-form').length;
  const expectedFormCount = legacyPage.renderedFormCount ?? legacyPage.formCount;
  if (actualFormCount !== expectedFormCount) {
    fail(`${legacyPage.path}: expected ${expectedFormCount} newsletter forms from the rendered legacy placement matrix, found ${actualFormCount}`);
  }
}

const normalizeText = (value) => value.replaceAll('\u200b', '').replace(/\s+/g, ' ').trim();
for (const slug of blogSlugs) {
  const legacyPage = load(readFileSync(join(legacyBlogRoot, `${slug}.html`), 'utf8'));
  const legacyBody = legacyPage('.post-body').first();
  // Footer disclosures belong to the shared article ending, not the retained article copy.
  legacyBody.find('#comm').nextUntil('#post-nav').remove();
  legacyBody.find('script, #share, #comm, .e-on-delay, .email-float, form').remove();
  const legacyNavigation = legacyPage('#post-nav').first().clone();
  legacyBody.find('#post-nav').remove();

  const generatedHtml = readFileSync(join(clientRoot, 'blog', `${slug}.html`), 'utf8');
  const generatedPage = load(generatedHtml);
  const generatedBody = generatedPage('.legacy-content').first();
  const generatedNavigation = generatedPage('#post-nav').first();
  const generatedEnding = generatedPage('[data-content-ending]').first();
  if (generatedBody.find('pre.astro-code').length > 0) fail(`/blog/${slug}: article body contains escaped source code`);
  if (normalizeText(generatedBody.text()) !== normalizeText(legacyBody.text())) fail(`/blog/${slug}: article body text differs from the retained legacy content`);
  for (const selector of ['a[href]', 'img', 'iframe']) {
    if (generatedBody.find(selector).length !== legacyBody.find(selector).length) fail(`/blog/${slug}: retained ${selector} count differs from legacy content`);
  }
  const legacyLinkText = legacyNavigation.find('a').map((_, link) => normalizeText(legacyPage(link).text())).get();
  const generatedLinkText = generatedNavigation.find('a').map((_, link) => normalizeText(generatedPage(link).text())).get();
  if (JSON.stringify(generatedLinkText) !== JSON.stringify(legacyLinkText)) fail(`/blog/${slug}: article navigation text differs from the retained legacy content`);
  const legacyLinks = legacyNavigation.find('a').map((_, link) => `${legacyPage(link).attr('id')}|${legacyPage(link).attr('href')}|${legacyPage(link).attr('title')}`).get();
  const generatedLinks = generatedNavigation.find('a').map((_, link) => `${generatedPage(link).attr('id')}|${generatedPage(link).attr('href')}|${generatedPage(link).attr('title')}`).get();
  if (JSON.stringify(generatedLinks) !== JSON.stringify(legacyLinks)) fail(`/blog/${slug}: article navigation links differ from the retained legacy content`);
  const newsletterOffset = generatedHtml.indexOf('data-newsletter-placement="article-bottom"');
  const shareOffset = generatedHtml.indexOf('class="share-links"');
  const navigationOffset = generatedHtml.indexOf('id="post-nav"');
  if (!(newsletterOffset >= 0 && shareOffset > newsletterOffset && navigationOffset > shareOffset)) fail(`/blog/${slug}: server-rendered article ending order is incorrect`);
  const expectedEndingOrder = slug === 'healthy-low-calorie-foods'
    ? ['newsletter-signup', 'share', 'comm', 'affiliate-disclaimer', 'post-nav']
    : ['newsletter-signup', 'share', 'comm', 'post-nav'];
  const generatedEndingOrder = generatedEnding.children().map((_, child) => generatedPage(child).attr('id') || (generatedPage(child).attr('class') ?? '').split(/\s+/)[0]).get();
  if (JSON.stringify(generatedEndingOrder) !== JSON.stringify(expectedEndingOrder)) fail(`/blog/${slug}: complete article ending sequence is incorrect`);
  const expectedRailCount = slug === 'calorie-calculator-how-to' ? 0 : 1;
  if (generatedPage('#sh-box').length !== expectedRailCount) fail(`/blog/${slug}: floating share rail presence is incorrect`);

  const legacyHeadingIds = legacyBody.find('h2[id], h3[id], h4[id], h5[id]')
    .map((_, heading) => (legacyPage(heading).attr('id') ?? '').replace(/^#/, '')).get();
  const generatedIds = new Set(generatedBody.find('[id]').map((_, element) => generatedPage(element).attr('id')).get());
  for (const id of legacyHeadingIds) {
    if (!generatedIds.has(id)) fail(`/blog/${slug}: missing retained heading id ${id}`);
  }
  generatedBody.find('a[href^="#"]').each((_, anchor) => {
    const id = decodeURIComponent((generatedPage(anchor).attr('href') ?? '').slice(1));
    const pageIds = new Set(generatedPage('[id]').map((__, element) => generatedPage(element).attr('id')).get());
    if (id && !pageIds.has(id)) fail(`/blog/${slug}: unresolved fragment #${id}`);
  });
}

for (const [path, legacyRelativePath] of [
  ['/books/', 'books/index.html'],
  ['/lose-fat-gain-muscle/', 'lose-fat-gain-muscle/index.html'],
]) {
  const route = routes.find((candidate) => candidate.path === path);
  if (!route) {
    fail(`${path}: route is missing from the registry`);
    continue;
  }
  const legacyPage = load(readFileSync(new URL(`../${legacyRelativePath}`, import.meta.url), 'utf8'));
  const legacyBody = legacyPage('.post-body').first();
  const legacyNavigation = legacyPage('#post-nav').first().clone();
  legacyBody.find('script, style, form, #share, #comm, #post-nav, .e-on-delay, .email-float').remove();
  const generatedPage = load(readFileSync(join(clientRoot, routeFile(route)), 'utf8'));
  const generatedBody = generatedPage('.legacy-content').first();
  const generatedNavigation = generatedPage('#post-nav').first();
  if (normalizeText(generatedBody.text()) !== normalizeText(legacyBody.text())) fail(`${path}: long-form body text differs from retained legacy content`);
  for (const selector of ['a[href]', 'img', 'iframe']) {
    if (generatedBody.find(selector).length !== legacyBody.find(selector).length) fail(`${path}: retained ${selector} count differs from legacy content`);
  }
  const legacyLinks = legacyNavigation.find('a').map((_, link) => `${legacyPage(link).attr('id')}|${legacyPage(link).attr('href')}|${legacyPage(link).attr('title')}`).get();
  const generatedLinks = generatedNavigation.find('a').map((_, link) => `${generatedPage(link).attr('id')}|${generatedPage(link).attr('href')}|${generatedPage(link).attr('title')}`).get();
  if (JSON.stringify(generatedLinks) !== JSON.stringify(legacyLinks)) fail(`${path}: long-form navigation links differ from retained legacy content`);
}

for (const { path, disclaimer } of [
  { path: '/calorie-calculator/', disclaimer: true },
  { path: '/supplements/', disclaimer: true },
  { path: '/books/', disclaimer: true },
  { path: '/lose-fat-gain-muscle/', disclaimer: false },
]) {
  const route = routes.find((candidate) => candidate.path === path);
  if (!route) {
    fail(`${path}: route is missing from the registry`);
    continue;
  }
  const page = load(readFileSync(join(clientRoot, routeFile(route)), 'utf8'));
  const endingOrder = page('[data-content-ending]').children().map((_, child) => page(child).attr('id') || (page(child).attr('class') ?? '').split(/\s+/)[0]).get();
  const expectedOrder = disclaimer
    ? ['newsletter-signup', 'share', 'comm', 'affiliate-disclaimer', 'post-nav']
    : ['newsletter-signup', 'share', 'comm', 'post-nav'];
  if (JSON.stringify(endingOrder) !== JSON.stringify(expectedOrder)) fail(`${path}: complete long-form ending sequence is incorrect`);
  if (page('#sh-box').length !== 1) fail(`${path}: expected one floating share rail`);
}

for (const { forbidden, outputPath } of findForbiddenOutputMatches(clientRoot)) {
  fail(`Forbidden output string: ${forbidden} in ${outputPath}`);
}
if (/vary:\s*accept/i.test(readFileSync(join(clientRoot, '_headers'), 'utf8'))) fail('Vary: Accept is not allowed');
if (/script-src[^;]*'unsafe-inline'/i.test(readFileSync(join(clientRoot, '_headers'), 'utf8'))) fail("script-src must not include 'unsafe-inline'");

const scriptDirectory = join(clientRoot, '_astro');
const calculatorHtml = readFileSync(join(clientRoot, 'calorie-calculator/index.html'), 'utf8');
const calculatorScripts = [...calculatorHtml.matchAll(/(?:src|component-url|renderer-url)="\/_astro\/([^"?]+\.js)/g)].map((match) => match[1]);
const uniqueCalculatorScripts = [...new Set(calculatorScripts)];
const calculatorBytes = uniqueCalculatorScripts.reduce((total, script) => total + gzipSync(readFileSync(join(scriptDirectory, script))).byteLength, 0);
if (calculatorBytes > 100_000) fail(`Calculator route: ${calculatorBytes} compressed JavaScript bytes exceeds 100000`);

const supplementHtml = readFileSync(join(clientRoot, 'supplements/index.html'), 'utf8');
const supplementScripts = [...supplementHtml.matchAll(/src="\/_astro\/([^"?]+\.js)/g)].map((match) => match[1]);
const supplementBytes = [...new Set(supplementScripts)].reduce((total, script) => total + gzipSync(readFileSync(join(scriptDirectory, script))).byteLength, 0);
if (supplementBytes > 35_000) fail(`Supplements route: ${supplementBytes} compressed JavaScript bytes exceeds 35000`);

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${generatedHtml.length} HTML files, ${routes.length} public routes, expected titles, article and long-form bodies, fragments, discovery output, CSP, links, images, browser output forbidden strings, and JavaScript budgets.`);
}
