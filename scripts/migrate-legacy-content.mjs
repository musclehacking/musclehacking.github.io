import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { load } from 'cheerio';
import sharp from 'sharp';

const repositoryRoot = new URL('../', import.meta.url).pathname;
const sourceDirectory = join(repositoryRoot, 'blog');
const outputDirectory = join(repositoryRoot, 'src/content/blog');
const checkOnly = process.argv.includes('--check');

const publicationDates = {
  'australian-health-star-rating': '2018-06-01',
  'best-protein-powder-for-building-muscle': '2018-10-01',
  'breakup-energy': '2025-09-05',
  'calorie-calculator-how-to': '2018-03-01',
  change: '2024-03-01',
  'healthy-low-calorie-foods': '2018-08-01',
  'healthy-organic-post': '2018-05-01',
  idols: '2024-06-01',
  normal: '2023-06-01',
  'reject-modernity-embrace-masculinity': '2022-10-01',
  weak: '2024-04-01',
  'what-is-intermittent-fasting': '2018-04-01',
};

const updateDates = {
  'best-protein-powder-for-building-muscle': '2024-04-01',
  'healthy-low-calorie-foods': '2024-01-01',
  idols: '2024-12-01',
  normal: '2024-02-01',
  'reject-modernity-embrace-masculinity': '2025-09-01',
  'what-is-intermittent-fasting': '2024-04-01',
};

const quote = (value) => JSON.stringify(value ?? '');

const normalizeImportedHtml = (html) => {
  const lines = html.trim().split('\n');
  const contentIndentation = lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => line.match(/^[\t ]*/)?.[0].length ?? 0);
  const commonIndentation = contentIndentation.length > 0 ? Math.min(...contentIndentation) : 0;

  // Blank lines terminate Markdown raw HTML blocks, after which nested legacy indentation becomes code.
  return lines
    .filter((line) => line.trim())
    .map((line, index) => index === 0 ? line.trimEnd() : line.slice(commonIndentation).trimEnd())
    .join('\n');
};

mkdirSync(outputDirectory, { recursive: true });

for (const filename of readdirSync(sourceDirectory).filter((name) => name.endsWith('.html') && name !== 'index.html').sort()) {
  const slug = basename(filename, '.html');
  const source = readFileSync(join(sourceDirectory, filename), 'utf8');
  const $ = load(source, { decodeEntities: false });
  const body = $('.post-body').first();

  body.find('#comm').nextUntil('#post-nav').remove();
  body.find('script, #share, #comm, #post-nav, #em-opt, .e-on-delay, .email-float, form').remove();
  body.find('[onclick], [onmouseover], [onmouseout]').each((_, element) => {
    $(element).removeAttr('onclick').removeAttr('onmouseover').removeAttr('onmouseout');
  });
  body.find('a[target="_blank"]').attr('rel', 'noopener');
  for (const element of body.find('img').toArray()) {
    const sourcePath = $(element).attr('src');
    if (!sourcePath?.startsWith('/img/')) continue;
    const metadata = await sharp(join(repositoryRoot, sourcePath.slice(1))).metadata();
    $(element).attr('width', String(metadata.width)).attr('height', String(metadata.height));
    if ($(element).attr('alt') === undefined) $(element).attr('alt', '');
    $(element).attr('loading', 'lazy').attr('decoding', 'async');
  }

  const title = $('h1').first().text().replace(/\s+/g, ' ').trim();
  const pageTitle = $('title').first().text().replace(/\s+/g, ' ').trim();
  const description = $('meta[name="description"]').attr('content')?.trim() ?? '';
  const imageUrl = $('meta[property="og:image"]').attr('content') ?? '';
  const image = imageUrl.replace(/^https?:\/\/www\.musclehacking\.com/, '') || '/img/musclehacking.png';
  const imageAlt = $('#post-thumbnail img').attr('alt')?.trim() || title;
  const imageMetadata = await sharp(join(repositoryRoot, image.slice(1))).metadata();
  const imageCaption = slug === 'calorie-calculator-how-to'
    ? ''
    : $('#post-thumbnail').next('.figurecap').text().replace(/\s+/g, ' ').trim();
  const byline = $('.post-header p').first().text().replace(/\s+/g, ' ').trim();
  const updated = updateDates[slug] ? `\nupdated: ${quote(updateDates[slug])}` : '';
  const caption = imageCaption ? `\nimageCaption: ${quote(imageCaption)}` : '';
  const frontmatter = `---\ntitle: ${quote(title)}\npageTitle: ${quote(pageTitle)}\ndescription: ${quote(description)}\npublished: ${quote(publicationDates[slug])}${updated}\nimage: ${quote(image)}\nimageAlt: ${quote(imageAlt)}\nimageWidth: ${imageMetadata.width}\nimageHeight: ${imageMetadata.height}${caption}\nbyline: ${quote(byline)}\n---\n\n`;

  const importedHtml = normalizeImportedHtml(body.html() ?? '');
  const output = `${frontmatter}${importedHtml}\n`;
  const outputPath = join(outputDirectory, `${slug}.md`);
  if (checkOnly) {
    const current = readFileSync(outputPath, 'utf8');
    if (current !== output) throw new Error(`Migration output differs for ${slug}.md`);
  } else {
    writeFileSync(outputPath, output);
  }
}

if (checkOnly) console.log(`Verified repeatable migration output for ${Object.keys(publicationDates).length} articles.`);
