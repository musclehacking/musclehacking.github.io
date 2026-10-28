import type { site as siteConfig } from '../config/site';
import type { ResolvedPageMetadata } from './metadata';

/**
 * Builds the schema.org JSON-LD graph for one document.
 *
 * Approved identity policy (human decision, 23 September 2026): the site is a
 * `WebSite` published by the `Person` "Jay", who links to the public social
 * profiles only. No postal address, email address, or other contact detail is
 * ever emitted.
 */
type SiteStructuredData = Pick<typeof siteConfig, 'origin' | 'name' | 'language' | 'authorDisplayName' | 'social'>;

export interface ArticleDates {
  published: Date;
  updated?: Date;
}

export function buildStructuredData(
  page: Pick<ResolvedPageMetadata, 'canonicalUrl' | 'pageTitle' | 'description' | 'socialImageUrl' | 'article' | 'indexable'>,
  site: SiteStructuredData,
  dates?: ArticleDates,
): Record<string, unknown> | undefined {
  if (!page.indexable) return undefined;
  const siteUrl = new URL('/', site.origin).href;
  const websiteId = `${siteUrl}#website`;
  const authorId = `${siteUrl}#author`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteUrl,
      name: site.name,
      inLanguage: site.language,
      publisher: { '@id': authorId },
    },
    {
      '@type': 'Person',
      '@id': authorId,
      name: site.authorDisplayName,
      url: siteUrl,
      sameAs: Object.values(site.social),
    },
    {
      '@type': 'WebPage',
      '@id': `${page.canonicalUrl}#webpage`,
      url: page.canonicalUrl,
      name: page.pageTitle,
      description: page.description,
      inLanguage: site.language,
      isPartOf: { '@id': websiteId },
      ...(page.article && dates ? { mainEntity: { '@id': `${page.canonicalUrl}#article` } } : {}),
    },
  ];

  // Only dated articles carry a BlogPosting; a posting without datePublished is invalid for rich results.
  if (page.article && dates) {
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${page.canonicalUrl}#article`,
      mainEntityOfPage: { '@id': `${page.canonicalUrl}#webpage` },
      url: page.canonicalUrl,
      headline: page.pageTitle,
      description: page.description,
      image: page.socialImageUrl,
      datePublished: dates.published.toISOString(),
      dateModified: (dates.updated ?? dates.published).toISOString(),
      inLanguage: site.language,
      author: { '@id': authorId },
      publisher: { '@id': authorId },
      isPartOf: { '@id': websiteId },
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Serialises JSON-LD for an inline `<script>`; escaping `<` prevents a `</script>` breakout. */
export function serializeStructuredData(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
