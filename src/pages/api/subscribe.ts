import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { site } from '../../config/site';
import { subscribe, type NewsletterEnvironment } from '../../features/newsletter/provider';
import { readBoundedFormData } from '../../features/newsletter/request-body';
import { hasValidRequestOrigin, validateSubscriptionForm } from '../../features/newsletter/schema';

export const prerender = false;

const MAXIMUM_REQUEST_BYTES = 8_192;
const SECURITY_HEADERS = {
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};
const methodNotAllowed = () => new Response('Method not allowed', {
  status: 405,
  headers: { ...SECURITY_HEADERS, Allow: 'POST', 'cache-control': 'no-store' },
});
const safeError = (status: number, code: string) =>
  new Response(JSON.stringify({ error: code }), {
    status,
    headers: {
      ...SECURITY_HEADERS,
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
const redirectSuccess = () => new Response(null, {
  status: 303,
  headers: { ...SECURITY_HEADERS, location: '/one-last-step/', 'cache-control': 'no-store' },
});

export const POST: APIRoute = async ({ request }) => {
  const newsletterEnvironment = env as NewsletterEnvironment;
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAXIMUM_REQUEST_BYTES) return safeError(413, 'request_too_large');
  if (!hasValidRequestOrigin(request, site.origin, newsletterEnvironment.NEWSLETTER_ALLOWED_ORIGIN)) return safeError(403, 'invalid_origin');
  if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded') &&
      !request.headers.get('content-type')?.startsWith('multipart/form-data')) {
    return safeError(415, 'unsupported_media_type');
  }

  const body = await readBoundedFormData(request, MAXIMUM_REQUEST_BYTES);
  if (!body.ok) return safeError(body.code === 'request_too_large' ? 413 : 400, body.code);

  const validation = validateSubscriptionForm(body.form);
  if (!validation.ok) return safeError(validation.status, validation.code);

  const result = await subscribe(validation.value, newsletterEnvironment);
  if (result.ok) return redirectSuccess();
  if (result.code === 'challenge_failed') return safeError(400, 'challenge_failed');
  if (result.code === 'not_configured') return safeError(503, 'newsletter_unavailable');
  return safeError(502, result.code === 'timeout' ? 'provider_timeout' : 'provider_unavailable');
};

export const ALL: APIRoute = methodNotAllowed;
