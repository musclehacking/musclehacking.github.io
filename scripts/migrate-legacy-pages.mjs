import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import sharp from 'sharp';

const repositoryRoot = new URL('../', import.meta.url).pathname;
const outputDirectory = join(repositoryRoot, 'src/content/pages');
const pages = {
  books: 'books/index.html',
  guide: 'lose-fat-gain-muscle/index.html',
};

mkdirSync(outputDirectory, { recursive: true });

for (const [name, relativePath] of Object.entries(pages)) {
  const $ = load(readFileSync(join(repositoryRoot, relativePath), 'utf8'), { decodeEntities: false });
  const body = $('.post-body').first();
  body.find('script, style, form, #share, #comm, .e-on-delay, .email-float').remove();
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
  writeFileSync(join(outputDirectory, `${name}.html`), `${body.html()?.trim() ?? ''}\n`);
}
