import { describe, expect, it } from 'vitest';
import { site } from '../../src/config/site';
import { resolvePageMetadata } from '../../src/lib/metadata';

const base = {
  title: 'Example',
  description: 'Example description.',
  canonicalPath: '/example/',
};

describe('resolvePageMetadata', () => {
  it('composes the default document title', () => {
    expect(resolvePageMetadata(base, site).documentTitle).toBe('Example | Muscle Hacking');
  });

  it('prefixes the home descriptor', () => {
    expect(resolvePageMetadata({ ...base, titleMode: 'prefixed' }, site).documentTitle).toBe('Muscle Hacking: Example');
  });

  it('keeps absolute titles unchanged', () => {
    expect(resolvePageMetadata({ ...base, titleMode: 'absolute' }, site).documentTitle).toBe('Example');
  });

  it.each([
    [{ ...base, title: '' }, 'title'],
    [{ ...base, description: '' }, 'description'],
    [{ ...base, title: 'Example | Muscle Hacking' }, 'site name'],
    [{ ...base, title: 'Muscle Hacking: Example', titleMode: 'prefixed' as const }, 'site name'],
  ])('rejects invalid metadata %#', (input, message) => {
    expect(() => resolvePageMetadata(input, site)).toThrow(message);
  });
});
