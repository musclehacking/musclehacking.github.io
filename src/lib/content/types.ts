import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { PageMetadataInput } from '../metadata';

export type BlogEntry = CollectionEntry<'blog'>;
export type PageEntry = CollectionEntry<'pages'>;
export type ArticleEntry = BlogEntry | PageEntry;
export type ArticleImage = string | ImageMetadata;

export interface ArticleNavigationLink {
  href: string;
  label: string;
  title: string;
  displayTitle?: string;
}

export interface ResolvedNavigation {
  previous?: ArticleNavigationLink;
  next?: ArticleNavigationLink;
  wrapTitles: boolean;
}

export interface ListingItem {
  href: string;
  published: Date;
  title: string;
  description: string;
  image: ArticleImage;
  imageAlt: string;
  date: string;
  ratio: string;
  sidebarTitle: string;
}

export interface ArticleModel {
  title: string;
  metadata: PageMetadataInput;
  documentTitle: string;
  hero: {
    src: ArticleImage;
    alt: string;
    width: number;
    height: number;
    caption?: string;
  };
  byline: string;
  navigation: ResolvedNavigation;
  ending: {
    floatingShare: boolean;
    disclaimer: 'generic' | 'calculator' | false;
    headingLinks: boolean;
  };
  notice?: {
    variant: string;
    label: string;
    html: string;
  };
  canonicalPath: string;
  formId: string;
  campaign: string;
  placement: 'article-bottom' | 'longform-bottom';
  longform: boolean;
}
