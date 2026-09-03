import type { APIRoute } from 'astro';
import { routes } from '../config/routes';
import { absoluteUrl, site } from '../config/site';
import { getPublishedPosts } from '../lib/content';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const paths = [
    ...routes.filter((route) => route.owner === 'page' && route.indexable).map((route) => route.path),
    ...posts.map((entry) => `/blog/${entry.id}`),
  ];
  const links = paths.map((path) => `- ${absoluteUrl(path)}`);
  return new Response(`# ${site.name}\n\nEvidence-based fitness and nutrition articles and tools. Canonical HTML pages:\n\n${links.join('\n')}\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
