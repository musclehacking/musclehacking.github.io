import { describe, expect, it } from 'vitest';
import { blogSlugs, routes } from '../../src/config/routes';

describe('route registry', () => {
  it('owns all 20 legacy routes exactly once', () => {
    expect(routes).toHaveLength(20);
    expect(new Set(routes.map((route) => route.path)).size).toBe(routes.length);
    expect(blogSlugs).toHaveLength(12);
  });

  it('preserves mixed slash and index policy', () => {
    expect(routes.filter((route) => route.owner === 'blog').every((route) => route.slashMode === 'no-slash')).toBe(true);
    expect(routes.filter((route) => route.owner === 'page').every((route) => route.slashMode === 'slash')).toBe(true);
    expect(routes.find((route) => route.path === '/join/')?.indexable).toBe(false);
    expect(routes.find((route) => route.path === '/one-last-step/')?.sitemap).toBe(false);
    expect(routes.find((route) => route.path === '/blog/')?.indexable).toBe(true);
  });
});
