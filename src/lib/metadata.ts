import type { site as siteConfig } from '../config/site';

export type TitleMode = 'composed' | 'prefixed' | 'absolute';

export interface PageMetadataInput {
  title: string;
  description: string;
  titleMode?: TitleMode;
  canonicalPath: string;
  image?: string;
  indexable?: boolean;
  article?: boolean;
  socialTitle?: string;
}

export interface ResolvedPageMetadata extends Required<Omit<PageMetadataInput, 'socialTitle'>> {
  pageTitle: string;
  documentTitle: string;
  canonicalUrl: string;
  socialImageUrl: string;
  socialTitle: string;
}

type SiteMetadata = Pick<typeof siteConfig, 'origin' | 'name' | 'titleSeparator' | 'titlePrefixSeparator' | 'defaultImage'>;

export function resolvePageMetadata(input: PageMetadataInput, site: SiteMetadata): ResolvedPageMetadata {
  const title = input.title.trim();
  const description = input.description.trim();
  const titleMode = input.titleMode ?? 'composed';

  if (!title) throw new Error('Page metadata title must not be empty.');
  if (!description) throw new Error('Page metadata description must not be empty.');
  if (titleMode === 'composed' && title.endsWith(`${site.titleSeparator}${site.name}`)) {
    throw new Error('Composed metadata title must not already include the site name.');
  }
  if (titleMode === 'prefixed' && title.startsWith(`${site.name}${site.titlePrefixSeparator}`)) {
    throw new Error('Prefixed metadata title must not already include the site name.');
  }

  const documentTitle = titleMode === 'absolute'
    ? title
    : titleMode === 'prefixed'
      ? `${site.name}${site.titlePrefixSeparator}${title}`
      : `${title}${site.titleSeparator}${site.name}`;
  const canonicalUrl = new URL(input.canonicalPath, site.origin).href;
  const socialImageUrl = new URL(input.image ?? site.defaultImage, site.origin).href;

  return {
    ...input,
    title,
    description,
    titleMode,
    canonicalPath: input.canonicalPath,
    image: input.image ?? site.defaultImage,
    indexable: input.indexable ?? true,
    article: input.article ?? false,
    pageTitle: title,
    documentTitle,
    canonicalUrl,
    socialImageUrl,
    socialTitle: input.socialTitle ?? documentTitle,
  };
}
