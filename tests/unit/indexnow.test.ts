import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { readBuiltSite, planChanges, submitIndexNow, runIndexNow } from '../../scripts/indexnow.mjs';

const root = mkdtempSync(join(tmpdir(), 'musclehacking-indexnow-'));
const origin = 'https://www.musclehacking.com';
const key = 'test-indexnow-key';
const html = (text: string, meta = '') => `<html><head>${meta}</head><body>${text}</body></html>`;
const sitemap = (paths: string[]) => `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${origin}${path}</loc></url>`).join('')}</urlset>`;
let number = 0;
afterAll(() => { expect(spawnSync('trash', [root]).status).toBe(0); });

function fixture(pages: Record<string, string>) {
  const directory = join(root, String(number++));
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'indexnow.txt'), key);
  writeFileSync(join(directory, 'sitemap.xml'), sitemap(Object.keys(pages)));
  for (const [path, body] of Object.entries(pages)) {
    const file = join(directory, path.endsWith('/') ? `${path.slice(1)}index.html` : `${path.slice(1)}.html`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, body);
  }
  return readBuiltSite(directory);
}

function network(pages: Record<string, string>, options: { statuses?: number[]; key?: string; robots?: string; fail?: Record<string, number | string>; headers?: Record<string, string>; retryAfter?: string } = {}) {
  const posts: { host: string; keyLocation: string; urlList: string[] }[] = [];
  const reads: string[] = [];
  const waits: number[] = [];
  const fetchImpl = async (input: string, init: RequestInit = {}) => {
    expect(init.redirect).toBe('manual');
    expect(init.cache).toBe('no-store');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const url = new URL(input);
    if (init.method === 'POST') {
      expect(url.href).toBe('https://api.indexnow.org/indexnow');
      expect(init.headers).toEqual({ 'content-type': 'application/json; charset=utf-8' });
      posts.push(JSON.parse(String(init.body)));
      return new Response('', { status: options.statuses?.[Math.min(posts.length - 1, options.statuses.length - 1)] ?? 200, headers: { 'retry-after': options.retryAfter ?? '0' } });
    }
    expect(url.origin).toBe(origin);
    reads.push(url.pathname);
    const failure = options.fail?.[url.pathname];
    if (typeof failure === 'string') throw new DOMException(failure, failure === 'timeout' ? 'TimeoutError' : 'NetworkError');
    if (typeof failure === 'number') return new Response('', { status: failure });
    if (url.pathname === '/indexnow.txt') return new Response(options.key ?? key);
    if (url.pathname === '/robots.txt') return new Response(options.robots ?? 'User-agent: *\nAllow: /\n\nUser-agent: ia_archiver\nDisallow: /');
    if (url.pathname === '/sitemap.xml') return new Response(sitemap(Object.keys(pages)));
    return new Response(pages[url.pathname] ?? '', { status: pages[url.pathname] === undefined ? 404 : 200, headers: options.headers });
  };
  return { fetchImpl, posts, reads, waits, wait: async (delay: number) => { waits.push(delay); }, log: () => {} };
}
const authority = { afterCutover: true, branch: 'master' };

describe('IndexNow prepared after-publication notifier', () => {
  it('reads directory and extensionless article URLs and excludes parsed noindex meta', () => {
    const site = fixture({ '/': html('Home'), '/blog/post': html('Post'), '/hidden/': html('Hidden', '<meta content="NOINDEX,follow" name="ROBOTS">'), '/bing/': html('Hidden', '<meta name="bingbot" content="none">') });
    expect([...site.pages.keys()]).toEqual([`${origin}/`, `${origin}/blog/post`]);
  });
  it('plans changed, new, removed and newly noindex pages without notifying', async () => {
    const site = fixture({ '/': html('New'), '/same/': html('Same'), '/blog/new': html('New post'), '/hidden/': html('Hidden', '<meta name="robots" content="noindex">') });
    const transport = network({ '/': html('Old'), '/same/': html('Same'), '/old/': html('Old'), '/hidden/': html('Visible') });
    const changes = await planChanges(site, transport.fetchImpl);
    expect(changes.map((page: { url: string }) => page.url)).toEqual([`${origin}/`, `${origin}/blog/new`, `${origin}/old/`, `${origin}/hidden/`]);
    expect(transport.posts).toEqual([]);
    const live = network({ '/': html('New'), '/same/': html('Same'), '/blog/new': html('New post'), '/hidden/': html('Hidden', '<meta name="robots" content="noindex">') });
    await submitIndexNow(site, changes, { ...authority, ...live });
    expect(live.posts[0]?.urlList).toEqual(changes.map((page: { url: string }) => page.url));
  });
  it('sends no request for an unchanged release', async () => {
    const pages = { '/': html('Same') };
    const site = fixture(pages); const transport = network(pages);
    const changes = await planChanges(site, transport.fetchImpl);
    await submitIndexNow(site, changes, { ...authority, ...transport });
    expect(transport.posts).toHaveLength(0);
  });
  it('requires explicit after-cutover authority and master before any network access', async () => {
    const site = fixture({ '/': html('Home') });
    for (const options of [{}, { afterCutover: true, branch: 'preview' }, { afterCutover: false, branch: 'master' }]) {
      const transport = network({});
      await expect(submitIndexNow(site, [...site.pages.values()], { ...transport, ...options })).rejects.toThrow(/cutover.*master/i);
      expect(transport.reads).toEqual([]); expect(transport.posts).toEqual([]);
    }
  });
  it('keeps --plan offline and dry-run read-only; rejects accidental no-argument submission', async () => {
    const site = fixture({ '/': html('Home') }); const transport = network({ '/': html('Home') });
    await runIndexNow(['--plan'], { site, ...transport });
    expect(transport.reads).toEqual([]);
    await runIndexNow(['--dry-run'], { site, ...transport });
    expect(transport.reads).toContain('/sitemap.xml'); expect(transport.posts).toEqual([]);
    await expect(runIndexNow([], { site, ...transport })).rejects.toThrow(/--plan/);
  });
  it('first rollout selects eligible URLs when the live key is absent', async () => {
    const site = fixture({ '/': html('Home') });
    expect(await planChanges(site, network({}, { fail: { '/indexnow.txt': 404 } }).fetchImpl)).toEqual([...site.pages.values()]);
  });
  it.each(['timeout', 'network', 503])('counts a failing live page (%s) as changed', async failure => {
    const pages = { '/': html('Home') }; const site = fixture(pages);
    expect(await planChanges(site, network(pages, { fail: { '/': failure } }).fetchImpl)).toEqual([...site.pages.values()]);
  });
  it.each(['/indexnow.txt', '/sitemap.xml'])('fails an unreadable live inventory %s without posting', async path => {
    const site = fixture({ '/': html('Home') }); const transport = network({}, { fail: { [path]: 'timeout' } });
    await expect(planChanges(site, transport.fetchImpl)).rejects.toThrow(); expect(transport.posts).toEqual([]);
  });
  it.each([{ key: 'wrong-code' }, { fail: { '/': 'timeout' } }, { headers: { 'x-robots-tag': 'noindex' } }, { robots: 'User-agent: *\nDisallow: /' }, { robots: 'User-agent: bingbot\nDisallow: /' }])('prevents notification when publication verification fails %j', async options => {
    const pages = { '/': html('Home') }; const site = fixture(pages); const transport = network(pages, options);
    await expect(submitIndexNow(site, [...site.pages.values()], { ...authority, ...transport })).rejects.toThrow();
    expect(transport.posts).toEqual([]);
  });
  it('prevents notification for stale bytes or a removed page that remains live', async () => {
    const site = fixture({ '/': html('New') }); const transport = network({ '/': html('Old') });
    await expect(submitIndexNow(site, [...site.pages.values()], { ...authority, ...transport })).rejects.toThrow(/match/);
    await expect(submitIndexNow(site, [{ url: `${origin}/`, hash: null }], { ...authority, ...transport })).rejects.toThrow(/still live/);
    expect(transport.posts).toEqual([]);
  });
  it('retries rate limits and reports 202 as pending verification', async () => {
    const pages = { '/': html('Home') }; const site = fixture(pages); const transport = network(pages, { statuses: [429, 202] });
    expect(await submitIndexNow(site, [...site.pages.values()], { ...authority, ...transport })).toEqual({ status: 202, count: 1 });
    expect(transport.posts).toHaveLength(2); expect(transport.posts[0]?.host).toBe('www.musclehacking.com');
    expect(transport.posts[0]?.keyLocation).toBe(`${origin}/indexnow.txt`);
  });
  it.each([400, 403, 422])('does not retry permanent HTTP %s', async status => {
    const pages = { '/': html('Home') }; const site = fixture(pages); const transport = network(pages, { statuses: [status] });
    await expect(submitIndexNow(site, [...site.pages.values()], { ...authority, ...transport })).rejects.toThrow(String(status)); expect(transport.posts).toHaveLength(1);
  });
  it('bounds server-error retries and defers long rate-limit windows', async () => {
    const pages = { '/': html('Home') }; const site = fixture(pages);
    const failing = network(pages, { statuses: [503] });
    await expect(submitIndexNow(site, [...site.pages.values()], { ...authority, ...failing })).rejects.toThrow('503'); expect(failing.posts).toHaveLength(3);
    const limited = network(pages, { statuses: [429], retryAfter: '60' });
    await expect(submitIndexNow(site, [...site.pages.values()], { ...authority, ...limited })).rejects.toThrow(/later retry/); expect(limited.posts).toHaveLength(1);
  });
  it.each(['https://books.musclehacking.com/', 'https://preview.workers.dev/', `${origin}/?token=x`, `${origin}/#fragment`, `${origin}/%2fetc/`, `${origin}/api/subscribe`])('rejects noncanonical or private submission URLs %s before requests', async url => {
    const site = fixture({ '/': html('Home') }); const transport = network({});
    await expect(submitIndexNow(site, [{ url, hash: null }], { ...authority, ...transport })).rejects.toThrow(/canonical|page|path/i); expect(transport.reads).toEqual([]);
  });
  it('parses sitemap indexes and rejects foreign children, cycles and excessive batches', async () => {
    const site = fixture({ '/': html('Home') }); const dist = site.distDirectory;
    writeFileSync(join(dist, 'sitemap.xml'), `<sitemapindex><sitemap><loc>${origin}/child.xml</loc></sitemap></sitemapindex>`);
    writeFileSync(join(dist, 'child.xml'), sitemap(['/'])); expect(readBuiltSite(dist).pages.size).toBe(1);
    writeFileSync(join(dist, 'child.xml'), `<sitemapindex><sitemap><loc>${origin}/sitemap.xml</loc></sitemap></sitemapindex>`); expect(() => readBuiltSite(dist)).toThrow(/Repeated/);
    const transport = network({});
    await expect(submitIndexNow(site, Array.from({ length: 10001 }, () => ({ url: `${origin}/`, hash: null })), { ...authority, ...transport })).rejects.toThrow(/10,000/);
    expect(transport.reads).toEqual([]);
  });
});
