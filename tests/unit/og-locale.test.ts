import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { site } from '../../src/config/site';

const clientRoot = fileURLToPath(new URL('../../dist/client/', import.meta.url));

/** Every emitted document, found from the build output rather than the route registry. */
const htmlDocuments = (directory: string, prefix = ''): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return htmlDocuments(join(directory, entry.name), relativePath);
    return entry.name.endsWith('.html') ? [relativePath] : [];
  });

describe('og:locale in built output', () => {
  // The build is the source of truth for head metadata, so the suite runs after `pnpm build`.
  it('has a build to inspect', () => {
    expect(existsSync(clientRoot), `Missing ${clientRoot}. Run \`pnpm build\` before \`pnpm test\`.`).toBe(true);
  });

  const documents = existsSync(clientRoot) ? htmlDocuments(clientRoot) : [];

  it('covers the home page, the error page, and every generated blog route', () => {
    expect(documents).toContain('index.html');
    expect(documents).toContain('404.html');
    expect(documents.filter((document) => document.startsWith('blog/')).length).toBeGreaterThan(0);
  });

  it.each(documents)('%s carries exactly one og:locale', (relativePath) => {
    const $ = load(readFileSync(join(clientRoot, relativePath), 'utf8'));
    const tags = $('meta[property="og:locale"]');
    expect(tags.length).toBe(1);
    expect(tags.attr('content')).toBe(site.openGraphLocale);
  });

  it('keeps og:locale distinct from the html lang tag', () => {
    expect(site.openGraphLocale).toBe('en_US');
    expect(site.language).toBe('en');
    for (const relativePath of documents) {
      const $ = load(readFileSync(join(clientRoot, relativePath), 'utf8'));
      expect($('html').attr('lang')).toBe(site.language);
    }
  });
});
