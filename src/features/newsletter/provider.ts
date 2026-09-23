import type { SubscriptionInput } from './schema';

/**
 * Runtime configuration. Secrets are set with `wrangler secret put`; never commit values.
 * Preview and production use separate GetResponse lists (see documents/architecture/newsletter.md).
 */
export interface NewsletterEnvironment {
  TURNSTILE_SECRET_KEY?: string;
  GETRESPONSE_API_KEY?: string;
  GETRESPONSE_CAMPAIGN_ID?: string;
  NEWSLETTER_ALLOWED_ORIGIN?: string;
  DEPLOYMENT_VERSION?: string;
}

/** Visitor context the Worker observed; used for challenge binding and the provider record. */
export interface RequestContext {
  hostname: string;
  ipAddress?: string;
}

export type ProviderResult =
  | { ok: true }
  | { ok: false; code: 'not_configured' | 'challenge_failed' | 'timeout' | 'provider_error' };

export const TURNSTILE_ACTION = 'subscribe';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const GETRESPONSE_CONTACTS_URL = 'https://api.getresponse.com/v3/contacts';
// Cloudflare's documented dummy secrets return synthetic hostname/action values, so binding checks are skipped for them.
const TURNSTILE_DUMMY_SECRET = /^[123]x0{31}AA$/u;

interface SiteverifyResult {
  success?: boolean;
  hostname?: string;
  action?: string;
}

async function verifyTurnstile(
  token: string,
  secret: string,
  context: RequestContext,
  fetcher: typeof fetch,
): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (context.ipAddress) body.set('remoteip', context.ipAddress);
  const response = await fetcher(TURNSTILE_VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(5_000) });
  if (!response.ok) return false;
  const result = (await response.json()) as SiteverifyResult;
  if (result.success !== true) return false;
  if (TURNSTILE_DUMMY_SECRET.test(secret)) return true;
  // Bind the token to this host and form action so a token minted elsewhere cannot be replayed here.
  return result.hostname === context.hostname && result.action === TURNSTILE_ACTION;
}

async function addGetResponseContact(
  input: SubscriptionInput,
  apiKey: string,
  campaignId: string,
  context: RequestContext,
  fetcher: typeof fetch,
): Promise<ProviderResult> {
  const response = await fetcher(GETRESPONSE_CONTACTS_URL, {
    method: 'POST',
    headers: { 'x-auth-token': `api-key ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      email: input.email,
      campaign: { campaignId },
      // Legacy forms posted `start_day=0`: new contacts enter the autoresponder cycle on day 0.
      dayOfCycle: '0',
      ...(context.ipAddress ? { ipAddress: context.ipAddress } : {}),
    }),
    signal: AbortSignal.timeout(8_000),
  });
  // 202: queued. GetResponse applies the list's double opt-in and sends the confirmation email.
  if (response.status === 202) return { ok: true };
  // 409 code 1008: the address is already on the list. Treat as success so the form does not leak list membership.
  if (response.status === 409) {
    const error = (await response.json().catch(() => ({}))) as { code?: number };
    if (error.code === 1008) return { ok: true };
  }
  return { ok: false, code: 'provider_error' };
}

export async function subscribe(
  input: SubscriptionInput,
  environment: NewsletterEnvironment,
  context: RequestContext,
  fetcher: typeof fetch = fetch,
): Promise<ProviderResult> {
  const { TURNSTILE_SECRET_KEY, GETRESPONSE_API_KEY, GETRESPONSE_CAMPAIGN_ID } = environment;
  if (!TURNSTILE_SECRET_KEY) return { ok: false, code: 'not_configured' };

  try {
    if (!(await verifyTurnstile(input.challengeToken, TURNSTILE_SECRET_KEY, context, fetcher))) {
      return { ok: false, code: 'challenge_failed' };
    }
    // Checked after the challenge so a hosted preview can prove Turnstile before the provider is configured.
    if (!GETRESPONSE_API_KEY || !GETRESPONSE_CAMPAIGN_ID) return { ok: false, code: 'not_configured' };
    return await addGetResponseContact(input, GETRESPONSE_API_KEY, GETRESPONSE_CAMPAIGN_ID, context, fetcher);
  } catch (error) {
    return { ok: false, code: error instanceof DOMException && error.name === 'TimeoutError' ? 'timeout' : 'provider_error' };
  }
}
