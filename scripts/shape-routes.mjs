import { rename, rmdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { blogSlugs, permanentRedirects, routes } from '../src/config/routes.ts';

const clientRoot = new URL('../dist/client/', import.meta.url).pathname;

for (const slug of blogSlugs) {
  const routeDirectory = join(clientRoot, 'blog', slug);
  await rename(join(routeDirectory, 'index.html'), join(clientRoot, 'blog', `${slug}.html`));
  await rmdir(routeDirectory);
}

// Retired URLs come first so no route rule can shadow them.
const retiredRules = permanentRedirects.map(({ from, to }) => `${from} ${to} 301`);

const routeRules = routes.flatMap((route) => {
  if (route.path === '/') return ['/ /index.html 200'];
  if (route.slashMode === 'slash') {
    return [`${route.path.slice(0, -1)} ${route.path} 301`, `${route.path} ${route.path}index.html 200`];
  }
  return [`${route.path} ${route.path}.html 200`];
});

await writeFile(join(clientRoot, '_redirects'), `${[...retiredRules, ...routeRules].join('\n')}\n`);
