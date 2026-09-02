import type { APIRoute } from 'astro';
import { routes } from '../config/routes';
import { absoluteUrl } from '../config/site';

const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export const GET: APIRoute = () => {
  const urls = routes.filter((route) => route.sitemap).map((route) => `  <url><loc>${escapeXml(absoluteUrl(route.path))}</loc></url>`);
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
