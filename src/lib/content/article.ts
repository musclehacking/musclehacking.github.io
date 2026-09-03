import type { ImageMetadata } from 'astro';
import { site } from '../../config/site';
import { resolvePageMetadata } from '../metadata';
import { deriveByline } from './byline';
import { getPublishedPosts } from './collections';
import { deriveNavigation } from './navigation';
import type { ArticleEntry, ArticleModel, ResolvedNavigation } from './types';

function dimensions(entry: ArticleEntry): { width: number; height: number } {
  if (typeof entry.data.image !== 'string') {
    const image = entry.data.image as ImageMetadata;
    return { width: image.width, height: image.height };
  }
  if (!entry.data.imageWidth || !entry.data.imageHeight) {
    throw new Error(`${entry.id}: imageWidth and imageHeight are required for ${entry.data.image}.`);
  }
  return { width: entry.data.imageWidth, height: entry.data.imageHeight };
}

export async function resolveArticle(entry: ArticleEntry, collection: 'blog' | 'pages'): Promise<ArticleModel> {
  const isBlog = collection === 'blog';
  const canonicalPath = entry.data.canonicalOverride
    ?? (isBlog ? `/blog/${entry.id}` : 'path' in entry.data ? entry.data.path : '');
  const metadata = {
    title: entry.data.seoTitle ?? entry.data.title,
    description: entry.data.description,
    canonicalPath,
    image: typeof entry.data.image === 'string' ? entry.data.image : entry.data.image.src,
    article: isBlog,
  };
  const resolvedMetadata = resolvePageMetadata(metadata, site);
  let navigation: ResolvedNavigation;

  if (isBlog) {
    navigation = deriveNavigation(entry as Extract<ArticleEntry, { collection: 'blog' }>, await getPublishedPosts());
  } else {
    const authored = entry.data.navigation;
    const previous = authored.previous === false ? undefined : authored.previous;
    const next = authored.next === false ? undefined : authored.next;
    navigation = {
      previous,
      next,
      wrapTitles: authored.wrapTitles ?? [previous?.label, next?.label].some((label) => label !== undefined && label !== 'Previous Post' && label !== 'Next Post'),
    };
  }

  return {
    title: entry.data.title,
    metadata,
    documentTitle: resolvedMetadata.documentTitle,
    hero: { src: entry.data.image, alt: entry.data.imageAlt, ...dimensions(entry), caption: entry.data.imageCaption },
    byline: entry.data.byline ?? deriveByline(entry.data.published, entry.data.updated, site.authorDisplayName),
    navigation,
    ending: entry.data.ending,
    notice: entry.data.notice,
    canonicalPath,
    formId: isBlog ? 'article-bottom' : 'content-bottom',
    campaign: isBlog ? 'article-bottom' : 'content-bottom',
    placement: isBlog ? 'article-bottom' : 'longform-bottom',
    longform: !isBlog,
  };
}
