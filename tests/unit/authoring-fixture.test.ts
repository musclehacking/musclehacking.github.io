import { cpSync, existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';

const repositoryRoot = process.cwd();
const sourceFixture = join(repositoryRoot, 'tests/fixtures/authoring/example-post.mdx');
const sourceImageDirectory = join(repositoryRoot, 'tests/fixtures/authoring/example-post');
const contentEntry = join(repositoryRoot, 'src/content/blog/example-post.mdx');
const contentImageDirectory = join(repositoryRoot, 'src/content/blog/example-post');
const excludedFixtureNames = ['draft-post.md', 'future-post.md'];
const excludedEntries = excludedFixtureNames.map((name) => join(repositoryRoot, 'src/content/blog', name));
const syncScript = join(repositoryRoot, 'scripts/sync-blog-slugs.mjs');

const run = (command: string, args: string[]) => spawnSync(command, args, {
  cwd: repositoryRoot,
  encoding: 'utf8',
  env: process.env,
});

describe('authoring fixture', () => {
  it('builds a five-field post into every derived output', { timeout: 60_000 }, () => {
    const outputDirectory = mkdtempSync(join(tmpdir(), 'musclehacking-authoring-'));
    let build;

    try {
      cpSync(sourceFixture, contentEntry);
      cpSync(sourceImageDirectory, contentImageDirectory, { recursive: true });
      excludedFixtureNames.forEach((name, index) => {
        cpSync(join(repositoryRoot, 'tests/fixtures/authoring', name), excludedEntries[index]!);
      });
      expect(run(process.execPath, [syncScript]).status).toBe(0);
      build = run('pnpm', ['exec', 'astro', 'build', '--outDir', outputDirectory]);
      expect(build.status, build.stderr || build.stdout).toBe(0);

      const clientRoot = join(outputDirectory, 'client');
      const article = load(readFileSync(join(clientRoot, 'blog/example-post/index.html'), 'utf8'));
      expect(article('h1').text()).toBe('Example Post');
      expect(article('img.hero-image').attr('width')).toBe('700');
      expect(article('img.hero-image').attr('height')).toBe('420');
      expect(article('.legacy-content figure img[src^="/_astro/"]')).toHaveLength(1);
      expect(article('.project-callout')).toHaveLength(1);
      expect(article('iframe.video[src^="https://www.youtube-nocookie.com/embed/"]')).toHaveLength(1);
      expect(article('#post-prev').attr('href')).toBe('breakup-energy');
      expect(article('#post-next')).toHaveLength(0);
      expect(article('#post-nav').hasClass('post-navigation--wrap')).toBe(false);

      const home = load(readFileSync(join(clientRoot, 'index.html'), 'utf8'));
      expect(home('.article-list .article-card').first().attr('href')).toBe('/blog/example-post');
      expect(home('.sidebar-recent a').first().attr('href')).toBe('/blog/example-post');
      for (const file of ['feed.xml', 'sitemap.xml', 'llms.txt']) {
        const output = readFileSync(join(clientRoot, file), 'utf8');
        expect(output).toContain('/blog/example-post');
        expect(output).not.toContain('/blog/draft-post');
        expect(output).not.toContain('/blog/future-post');
      }
      expect(existsSync(join(clientRoot, 'blog/draft-post/index.html'))).toBe(false);
      expect(existsSync(join(clientRoot, 'blog/future-post/index.html'))).toBe(false);
    } finally {
      const targets = [contentEntry, contentImageDirectory, ...excludedEntries, outputDirectory].filter(existsSync);
      if (targets.length) run('trash', targets);
      run(process.execPath, [syncScript]);
    }

    expect(existsSync(contentEntry)).toBe(false);
    expect(existsSync(contentImageDirectory)).toBe(false);
  });
});
