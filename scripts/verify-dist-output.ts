import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

export const forbiddenOutputStrings = [
  '[object Object]',
  'UA-120945323-1',
  'googletagmanager.com',
  'jquery',
  'bootstrap.min.js',
  'popper',
  'tippy',
  'anchor.min.js',
  'musclehacking.workers.dev',
] as const;

const scannableOutputExtensions = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.json',
  '.map',
  '.mjs',
  '.txt',
  '.webmanifest',
  '.xml',
]);

const browserCodeExtensions = new Set(['.cjs', '.js', '.map', '.mjs']);

export interface ForbiddenOutputMatch {
  forbidden: string;
  outputPath: string;
}

/** Scan all emitted browser code and text metadata that can contain runtime strings. */
export function findForbiddenOutputMatches(outputRoot: string): ForbiddenOutputMatch[] {
  return readdirRecursive(outputRoot)
    .filter((path) => scannableOutputExtensions.has(extname(path).toLowerCase()))
    .flatMap((path) => {
      const content = readFileSync(path, 'utf8').toLowerCase();
      const isBrowserCode = browserCodeExtensions.has(extname(path).toLowerCase());
      return forbiddenOutputStrings
        // JavaScript libraries legitimately use this coercion marker internally. It is
        // only a defect when it leaks into rendered output or text metadata.
        .filter((forbidden) => forbidden !== '[object Object]' || !isBrowserCode)
        .filter((forbidden) => content.includes(forbidden.toLowerCase()))
        .map((forbidden) => ({ forbidden, outputPath: relative(outputRoot, path) }));
    });
}

function readdirRecursive(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? readdirRecursive(path) : [path];
  });
}
