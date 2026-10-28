import { describe, expect, it } from 'vitest';
import { site } from '../../src/config/site';
import { resolvePageMetadata } from '../../src/lib/metadata';
import { buildStructuredData, serializeStructuredData } from '../../src/lib/structured-data';

const page = (article: boolean) => resolvePageMetadata({
  title: 'Example Post',
  description: 'Example description.',
  canonicalPath: '/blog/example',
  article,
}, site);

const graphOf = (data: Record<string, unknown> | undefined) => {
  if (!data) throw new Error('Expected an indexable document graph.');
  return data['@graph'] as Record<string, unknown>[];
};
const types = (data: Record<string, unknown> | undefined) => graphOf(data).map((node) => node['@type']);

describe('buildStructuredData', () => {
  it('emits WebSite and Person for every document', () => {
    const data = buildStructuredData(page(false), site);
    expect(types(data)).toEqual(['WebSite', 'Person', 'WebPage']);
    expect(graphOf(data)[1]).toMatchObject({ name: 'Jay', sameAs: Object.values(site.social) });
  });

  it('adds a dated BlogPosting to articles', () => {
    const data = buildStructuredData(page(true), site, { published: new Date('2018-05-01T00:00:00.000Z') });
    const posting = graphOf(data)[3];
    expect(posting).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'Example Post',
      url: 'https://www.musclehacking.com/blog/example',
      datePublished: '2018-05-01T00:00:00.000Z',
      dateModified: '2018-05-01T00:00:00.000Z',
      author: { '@id': 'https://www.musclehacking.com/#author' },
    });
  });

  it('omits the BlogPosting when an article has no dates', () => {
    expect(types(buildStructuredData(page(true), site))).toEqual(['WebSite', 'Person', 'WebPage']);
  });

  it('links the canonical page, article and website with self-contained fragment IDs', () => {
    const resolved = resolvePageMetadata({ title: 'Search wording', headline: 'Visible headline', description: 'Example.', canonicalPath: '/blog/example', article: true }, site);
    const nodes = graphOf(buildStructuredData(resolved, site, { published: new Date('2018-05-01') }));
    expect(nodes[2]).toMatchObject({ '@id': `${resolved.canonicalUrl}#webpage`, name: 'Visible headline', isPartOf: { '@id': `${site.origin}/#website` }, mainEntity: { '@id': `${resolved.canonicalUrl}#article` } });
    expect(nodes[3]).toMatchObject({ headline: 'Visible headline', mainEntityOfPage: { '@id': `${resolved.canonicalUrl}#webpage` } });
    expect(new Set(nodes.map((node) => node['@id'])).size).toBe(nodes.length);
  });

  it('suppresses the graph on a non-indexable document', () => {
    expect(buildStructuredData({ ...page(false), indexable: false }, site)).toBeUndefined();
  });

  it('never emits an email or postal address', () => {
    const json = JSON.stringify(buildStructuredData(page(true), site, { published: new Date() }));
    expect(json).not.toMatch(/mailto|"email"|"address"|PostalAddress|"telephone"|[\w.]+@[\w.]+\.\w+/u);
  });

  it('escapes a closing script tag in serialised output', () => {
    expect(serializeStructuredData({ headline: '</script><script>' })).not.toContain('</script>');
  });
});
