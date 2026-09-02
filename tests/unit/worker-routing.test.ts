import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

interface WranglerConfig {
  assets?: {
    run_worker_first?: boolean | string[];
  };
}

describe('Cloudflare Worker routing boundary', () => {
  test('runs the Worker only for the newsletter API', () => {
    const configUrl = new URL('../../wrangler.jsonc', import.meta.url);
    const config = JSON.parse(readFileSync(configUrl, 'utf8')) as WranglerConfig;

    expect(config.assets?.run_worker_first).toEqual(['/api/subscribe']);
  });
});
