/*
 * Runs `tests/fixtures/cloudflare-preview-http-contract.json` against a hosted origin.
 *
 *   node scripts/hosted-contract.mjs [origin]
 *
 * The origin defaults to the fixture's `baseUrl`, which is the isolated review Worker
 * `musclehacking-astro-preview`. This script only issues HTTP requests; it never uploads,
 * promotes, or otherwise changes a Cloudflare resource.
 *
 * `pathFromBuild` resolves a fingerprinted asset path out of the current build so the
 * fixture does not have to be edited whenever a content hash changes (AUD-05).
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturePath = fileURLToPath(new URL('../tests/fixtures/cloudflare-preview-http-contract.json', import.meta.url));
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const origin = (process.argv[2] ?? fixture.baseUrl).replace(/\/$/, '');
const failures = [];

const resolvePath = async (testCase) => {
  if (testCase.path) return testCase.path;
  const { file, pattern } = testCase.pathFromBuild;
  const source = await readFile(path.resolve(path.dirname(fixturePath), file), 'utf8');
  const match = source.match(new RegExp(pattern));
  if (!match) throw new Error(`No build match for ${pattern} in ${file}`);
  return match[0];
};

const expectList = (value) => (Array.isArray(value) ? value : [value]);

const checkHeader = (name, expected, actual, report) => {
  if (actual === null) {
    report(`header ${name} is missing`);
    return;
  }
  if (typeof expected === 'string') {
    if (actual !== expected) report(`header ${name} is "${actual}", expected "${expected}"`);
    return;
  }
  for (const fragment of expectList(expected.includes)) {
    if (!actual.includes(fragment)) report(`header ${name} is "${actual}", expected to include "${fragment}"`);
  }
};

for (const testCase of fixture.cases) {
  const target = await resolvePath(testCase);
  const report = (detail) => failures.push(`${testCase.name} [${target}]: ${detail}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), fixture.timeoutMs ?? 10_000);

  try {
    const response = await fetch(`${origin}${target}`, {
      body: testCase.body,
      headers: testCase.headers,
      method: testCase.method ?? 'GET',
      redirect: testCase.redirect ?? 'follow',
      signal: controller.signal,
    });
    const { expect } = testCase;

    if (response.status !== expect.status) report(`status ${response.status}, expected ${expect.status}`);
    for (const [name, expected] of Object.entries(expect.headers ?? {})) {
      checkHeader(name, expected, response.headers.get(name), report);
    }
    for (const name of fixture.sensitiveHeaders ?? []) {
      if (response.headers.has(name)) report(`unexpected sensitive header ${name}`);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    const body = bytes.toString('utf8');
    if (expect.utf8 && Buffer.compare(Buffer.from(body, 'utf8'), bytes) !== 0) report('body is not valid UTF-8');
    for (const fragment of expectList(expect.bodyIncludes ?? [])) {
      if (!body.includes(fragment)) report(`body does not include ${JSON.stringify(fragment)}`);
    }
    for (const fragment of expectList(expect.bodyExcludes ?? [])) {
      if (body.includes(fragment)) report(`body unexpectedly includes ${JSON.stringify(fragment)}`);
    }
    if (expect.bodyEqualsFile) {
      const expected = await readFile(path.resolve(path.dirname(fixturePath), expect.bodyEqualsFile));
      if (Buffer.compare(bytes, expected) !== 0) report(`body differs from ${expect.bodyEqualsFile}`);
    }

    console.log(`${failures.some((entry) => entry.startsWith(testCase.name)) ? 'FAIL' : 'PASS'} ${testCase.name} [${target}]`);
  } catch (error) {
    report(error instanceof Error ? error.message : String(error));
    console.log(`FAIL ${testCase.name} [${target}]`);
  } finally {
    clearTimeout(timer);
  }
}

console.log(`\n${fixture.cases.length - new Set(failures.map((entry) => entry.split(' [')[0])).size} of ${fixture.cases.length} hosted contract cases passed against ${origin}`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`  ${failure}`);
  process.exitCode = 1;
}
