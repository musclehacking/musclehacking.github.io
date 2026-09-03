import type { APIRoute } from 'astro';
import { routes } from '../config/routes';
import { absoluteUrl } from '../config/site';
import { getPublishedPosts } from '../lib/content';

const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const paths = [
    ...routes.filter((route) => route.owner === 'page' && route.sitemap).map((route) => route.path),
    ...posts.map((entry) => `/blog/${entry.id}`),
  ];
  const urls = paths.map((path) => `  <url><loc>${escapeXml(absoluteUrl(path))}</loc></url>`);
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
