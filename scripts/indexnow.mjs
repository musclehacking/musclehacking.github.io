import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { load } from 'cheerio';
import { site as configuration } from '../src/config/site.ts';

const ROOT = resolve(import.meta.dirname, '..');
const ORIGIN = new URL(configuration.origin).origin;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const KEY_PATH = '/indexnow.txt';
const ATTEMPTS = 3;
const MAX_URLS = 10_000;


async function waitForRetry(milliseconds) {
  await sleep(milliseconds);
}


function hash(body) {
  return createHash('sha256').update(body).digest('hex');
}


/** Keep sitemap reads and submissions on the public marketing host. */
function canonicalUrl(value) {
  const url = new URL(value);
  if (url.origin !== ORIGIN || url.href !== value || url.search || url.hash || url.username || url.password || /%2f|%5c|%00/i.test(value)) {
    throw new Error('IndexNow requires canonical site URLs without query strings.');
  }
  return url;
}


function localFile(directory, url, page = false) {
  const path = decodeURIComponent(canonicalUrl(url).pathname);
  const file = resolve(directory, `.${path}${page && !path.endsWith('/') ? '.html' : ''}`, path.endsWith('/') ? 'index.html' : '');
  if (!file.startsWith(`${resolve(directory)}${sep}`)) throw new Error('Sitemap path escapes the built site.');
  return file;
}


function sitemapLocations(xml) {
  const $ = load(xml, { xml: true });
  const root = $.root().children();
  if (root.length !== 1 || !['urlset', 'sitemapindex'].includes(root[0].name)) throw new Error('Invalid site sitemap.');
  const index = root[0].name === 'sitemapindex';
  const locations = root.children(index ? 'sitemap' : 'url').map((_i, entry) => {
    const loc = $(entry).children('loc');
    if (loc.length !== 1) throw new Error('Invalid sitemap location.');
    return canonicalUrl(loc.text().trim()).href;
  }).get();
  return { index, locations };
}

function pageUrl(value) {
  const url = canonicalUrl(value);
  if (/^\/(?:api|_astro|_agent-markdown)(?:\/|$)/i.test(url.pathname) || /\.[a-z0-9]+$/i.test(url.pathname)) throw new Error('IndexNow requires a public canonical page path.');
  return url;
}

/** Parse real HTML rather than matching incidental strings in script/comment content. */
function noindex(html, headers = new Headers()) {
  if (/\b(?:noindex|none)\b/i.test(headers.get('x-robots-tag') ?? '')) return true;
  const $ = load(html);
  return $('meta').toArray().some(node => /^(?:robots|bingbot)$/i.test($(node).attr('name') ?? '') && /\b(?:noindex|none)\b/i.test($(node).attr('content') ?? ''));
}


function request(fetchImpl, url, options = {}) {
  return fetchImpl(url, { redirect: 'manual', signal: AbortSignal.timeout(12_000), cache: 'no-store', ...options });
}


/** Bound parallel reads so the article inventory does not delay every release. */
async function mapPages(pages, visit) {
  const values = [...pages];
  const results = [];
  for (let start = 0; start < values.length; start += 6) {
    results.push(...await Promise.all(values.slice(start, start + 6).map(visit)));
  }
  return results;
}


/** Derive submission candidates from the same generated sitemap as crawlers. */
export function readBuiltSite(distDirectory = resolve(ROOT, 'dist/client')) {
  const key = readFileSync(resolve(distDirectory, 'indexnow.txt'), 'utf8').trim();
  if (!/^[a-z0-9-]{8,128}$/i.test(key)) throw new Error('Invalid IndexNow ownership file.');
  const pages = new Map();
  const seen = new Set();
  const visit = (url) => {
    if (seen.has(url)) throw new Error('Repeated child sitemap.');
    if (seen.size >= 100) throw new Error('Too many child sitemaps.');
    seen.add(url);
    const xml = readFileSync(localFile(distDirectory, url), 'utf8');
    const { index, locations } = sitemapLocations(xml);
    for (const location of locations) {
      if (index) visit(location);
      else {
        pageUrl(location);
        const body = readFileSync(localFile(distDirectory, location, true), 'utf8');
        if (!noindex(body)) pages.set(location, { url: location, hash: hash(body) });
        if (pages.size > MAX_URLS) throw new Error('IndexNow batch exceeds 10,000 URLs.');
      }
    }
  };
  visit(`${ORIGIN}/sitemap.xml`);
  return { key, pages, distDirectory };
}


