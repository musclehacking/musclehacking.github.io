import { describe, expect, it } from 'vitest';
import { site } from '../../src/config/site';
import { resolvePageMetadata } from '../../src/lib/metadata';

const base = {
  title: 'Example',
  description: 'Example description.',
  canonicalPath: '/example/',
};

describe('resolvePageMetadata', () => {
  // Invalid authored inputs cannot be exercised through E2E: they must abort the build.
  it.each(['', 'relative/', '//other.example/path', 'https://other.example/path', '/example/?q=1', '/example/#part', '/\\other.example', '/example/%5cpath', '/example/%3fquery', '/a/../b', '/example/\n'])('rejects unsafe canonical input %j', (canonicalPath) => {
    expect(() => resolvePageMetadata({ ...base, canonicalPath }, site)).toThrow('canonical');
  });

  it.each(['name', 'titleSeparator', 'titlePrefixSeparator'] as const)('rejects an empty site %s', (field) => {
    expect(() => resolvePageMetadata(base, { ...site, [field]: ' ' })).toThrow(field);
  });

  it('preserves the semantic headline independently of an SEO title', () => {
    expect(resolvePageMetadata({ ...base, headline: 'Visible headline' }, site)).toMatchObject({
      pageTitle: 'Visible headline', documentTitle: 'Example | Muscle Hacking',
      socialImage: { alt: 'Muscle Hacking', width: 416, height: 30, type: 'image/png' },
    });
  });

  it('uses an explicit image and its own image facts', () => {
    expect(resolvePageMetadata({ ...base, image: '/img/article.jpg', imageDetails: { alt: 'Article illustration', width: 700, height: 420 } }, site).socialImage)
      .toMatchObject({ alt: 'Article illustration', width: 700, height: 420, type: 'image/jpeg' });
  });
  it('composes the default document title', () => {
    expect(resolvePageMetadata(base, site).documentTitle).toBe('Example | Muscle Hacking');
  });

  it('prefixes the home descriptor', () => {
    expect(resolvePageMetadata({ ...base, titleMode: 'prefixed' }, site).documentTitle).toBe('Muscle Hacking: Example');
  });

  it('keeps absolute titles unchanged', () => {
    expect(resolvePageMetadata({ ...base, titleMode: 'absolute' }, site).documentTitle).toBe('Example');
  });

  it.each([
    [{ ...base, title: '' }, 'title'],
    [{ ...base, description: '' }, 'description'],
    [{ ...base, title: 'Example | Muscle Hacking' }, 'site name'],
    [{ ...base, title: 'Muscle Hacking: Example', titleMode: 'prefixed' as const }, 'site name'],
  ])('rejects invalid metadata %#', (input, message) => {
    expect(() => resolvePageMetadata(input, site)).toThrow(message);
  });
});
