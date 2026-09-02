import type { APIRoute } from 'astro';
import { routes } from '../config/routes';
import { absoluteUrl, site } from '../config/site';

export const GET: APIRoute = () => {
  const links = routes.filter((route) => route.indexable).map((route) => `- ${absoluteUrl(route.path)}`);
  return new Response(`# ${site.name}\n\nEvidence-based fitness and nutrition articles and tools. Canonical HTML pages:\n\n${links.join('\n')}\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
