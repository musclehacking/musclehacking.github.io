import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';

const clientRoot = new URL('../dist/client/', import.meta.url).pathname;
const hashes = new Set();

for (const path of readdirRecursive(clientRoot).filter((candidate) => candidate.endsWith('.html'))) {
  const $ = load(readFileSync(path, 'utf8'));
  $('script:not([src])').each((_, script) => {
    const source = $(script).html() ?? '';
    if (source) hashes.add(`'sha256-${createHash('sha256').update(source).digest('base64')}'`);
  });
}

const headersPath = join(clientRoot, '_headers');
const headers = readFileSync(headersPath, 'utf8');
const scriptPolicy = `script-src 'self' ${[...hashes].sort().join(' ')}`.trim();
writeFileSync(headersPath, headers.replace(/script-src 'self'[^;]*/, scriptPolicy));

function readdirRecursive(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? readdirRecursive(path) : [path];
  });
}
