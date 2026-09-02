import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findForbiddenOutputMatches } from '../../scripts/verify-dist-output';

const fixtureRoot = fileURLToPath(new URL('../fixtures/verify-dist/browser-output/', import.meta.url));

describe('distribution forbidden-string scan', () => {
  it('detects a forbidden dependency emitted only in browser JavaScript', () => {
    expect(findForbiddenOutputMatches(fixtureRoot)).toEqual([
      {
        forbidden: 'jquery',
        outputPath: '_astro/forbidden-only.js',
      },
    ]);
  });
});
