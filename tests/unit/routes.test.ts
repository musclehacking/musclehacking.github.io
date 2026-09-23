import { describe, expect, it } from 'vitest';
import { blogSlugs, routes } from '../../src/config/routes';

describe('route registry', () => {
  it('owns the 19 served legacy routes exactly once', () => {
    // The 20th legacy route, /blog/calorie-calculator-how-to, is a 301 in public/_redirects.
    expect(routes).toHaveLength(19);
    expect(new Set(routes.map((route) => route.path)).size).toBe(routes.length);
    expect(blogSlugs).toHaveLength(11);
    expect(routes.some((route) => route.path === '/blog/calorie-calculator-how-to')).toBe(false);
  });

  it('preserves mixed slash and index policy', () => {
    expect(routes.filter((route) => route.owner === 'blog').every((route) => route.slashMode === 'no-slash')).toBe(true);
    expect(routes.filter((route) => route.owner === 'page').every((route) => route.slashMode === 'slash')).toBe(true);
    expect(routes.find((route) => route.path === '/join/')?.indexable).toBe(false);
    expect(routes.find((route) => route.path === '/one-last-step/')?.sitemap).toBe(false);
    expect(routes.find((route) => route.path === '/blog/')?.indexable).toBe(true);
  });
});
