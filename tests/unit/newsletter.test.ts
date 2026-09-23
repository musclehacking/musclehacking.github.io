import { describe, expect, it, vi } from 'vitest';
import { blogSlugs } from '../../src/config/routes';
import { subscribe } from '../../src/features/newsletter/provider';
import { hasValidRequestOrigin, validateSubscriptionForm } from '../../src/features/newsletter/schema';

const validForm = () => {
  const form = new FormData();
  form.set('email', ' Reader@Example.com ');
  form.set('campaign', 'site');
  form.set('formId', 'join');
  form.set('sourceUrl', '/join/');
  form.set('company', '');
  form.set('cf-turnstile-response', 'challenge');
  return form;
};

const validInput = () => {
  const result = validateSubscriptionForm(validForm());
  if (!result.ok) throw new Error(`Expected valid form, received ${result.code}`);
  return result.value;
};

describe('newsletter validation', () => {
  it('normalises valid fields', () => {
    expect(validateSubscriptionForm(validForm())).toMatchObject({ ok: true, value: { email: 'reader@example.com' } });
  });

  it.each(blogSlugs.map((slug) => `/blog/${slug}`))('accepts the newsletter form source %s', (sourceUrl) => {
    const form = validForm();
    form.set('sourceUrl', sourceUrl);

    expect(validateSubscriptionForm(form)).toMatchObject({ ok: true, value: { sourceUrl } });
  });

  it.each([
    ['invalid email', 'email', 'bad'],
    ['honeypot', 'company', 'filled'],
    ['invalid source', 'sourceUrl', 'https://attacker.example/'],
    ['unknown article source', 'sourceUrl', '/blog/not-published'],
  ])('rejects %s before a provider call', (_, key, value) => {
    const form = validForm();
    form.set(key, value);
    expect(validateSubscriptionForm(form).ok).toBe(false);
  });

  it('requires the canonical origin or referrer', () => {
    expect(hasValidRequestOrigin(new Request('https://worker.example/api', { headers: { origin: 'https://www.musclehacking.com' } }), 'https://www.musclehacking.com')).toBe(true);
    expect(hasValidRequestOrigin(new Request('https://worker.example/api', { headers: { origin: 'https://attacker.example' } }), 'https://www.musclehacking.com')).toBe(false);
  });

  it('allows the active loopback origin only during local preview', () => {
    expect(hasValidRequestOrigin(new Request('http://127.0.0.1:8787/api/subscribe', { headers: { origin: 'http://127.0.0.1:8787' } }), 'https://www.musclehacking.com')).toBe(true);
    expect(hasValidRequestOrigin(new Request('https://preview.example/api/subscribe', { headers: { origin: 'https://preview.example' } }), 'https://www.musclehacking.com')).toBe(false);
  });

  it('allows only an explicitly configured hosted preview origin', () => {
    const request = new Request('https://candidate.example/api/subscribe', { headers: { origin: 'https://candidate.example' } });
    expect(hasValidRequestOrigin(request, 'https://www.musclehacking.com', 'https://candidate.example')).toBe(true);
    expect(hasValidRequestOrigin(request, 'https://www.musclehacking.com', 'not a URL')).toBe(false);
  });
});

const context = { hostname: 'www.musclehacking.com', ipAddress: '203.0.113.7' };
const environment = {
  TURNSTILE_SECRET_KEY: 'live-secret',
  GETRESPONSE_API_KEY: 'test-key',
  GETRESPONSE_CAMPAIGN_ID: 'Abc12',
};
const siteverify = (body: Record<string, unknown>) => new Response(JSON.stringify(body), { status: 200 });
const passed = () => siteverify({ success: true, hostname: 'www.musclehacking.com', action: 'subscribe' });

