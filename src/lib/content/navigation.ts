import type { BlogEntry, ResolvedNavigation, ArticleNavigationLink } from './types';

type AuthoredLink = BlogEntry['data']['navigation']['previous'];

function derivedLink(entry: BlogEntry | undefined, label: string): ArticleNavigationLink | undefined {
  if (!entry) return undefined;
  return {
    href: entry.id,
    label,
    title: entry.data.linkTitle ?? entry.data.title,
    displayTitle: entry.data.shortTitle ?? entry.data.linkTitle ?? entry.data.title,
  };
}

export function resolveLink(
  link: AuthoredLink,
  fallback: ArticleNavigationLink | undefined,
): ArticleNavigationLink | undefined {
  if (link === false) return undefined;
  return link ?? fallback;
}

export function deriveNavigation(entry: BlogEntry, orderedPosts: readonly BlogEntry[]): ResolvedNavigation {
  const index = orderedPosts.findIndex((candidate) => candidate.id === entry.id);
  if (index < 0) throw new Error(`Cannot derive navigation for unknown blog entry ${entry.id}.`);

  const previous = resolveLink(entry.data.navigation.previous, derivedLink(orderedPosts[index + 1], 'Previous Post'));
  const next = resolveLink(entry.data.navigation.next, derivedLink(orderedPosts[index - 1], 'Next Post'));
  const wrapTitles = entry.data.navigation.wrapTitles
    ?? [previous?.label, next?.label].some((label) => label !== undefined && label !== 'Previous Post' && label !== 'Next Post');

  return { previous, next, wrapTitles };
}
