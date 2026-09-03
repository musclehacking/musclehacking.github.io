import { describe, expect, it } from 'vitest';
import { deriveByline } from '../../src/lib/content/byline';

describe('deriveByline', () => {
  it('formats a posted-only byline in UTC', () => {
    expect(deriveByline(new Date('2024-04-01T00:00:00Z'), undefined, 'Jay')).toBe('By Jay — Posted April 2024');
  });

  it('formats updated and posted months in UTC', () => {
    expect(deriveByline(new Date('2018-10-01T00:00:00Z'), new Date('2024-04-01T00:00:00Z'), 'Jay'))
      .toBe('By Jay — Updated April 2024, Posted October 2018');
  });
});
