import { getCollection } from 'astro:content';
import { pinnedSections } from '../../config/home';
import { resolveCard } from './cards';
import type { BlogEntry, ListingItem, PageEntry } from './types';

const newestFirst = <T extends { id: string; data: { published: Date } }>(left: T, right: T) =>
  right.data.published.getTime() - left.data.published.getTime() || left.id.localeCompare(right.id);

const isPublished = (entry: { data: { draft: boolean; published: Date } }, now: Date) =>
  !entry.data.draft && entry.data.published.getTime() <= now.getTime();

export async function getPublishedPosts(now = new Date()): Promise<BlogEntry[]> {
  return (await getCollection('blog')).filter((entry) => isPublished(entry, now)).sort(newestFirst);
}

export async function getListedPages(now = new Date()): Promise<PageEntry[]> {
  return (await getCollection('pages'))
    .filter((entry) => entry.data.listed && isPublished(entry, now))
    .sort(newestFirst);
}

export async function getListing(now = new Date()): Promise<ListingItem[]> {
  const [posts, pages] = await Promise.all([getPublishedPosts(now), getListedPages(now)]);
  const contentItems = [...posts.map((entry) => resolveCard(entry)), ...pages.map((entry) => resolveCard(entry))];
  const pinnedItems: ListingItem[] = pinnedSections.map((entry) => ({
    ...entry,
    date: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(entry.published),
  }));

  return [...contentItems, ...pinnedItems].sort((left, right) =>
    right.published.getTime() - left.published.getTime() || left.href.localeCompare(right.href));
}