async function liveSitemap(fetchImpl) {
  const seen = new Set();
  const pages = new Set();
  const visit = async (url) => {
    if (seen.has(url) || seen.size >= 100) throw new Error('Invalid live child sitemap inventory.');
    seen.add(url);
    const response = await request(fetchImpl, canonicalUrl(url).href);
    if (response.status !== 200) throw new Error(`Live sitemap returned HTTP ${response.status}.`);
    const xml = await response.text();
    const { index, locations } = sitemapLocations(xml);
    for (const location of locations) {
      if (index) await visit(location);
      else pages.add(pageUrl(location).href);
      if (pages.size > MAX_URLS) throw new Error('Live sitemap exceeds 10,000 URLs.');
    }
  };
  await visit(`${ORIGIN}/sitemap.xml`);
  return pages;
}


export async function planChanges(site, fetchImpl, log = () => {}) {
  const keyResponse = await request(fetchImpl, `${ORIGIN}${KEY_PATH}`);
  if (keyResponse.status === 404 || keyResponse.status === 410) return [...site.pages.values()];
  if (keyResponse.status !== 200 || (await keyResponse.text()).trim() !== site.key) throw new Error('Live IndexNow ownership file does not match.');
  const previous = await liveSitemap(fetchImpl);
  let unreachable = 0;
  const compared = await mapPages(site.pages.values(), async (page) => {
    let response;
    let body;
    try {
      response = await request(fetchImpl, page.url, { headers: { accept: 'text/html' } });
      if (![200, 404, 410].includes(response.status)) throw new Error(`HTTP ${response.status}`);
      body = await response.text();
    } catch {
      // One slow or failing live page must never stop a release: notify it as changed.
      unreachable += 1;
      return page;
    }
    return !previous.has(page.url) || response.status !== 200 || noindex(body, response.headers) || hash(body) !== page.hash ? page : null;
  });
  if (unreachable) log(`IndexNow: ${unreachable} live pages did not answer the comparison; they count as changed.`);
  const changes = compared.filter(Boolean);
  for (const url of previous) {
    if (!site.pages.has(url)) {
      const file = localFile(site.distDirectory, url, true);
      changes.push({ url, hash: existsSync(file) ? hash(readFileSync(file, 'utf8')) : null });
    }
  }
  if (changes.length > MAX_URLS) throw new Error('Changed URL batch exceeds 10,000 URLs.');
  return changes;
}


/** Respect Bing-specific groups before wildcard groups, with longest-path allow precedence. */
function allowsBing(robots, url) {
  const groups = [];
  let agents = [];
  let rules = [];
  const save = () => { if (agents.length) groups.push({ agents, rules }); };
  for (const line of robots.split(/\r?\n/)) {
    const match = line.replace(/#.*$/, '').trim().match(/^([\w-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    const [, rawName, value] = match;
    const name = rawName.toLowerCase();
    if (name === 'user-agent') {
      if (rules.length) { save(); agents = []; rules = []; }
      agents.push(value.toLowerCase());
    } else if ((name === 'allow' || name === 'disallow') && value) rules.push({ allow: name === 'allow', path: value });
  }
  save();
  const specific = groups.filter(group => group.agents.includes('bingbot'));
  const applicable = specific.length ? specific : groups.filter(group => group.agents.includes('*'));
  const path = new URL(url).pathname;
  const matching = applicable.flatMap(group => group.rules).filter(rule => {
    const pattern = rule.path.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
    return new RegExp(`^${pattern}`).test(path);
  }).sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow));
  return matching.length === 0 || matching[0].allow;
}


/** Wait for deployed bytes, including the ownership file, before notifying. */
async function verifyPublication(site, changes, fetchImpl, wait) {
  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    try {
      const keyResponse = await request(fetchImpl, `${ORIGIN}${KEY_PATH}`);
      if (keyResponse.status !== 200 || !/^text\/plain(?:;|$)/i.test(keyResponse.headers.get('content-type') ?? '') || (await keyResponse.text()).trim() !== site.key) throw new Error('IndexNow ownership verification failed.');
      const robotsResponse = await request(fetchImpl, `${ORIGIN}/robots.txt`);
      if (robotsResponse.status !== 200) throw new Error('Production robots.txt cannot be verified.');
      const robots = await robotsResponse.text();
      for (const page of changes) {
        if (!allowsBing(robots, page.url)) throw new Error('Production robots.txt blocks Bing for a submitted URL.');
      }
      await mapPages(changes, async (page) => {
        canonicalUrl(page.url);
        const response = await request(fetchImpl, page.url, { headers: { accept: 'text/html' } });
        if (page.hash === null) {
          if (![301, 302, 307, 308, 404, 410].includes(response.status)) throw new Error('Removed page is still live.');
        } else if (response.status !== 200 || (site.pages.has(page.url) && /\b(?:noindex|none)\b/i.test(response.headers.get('x-robots-tag') ?? '')) || hash(await response.text()) !== page.hash) {
          throw new Error('Published page does not match the new build.');
        }
      });
      return;
    } catch (error) {
      if (attempt === ATTEMPTS - 1) throw error;
      await wait(2_000 * (attempt + 1));
    }
  }
}


