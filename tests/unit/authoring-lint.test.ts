import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const contentDirectories = ['src/content/blog', 'src/content/pages'];
const componentTags = new Set(['AffiliateLink', 'Callout', 'Figure', 'References', 'TableOfContents', 'YouTube']);
const rawTags = new Set(['a', 'br', 'div', 'em', 'h2', 'h3', 'h4', 'h5', 'img', 'li', 'ol', 'picture', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul']);

describe('authored content', () => {
  for (const directory of contentDirectories) {
    const absoluteDirectory = join(process.cwd(), directory);
    for (const filename of readdirSync(absoluteDirectory).filter((name) => /\.(?:md|mdx)$/.test(name)).sort()) {
      it(`${directory}/${filename} uses the authoring allowlist`, () => {
        const source = readFileSync(join(absoluteDirectory, filename), 'utf8');
        const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        expect(match, 'entry must have frontmatter').not.toBeNull();
        const frontmatter = match![1]!;
        const body = match![2]!.replaceAll('\\<', '');
        expect(frontmatter).not.toMatch(/^pageTitle:/m);
        expect(body).not.toMatch(/<p\b/i);
        const tags = [...body.matchAll(/<\/?([A-Za-z][\w-]*)\b/g)].map((tag) => tag[1]!);
        expect(tags.filter((tag) => !componentTags.has(tag) && !rawTags.has(tag))).toEqual([]);
        for (const div of body.matchAll(/<div\b([^>]*)>/g)) expect(div[1]).toContain('table-responsive');
      });
    }
  }
});
