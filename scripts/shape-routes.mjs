import { rename, rmdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { blogSlugs, routes } from '../src/config/routes.ts';

const clientRoot = new URL('../dist/client/', import.meta.url).pathname;

for (const slug of blogSlugs) {
  const routeDirectory = join(clientRoot, 'blog', slug);
  await rename(join(routeDirectory, 'index.html'), join(clientRoot, 'blog', `${slug}.html`));
  await rmdir(routeDirectory);
}

const redirectRules = routes.flatMap((route) => {
  if (route.path === '/') return ['/ /index.html 200'];
  if (route.slashMode === 'slash') {
    return [`${route.path.slice(0, -1)} ${route.path} 301`, `${route.path} ${route.path}index.html 200`];
  }
  return [`${route.path} ${route.path}.html 200`];
});

await writeFile(join(clientRoot, '_redirects'), `${redirectRules.join('\n')}\n`);
