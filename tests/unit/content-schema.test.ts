import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { articleSchema } from '../../src/content.config';

const schema = articleSchema({
  image: () => z.object({ src: z.string(), width: z.number(), height: z.number() }),
} as never);

const validEntry = {
  title: 'Example',
  description: 'Example description',
  published: '2025-01-01',
  image: '/img/example.png',
  imageWidth: 700,
  imageHeight: 420,
  imageAlt: 'Example image',
};

describe('article schema', () => {
  it.each(['title', 'description', 'published', 'image', 'imageAlt'] as const)(
    'rejects a missing %s field',
    (field) => {
      const entry = { ...validEntry };
      delete entry[field];
      expect(() => schema.parse(entry)).toThrow();
    },
  );

  it('requires dimensions for a public image', () => {
    const { imageWidth: _width, imageHeight: _height, ...entry } = validEntry;
    const result = schema.safeParse(entry);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(['imageWidth', 'imageHeight']);
    }
  });

  it('accepts dimensions resolved from a relative image asset', () => {
    expect(schema.parse({
      ...validEntry,
      image: { src: '/_astro/example.hash.png', width: 700, height: 420 },
      imageWidth: undefined,
      imageHeight: undefined,
    }).image).toMatchObject({ width: 700, height: 420 });
  });
});
