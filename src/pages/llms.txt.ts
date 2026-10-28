import type { APIRoute } from 'astro';
import { createLlmsDocument } from '../config/llms';
import { getPublishedPosts } from '../lib/content';
import { renderLlmsTxt } from '../lib/llms';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  return new Response(renderLlmsTxt(createLlmsDocument(posts)), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
