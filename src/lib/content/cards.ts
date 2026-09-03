import type { ArticleEntry, ListingItem } from './types';

const formatMonth = (date: Date) => new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(date);

export function resolveCard(entry: ArticleEntry, href?: string): ListingItem {
  const card = entry.data.card;
  return {
    href: href ?? ('path' in entry.data ? entry.data.path : `/blog/${entry.id}`),
    published: entry.data.published,
    title: card.title ?? entry.data.title,
    description: card.description ?? entry.data.imageCaption ?? entry.data.description,
    image: card.image ?? entry.data.image,
    imageAlt: card.imageAlt ?? entry.data.imageAlt,
    date: formatMonth(entry.data.published),
    ratio: card.ratio ?? '5 / 3',
    sidebarTitle: resolveSidebarLabel(entry),
  };
}

export function resolveSidebarLabel(entry: ArticleEntry): string {
  return entry.data.shortTitle ?? entry.data.title;
}
