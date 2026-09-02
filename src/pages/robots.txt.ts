import type { APIRoute } from 'astro';
import { site } from '../config/site';

export const GET: APIRoute = () => {
  const exclusions = site.crawlerPolicy.blockedAgents.map((agent) => `User-agent: ${agent}\nDisallow: /`).join('\n\n');
  const body = `User-agent: *\nAllow: /\n\n${exclusions}\n\nSitemap: ${site.origin}/sitemap.xml\n`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
