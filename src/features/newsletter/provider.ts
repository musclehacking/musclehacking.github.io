import type { SubscriptionInput } from './schema';

export interface NewsletterEnvironment {
  NEWSLETTER_PROVIDER_URL?: string;
  NEWSLETTER_PROVIDER_TOKEN?: string;
  NEWSLETTER_AUDIENCE_ID?: string;
  RECAPTCHA_SECRET?: string;
  NEWSLETTER_ALLOWED_ORIGIN?: string;
  DEPLOYMENT_VERSION?: string;
}

export type ProviderResult =
  | { ok: true }
  | { ok: false; code: 'not_configured' | 'challenge_failed' | 'timeout' | 'provider_error' };

async function verifyRecaptcha(token: string, secret: string, fetcher: typeof fetch): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  const response = await fetcher('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export async function subscribe(
  input: SubscriptionInput,
  environment: NewsletterEnvironment,
  fetcher: typeof fetch = fetch,
): Promise<ProviderResult> {
  const { NEWSLETTER_PROVIDER_URL, NEWSLETTER_PROVIDER_TOKEN, NEWSLETTER_AUDIENCE_ID, RECAPTCHA_SECRET } = environment;
  if (!NEWSLETTER_PROVIDER_URL || !NEWSLETTER_PROVIDER_TOKEN || !NEWSLETTER_AUDIENCE_ID || !RECAPTCHA_SECRET) {
    return { ok: false, code: 'not_configured' };
  }

  try {
    if (!(await verifyRecaptcha(input.challengeToken, RECAPTCHA_SECRET, fetcher))) {
      return { ok: false, code: 'challenge_failed' };
    }
    const response = await fetcher(NEWSLETTER_PROVIDER_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${NEWSLETTER_PROVIDER_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audienceId: NEWSLETTER_AUDIENCE_ID,
        email: input.email,
        campaign: input.campaign,
        source: input.sourceUrl,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    return response.ok ? { ok: true } : { ok: false, code: 'provider_error' };
  } catch (error) {
    return { ok: false, code: error instanceof DOMException && error.name === 'TimeoutError' ? 'timeout' : 'provider_error' };
  }
}
