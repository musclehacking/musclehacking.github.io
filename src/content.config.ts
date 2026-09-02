import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(1),
    pageTitle: z.string().min(1),
    description: z.string().min(1),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    image: z.string().startsWith('/'),
    imageAlt: z.string().min(1),
    imageWidth: z.number().int().positive(),
    imageHeight: z.number().int().positive(),
    imageCaption: z.string().min(1).optional(),
    byline: z.string().min(1),
    canonicalOverride: z.url().optional(),
  }),
});

export const collections = { blog };
