import { describe, expect, it } from 'vitest';
import { readBoundedFormData } from '../../src/features/newsletter/request-body';

const MAXIMUM_REQUEST_BYTES = 8_192;
const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';

describe('newsletter request body', () => {
  it.each([
    ['missing', {}],
    ['misleading', { 'content-length': '1' }],
  ])('rejects an oversized body with a %s Content-Length header', async (_name, lengthHeader) => {
    const request = new Request('https://www.musclehacking.com/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': FORM_CONTENT_TYPE, ...lengthHeader },
      body: new URLSearchParams({ company: 'x'.repeat(MAXIMUM_REQUEST_BYTES) }),
    });

    await expect(readBoundedFormData(request, MAXIMUM_REQUEST_BYTES)).resolves.toEqual({
      ok: false,
      code: 'request_too_large',
    });
  });

  it('parses a body at the byte limit', async () => {
    const body = `company=${'x'.repeat(MAXIMUM_REQUEST_BYTES - 'company='.length)}`;
    const request = new Request('https://www.musclehacking.com/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': FORM_CONTENT_TYPE },
      body,
    });

    const result = await readBoundedFormData(request, MAXIMUM_REQUEST_BYTES);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.form.get('company')).toBe('x'.repeat(MAXIMUM_REQUEST_BYTES - 'company='.length));
  });

  it('maps malformed multipart input to a safe result', async () => {
    const request = new Request('https://www.musclehacking.com/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=broken' },
      body: 'this body has no multipart boundary',
    });

    await expect(readBoundedFormData(request, MAXIMUM_REQUEST_BYTES)).resolves.toEqual({
      ok: false,
      code: 'malformed_form',
    });
  });
});