export async function submitIndexNow(site, changes, { afterCutover = false, branch, fetchImpl = fetch, wait = waitForRetry, log = console.log } = {}) {
  requireCutover(afterCutover, branch ?? currentBranch());
  if (changes.length === 0) {
    log('IndexNow: no public pages changed; no notification sent.');
    return { status: null, count: 0 };
  }
  if (changes.length > MAX_URLS) throw new Error('IndexNow batch exceeds 10,000 URLs.');
  for (const page of changes) pageUrl(page.url);
  await verifyPublication(site, changes, fetchImpl, wait);
  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    let response;
    try {
      response = await request(fetchImpl, ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: new URL(ORIGIN).hostname, key: site.key, keyLocation: `${ORIGIN}${KEY_PATH}`, urlList: changes.map(({ url }) => canonicalUrl(url).href) }),
      });
    } catch {
      if (attempt === ATTEMPTS - 1) throw new Error('IndexNow request failed after three attempts.');
      await wait(2_000 * (attempt + 1));
      continue;
    }
    if (response.status === 200 || response.status === 202) {
      log(`IndexNow: ${changes.length} URLs received (HTTP ${response.status})${response.status === 202 ? '; key validation pending' : ''}. Indexing is not guaranteed.`);
      return { status: response.status, count: changes.length };
    }
    if ((response.status !== 429 && response.status < 500) || attempt === ATTEMPTS - 1) throw new Error(`IndexNow returned HTTP ${response.status}.`);
    const retryAfter = response.headers.get('retry-after');
    const seconds = retryAfter === null ? NaN : Number(retryAfter);
    const delay = Number.isFinite(seconds) ? seconds * 1_000 : retryAfter ? Date.parse(retryAfter) - Date.now() : 2_000 * (attempt + 1);
    // Respect rate limits without holding a deployment job open indefinitely.
    if (delay > 30_000) throw new Error('IndexNow requested a later retry; retry after the rate-limit window.');
    await wait(Math.max(0, Number.isFinite(delay) ? delay : 2_000));
  }
  throw new Error('IndexNow retry limit exceeded.');
}


/** Explicit manual release authority; this module cannot upload or promote a Worker. */
function requireCutover(afterCutover, branch) {
  if (afterCutover !== true || branch !== 'master') throw new Error('IndexNow submission requires explicit after-cutover authority on master.');
}

function currentBranch() {
  return execFileSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
}

export async function runIndexNow(args, { site, fetchImpl = fetch, branch, log = console.log, wait = waitForRetry } = {}) {
  const mode = args[0];
  if (!['--plan', '--dry-run', '--submit-all'].includes(mode)) throw new Error('Use --plan, --dry-run or --submit-all --after-cutover [removed canonical URLs].');
  if (mode !== '--submit-all' && args.length !== 1) throw new Error('Unexpected IndexNow arguments.');
  if (mode === '--submit-all') requireCutover(args[1] === '--after-cutover', branch ?? currentBranch());
  const built = site ?? readBuiltSite();
  if (mode === '--plan' || mode === '--dry-run') {
    const changes = mode === '--plan' ? [...built.pages.values()] : await planChanges(built, fetchImpl, log);
    log(`IndexNow ${mode.slice(2)}: ${changes.length} URLs; no deployment or submission.`);
    for (const page of changes) log(page.url);
    return changes;
  }
  const changes = new Map(built.pages);
  for (const value of args.slice(2)) {
    const url = pageUrl(value).href;
    const file = localFile(built.distDirectory, url, true);
    changes.set(url, { url, hash: existsSync(file) ? hash(readFileSync(file, 'utf8')) : null });
  }
  return submitIndexNow(built, [...changes.values()], { afterCutover: true, branch: branch ?? currentBranch(), fetchImpl, wait, log });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runIndexNow(process.argv.slice(2)).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
