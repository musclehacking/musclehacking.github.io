import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absoluteUrl, site } from '../config/site';

const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export const GET: APIRoute = async () => {
  const entries = (await getCollection('blog')).sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
  const items = entries.map((entry) => {
    const link = absoluteUrl(`/blog/${entry.id}`);
    return `<item><title>${escapeXml(entry.data.title)}</title><link>${link}</link><guid>${link}</guid><pubDate>${entry.data.published.toUTCString()}</pubDate><description>${escapeXml(entry.data.description)}</description></item>`;
  });
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${site.name}</title><link>${site.origin}/</link><description>${escapeXml(site.defaultDescription)}</description>${items.join('')}</channel></rss>\n`, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
};
