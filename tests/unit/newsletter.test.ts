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
  form.set('g-recaptcha-response', 'challenge');
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

describe('newsletter provider', () => {
  it('fails closed before network access when a browser-shaped form has no challenge token', async () => {
    const form = validForm();
    form.delete('g-recaptcha-response');
    const validation = validateSubscriptionForm(form);
    if (!validation.ok) throw new Error(`Expected valid browser form, received ${validation.code}`);

    const fetcher = vi.fn();
    const result = await subscribe(validation.value, {
      NEWSLETTER_PROVIDER_URL: 'https://provider.example/subscribers',
      NEWSLETTER_PROVIDER_TOKEN: 'test-token',
      NEWSLETTER_AUDIENCE_ID: 'test-audience',
      RECAPTCHA_SECRET: 'test-secret',
    }, fetcher);

    expect(result).toEqual({ ok: false, code: 'challenge_failed' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('fails closed when the recovered provider contract is unavailable', async () => {
    const fetcher = vi.fn();
    const result = await subscribe(validInput(), {}, fetcher);
    expect(result).toEqual({ ok: false, code: 'not_configured' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('verifies the challenge before calling the provider', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }));
    const result = await subscribe(
      validInput(),
      {
        NEWSLETTER_PROVIDER_URL: 'https://provider.example/subscribers',
        NEWSLETTER_PROVIDER_TOKEN: 'test-token',
        NEWSLETTER_AUDIENCE_ID: 'test-audience',
        RECAPTCHA_SECRET: 'test-secret',
      },
      fetcher,
    );
    expect(result).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('stops before the provider when the challenge fails', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 200 }));
    const result = await subscribe(validInput(), {
      NEWSLETTER_PROVIDER_URL: 'https://provider.example/subscribers',
      NEWSLETTER_PROVIDER_TOKEN: 'test-token',
      NEWSLETTER_AUDIENCE_ID: 'test-audience',
      RECAPTCHA_SECRET: 'test-secret',
    }, fetcher);
    expect(result).toEqual({ ok: false, code: 'challenge_failed' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('maps provider failures and timeouts to stable result codes', async () => {
    const environment = {
      NEWSLETTER_PROVIDER_URL: 'https://provider.example/subscribers',
      NEWSLETTER_PROVIDER_TOKEN: 'test-token',
      NEWSLETTER_AUDIENCE_ID: 'test-audience',
      RECAPTCHA_SECRET: 'test-secret',
    };
    const providerFailure = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 500 }));
    expect(await subscribe(validInput(), environment, providerFailure)).toEqual({ ok: false, code: 'provider_error' });

    const timeout = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockRejectedValueOnce(new DOMException('Timed out', 'TimeoutError'));
    expect(await subscribe(validInput(), environment, timeout)).toEqual({ ok: false, code: 'timeout' });
  });
});
