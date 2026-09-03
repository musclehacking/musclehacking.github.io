import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { routeByPath } from './config/routes';

const navigationLinkSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1),
  title: z.string().min(1),
  displayTitle: z.string().min(1).optional(),
});

export const articleSchema = ({ image }: SchemaContext) => {
  // Public legacy images must remain stable URLs; relative author images use Astro's image pipeline.
  const imageSource = z.union([z.string().startsWith('/img/'), image()]);

  return z.object({
    title: z.string().min(1),
    seoTitle: z.string().min(1).optional(),
    description: z.string().min(1),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    image: imageSource,
    imageWidth: z.number().int().positive().optional(),
    imageHeight: z.number().int().positive().optional(),
    imageAlt: z.string().min(1),
    imageCaption: z.string().min(1).optional(),
    byline: z.string().min(1).optional(),
    shortTitle: z.string().min(1).optional(),
    linkTitle: z.string().min(1).optional(),
    card: z.object({
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      imageAlt: z.string().min(1).optional(),
      image: imageSource.optional(),
      ratio: z.string().min(1).optional(),
    }).default({}),
    navigation: z.object({
      previous: z.union([navigationLinkSchema, z.literal(false)]).optional(),
      next: z.union([navigationLinkSchema, z.literal(false)]).optional(),
      wrapTitles: z.boolean().optional(),
    }).default({}),
    ending: z.object({
      floatingShare: z.boolean().default(true),
      disclaimer: z.union([z.enum(['generic', 'calculator']), z.literal(false)]).default(false),
      headingLinks: z.boolean().default(true),
    }).default({ floatingShare: true, disclaimer: false, headingLinks: true }),
    notice: z.object({
      variant: z.string().min(1),
      label: z.string().min(1),
      html: z.string().min(1),
    }).optional(),
    canonicalOverride: z.url().optional(),
  }).superRefine((entry, context) => {
    if (typeof entry.image === 'string' && entry.image.startsWith('/img/')) {
      if (!entry.imageWidth) {
        context.addIssue({ code: 'custom', path: ['imageWidth'], message: 'imageWidth is required when image uses /img/.' });
      }
      if (!entry.imageHeight) {
        context.addIssue({ code: 'custom', path: ['imageHeight'], message: 'imageHeight is required when image uses /img/.' });
      }
    }
  });
};

const blog = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/blog' }),
  schema: articleSchema,
});

const pages = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/pages' }),
  schema: (context) => articleSchema(context).and(z.object({
    path: z.string().refine((path) => routeByPath.has(path), 'path must identify a route in src/config/routes.ts'),
    listed: z.boolean().default(true),
  })),
});

export const collections = { blog, pages };
