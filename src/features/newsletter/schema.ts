import { blogSlugs } from '../../config/routes';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_FIELDS = new Set(['email', 'campaign', 'formId', 'sourceUrl', 'company', 'g-recaptcha-response']);
const ALLOWED_SOURCE_PATHS = new Set([
  '/',
  '/blog/',
  '/books/',
  '/calorie-calculator/',
  '/join/',
  '/lose-fat-gain-muscle/',
  '/supplements/',
  // Article routes are no-slash sources. Derive them from the route registry so new articles stay valid.
  ...blogSlugs.map((slug) => `/blog/${slug}`),
]);

export interface SubscriptionInput {
  email: string;
  campaign: string;
  formId: string;
  sourceUrl: string;
  challengeToken: string;
}

export type ValidationResult =
  | { ok: true; value: SubscriptionInput }
  | { ok: false; status: 400 | 413; code: string };

const boundedText = (value: FormDataEntryValue | null, maximum: number) =>
  typeof value === 'string' && value.length <= maximum ? value.trim() : null;

export function validateSubscriptionForm(form: FormData): ValidationResult {
  for (const key of form.keys()) {
    if (!ALLOWED_FIELDS.has(key)) return { ok: false, status: 400, code: 'unexpected_field' };
  }

  const honeypot = boundedText(form.get('company'), 200);
  if (honeypot === null) return { ok: false, status: 413, code: 'field_too_large' };
  if (honeypot !== '') return { ok: false, status: 400, code: 'automated_submission' };

  const email = boundedText(form.get('email'), 254)?.toLowerCase();
  const campaign = boundedText(form.get('campaign'), 64);
  const formId = boundedText(form.get('formId'), 64);
  const sourceUrl = boundedText(form.get('sourceUrl'), 160);
  const challengeToken = boundedText(form.get('g-recaptcha-response'), 4096) ?? '';

  if (!email || !EMAIL_PATTERN.test(email)) return { ok: false, status: 400, code: 'invalid_email' };
  if (!campaign || !/^[a-z0-9_-]+$/i.test(campaign)) return { ok: false, status: 400, code: 'invalid_campaign' };
  if (!formId || !/^[a-z0-9_-]+$/i.test(formId)) return { ok: false, status: 400, code: 'invalid_form' };
  if (!sourceUrl || !ALLOWED_SOURCE_PATHS.has(sourceUrl)) return { ok: false, status: 400, code: 'invalid_source' };

  return { ok: true, value: { email, campaign, formId, sourceUrl, challengeToken } };
}

export function hasValidRequestOrigin(request: Request, canonicalOrigin: string, additionalOrigin?: string): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const requestUrl = new URL(request.url);
  const allowedOrigins = new Set([canonicalOrigin]);
  if (additionalOrigin) {
    try {
      allowedOrigins.add(new URL(additionalOrigin).origin);
    } catch {
      return false;
    }
  }
  if (requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1') {
    allowedOrigins.add(requestUrl.origin);
  }

  if (origin) return allowedOrigins.has(origin);
  if (!referer) return false;
  try {
    return allowedOrigins.has(new URL(referer).origin);
  } catch {
    return false;
  }
}
