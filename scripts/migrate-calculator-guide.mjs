import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';

/*
 * Extracts the calculator-page guide body from the audited legacy
 * `calorie-calculator/index.html`. The introduction, callouts, image, and table
 * of contents are owned by `src/components/CalculatorGuideIntro.astro`; this
 * script owns everything from `<h3 id="diet">` to the end of the guide.
 *
 * Usage: node scripts/migrate-calculator-guide.mjs [--check]
 */
const repositoryRoot = new URL('../', import.meta.url).pathname;
const sourcePath = join(repositoryRoot, 'calorie-calculator/index.html');
const outputPath = join(repositoryRoot, 'src/content/pages/calculator-guide.html');
const checkOnly = process.argv.includes('--check');

const $ = load(readFileSync(sourcePath, 'utf8'), { decodeEntities: false });
const body = $('article.container .post-body').first();
if (!body.length) throw new Error('Missing legacy calculator guide body.');

const start = body.children('#diet').first();
if (!start.length) throw new Error('Missing legacy `#diet` heading.');

// Keep only the guide remainder: the Diet heading and every following sibling.
start.prevAll().remove();

body.find('script, style, form, #share, #comm, .e-on-delay, .email-float').remove();
body.find('[onclick], [onmouseover], [onmouseout]').each((_, element) => {
  $(element).removeAttr('onclick').removeAttr('onmouseover').removeAttr('onmouseout');
});
// Legacy Bootstrap tooltip hooks on Amazon links have no runtime here; the
// `title` attribute already carries the same "Links to Amazon" text.
body.find('[data-toggle="tooltip"]').each((_, element) => {
  $(element).removeAttr('data-toggle').removeAttr('data-placement');
});
body.find('a[target="_blank"]').each((_, element) => {
  const rel = ($(element).attr('rel') ?? '').split(/\s+/).filter(Boolean);
  if (!rel.includes('noopener')) rel.push('noopener');
  $(element).attr('rel', rel.join(' '));
});

const output = `${body.html()?.trim() ?? ''}\n`;

if (checkOnly) {
  const current = readFileSync(outputPath, 'utf8');
  if (current !== output) {
    console.error('src/content/pages/calculator-guide.html is out of date; rerun scripts/migrate-calculator-guide.mjs');
    process.exit(1);
  }
  console.log('calculator-guide.html is current');
} else {
  mkdirSync(join(repositoryRoot, 'src/content/pages'), { recursive: true });
  writeFileSync(outputPath, output);
  console.log(`wrote ${outputPath} (${output.length} bytes)`);
}
