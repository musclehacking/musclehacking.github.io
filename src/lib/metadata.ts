import type { site as siteConfig } from '../config/site';
import type { ArticleDates } from './structured-data';

export type TitleMode = 'composed' | 'prefixed' | 'absolute';

export interface SocialImageDetails {
  alt: string;
  width: number;
  height: number;
  type?: string;
}

export interface PageMetadataInput {
  title: string;
  /** The visible H1 when editorial wording differs from the SEO title. */
  headline?: string;
  description: string;
  titleMode?: TitleMode;
  canonicalPath: string;
  image?: string;
  imageDetails?: SocialImageDetails;
  indexable?: boolean;
  article?: boolean;
  socialTitle?: string;
  /** Publication dates for article JSON-LD; omitted on non-article documents. */
  articleDates?: ArticleDates;
}

export interface ResolvedPageMetadata extends Required<Omit<PageMetadataInput, 'socialTitle' | 'articleDates' | 'headline' | 'imageDetails'>> {
  pageTitle: string;
  documentTitle: string;
  canonicalUrl: string;
  socialImageUrl: string;
  socialTitle: string;
  socialImage: SocialImageDetails;
}

type SiteMetadata = Pick<typeof siteConfig, 'origin' | 'name' | 'titleSeparator' | 'titlePrefixSeparator' | 'defaultImage' | 'defaultImageDetails'>;

/** Canonicals describe one production document, never a host override or URL variant. */
export function validateCanonicalPath(path: string, origin: string): string {
  let decoded: string;
  try { decoded = decodeURIComponent(path); } catch { throw new Error('Invalid canonical path encoding.'); }
  if (!path.startsWith('/') || path.startsWith('//') || /[\\?#\s]/u.test(decoded)
    || decoded.split('/').some((part) => part === '.' || part === '..')) {
    throw new Error('Page canonical must be a clean root-relative path.');
  }
  const url = new URL(path, origin);
  if (url.origin !== new URL(origin).origin || url.pathname !== path) {
    throw new Error('Page canonical must preserve its root-relative path.');
  }
  return path;
}

export function resolvePageMetadata(input: PageMetadataInput, site: SiteMetadata): ResolvedPageMetadata {
  const title = input.title.trim();
  const description = input.description.trim();
  const titleMode = input.titleMode ?? 'composed';

  for (const field of ['name', 'titleSeparator', 'titlePrefixSeparator'] as const) {
    if (!site[field].trim()) throw new Error(`Site metadata ${field} must not be empty.`);
  }
  const origin = new URL(site.origin);
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('Site metadata origin must be a clean HTTPS origin.');
  }
  if (!title) throw new Error('Page metadata title must not be empty.');
  if (!description) throw new Error('Page metadata description must not be empty.');
  const pageTitle = (input.headline ?? title).trim();
  if (!pageTitle) throw new Error('Page metadata headline must not be empty.');
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
  const canonicalUrl = new URL(validateCanonicalPath(input.canonicalPath, site.origin), site.origin).href;
  const socialImageUrl = new URL(input.image ?? site.defaultImage, site.origin).href;
  const details = input.imageDetails ?? (input.image === undefined || input.image === site.defaultImage ? site.defaultImageDetails : undefined);
  if (!details || !details.alt.trim() || !Number.isInteger(details.width) || details.width <= 0 || !Number.isInteger(details.height) || details.height <= 0) {
    throw new Error('Social image requires alternative text and positive integer dimensions.');
  }
  const extension = new URL(socialImageUrl).pathname.split('.').pop()?.toLowerCase();
  const imageTypes: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif' };
  const type = details.type ?? imageTypes[extension ?? ''];

  return {
    ...input,
    title,
    description,
    titleMode,
    canonicalPath: input.canonicalPath,
    image: input.image ?? site.defaultImage,
    indexable: input.indexable ?? true,
    article: input.article ?? false,
    pageTitle,
    documentTitle,
    canonicalUrl,
    socialImageUrl,
    socialImage: { ...details, alt: details.alt.trim(), type },
    socialTitle: input.socialTitle ?? documentTitle,
  };
}