describe('newsletter provider', () => {
  it('fails closed before network access when Turnstile is not configured', async () => {
    const fetcher = vi.fn();
    expect(await subscribe(validInput(), {}, context, fetcher)).toEqual({ ok: false, code: 'not_configured' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects a browser form with no challenge token before any network access', async () => {
    const form = validForm();
    form.delete('cf-turnstile-response');
    const validation = validateSubscriptionForm(form);
    if (!validation.ok) throw new Error(`Expected valid browser form, received ${validation.code}`);

    const fetcher = vi.fn();
    expect(await subscribe(validation.value, environment, context, fetcher)).toEqual({ ok: false, code: 'challenge_failed' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects a token longer than the 2048-character Turnstile maximum', () => {
    const form = validForm();
    form.set('cf-turnstile-response', 'x'.repeat(2049));
    expect(validateSubscriptionForm(form)).toMatchObject({ ok: true, value: { challengeToken: '' } });
  });

  it('sends the secret, token, and visitor IP to siteverify, then adds the contact to GetResponse', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(passed())
      .mockResolvedValueOnce(new Response(null, { status: 202 }));
    expect(await subscribe(validInput(), environment, context, fetcher)).toEqual({ ok: true });

    const [verifyUrl, verifyInit] = fetcher.mock.calls[0]!;
    expect(verifyUrl).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(Object.fromEntries(verifyInit.body as URLSearchParams)).toEqual({ secret: 'live-secret', response: 'challenge', remoteip: '203.0.113.7' });

    const [providerUrl, providerInit] = fetcher.mock.calls[1]!;
    expect(providerUrl).toBe('https://api.getresponse.com/v3/contacts');
    expect(providerInit.headers).toMatchObject({ 'x-auth-token': 'api-key test-key' });
    expect(JSON.parse(providerInit.body as string)).toEqual({
      email: 'reader@example.com',
      campaign: { campaignId: 'Abc12' },
      dayOfCycle: '0',
      ipAddress: '203.0.113.7',
    });
  });

  it.each([
    ['a failed challenge', { success: false }],
    ['a token minted for another host', { success: true, hostname: 'attacker.example', action: 'subscribe' }],
    ['a token minted for another action', { success: true, hostname: 'www.musclehacking.com', action: 'login' }],
  ])('stops before the provider on %s', async (_, body) => {
    const fetcher = vi.fn().mockResolvedValueOnce(siteverify(body));
    expect(await subscribe(validInput(), environment, context, fetcher)).toEqual({ ok: false, code: 'challenge_failed' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('skips host and action binding only for Cloudflare dummy secrets', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(siteverify({ success: true, hostname: 'example.com', action: '' }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }));
    const dummy = { ...environment, TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA' };
    expect(await subscribe(validInput(), dummy, context, fetcher)).toEqual({ ok: true });
  });

  it('proves the challenge but stays unavailable until GetResponse is configured', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(passed());
    const turnstileOnly = { TURNSTILE_SECRET_KEY: 'live-secret' };
    expect(await subscribe(validInput(), turnstileOnly, context, fetcher)).toEqual({ ok: false, code: 'not_configured' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('treats an address already on the list as success', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(passed())
      .mockResolvedValueOnce(new Response(JSON.stringify({ httpStatus: 409, code: 1008 }), { status: 409 }));
    expect(await subscribe(validInput(), environment, context, fetcher)).toEqual({ ok: true });
  });

  it.each([
    ['another conflict', new Response(JSON.stringify({ httpStatus: 409, code: 1000 }), { status: 409 })],
    ['a validation error', new Response('{}', { status: 400 })],
    ['a rejected API key', new Response('{}', { status: 401 })],
    ['throttling', new Response('{}', { status: 429 })],
    ['a server error', new Response(null, { status: 500 })],
  ])('maps %s to provider_error', async (_, providerResponse) => {
    const fetcher = vi.fn().mockResolvedValueOnce(passed()).mockResolvedValueOnce(providerResponse);
    expect(await subscribe(validInput(), environment, context, fetcher)).toEqual({ ok: false, code: 'provider_error' });
  });

  it('maps a provider timeout to timeout', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(passed())
      .mockRejectedValueOnce(new DOMException('Timed out', 'TimeoutError'));
    expect(await subscribe(validInput(), environment, context, fetcher)).toEqual({ ok: false, code: 'timeout' });
  });
});
