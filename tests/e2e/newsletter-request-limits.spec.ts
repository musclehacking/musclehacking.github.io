import { request as sendHttpRequest } from 'node:http';
import { expect, test } from '@playwright/test';

test('newsletter rejects an oversized chunked request before form validation', async () => {
  const requestBody = new URLSearchParams({ company: 'x'.repeat(8_192) }).toString();
  const response = await new Promise<{ status: number | undefined; body: string }>((resolve, reject) => {
    const request = sendHttpRequest('http://127.0.0.1:8787/api/subscribe', {
      method: 'POST',
      headers: {
        origin: 'http://127.0.0.1:8787',
        'content-type': 'application/x-www-form-urlencoded',
        'transfer-encoding': 'chunked',
      },
    }, (incomingResponse) => {
      incomingResponse.setEncoding('utf8');
      let responseBody = '';
      incomingResponse.on('data', (chunk: string) => {
        responseBody += chunk;
      });
      incomingResponse.on('end', () => resolve({ status: incomingResponse.statusCode, body: responseBody }));
    });

    request.on('error', reject);
    request.write(requestBody.slice(0, 4_096));
    request.end(requestBody.slice(4_096));
  });

  expect(response.status).toBe(413);
  expect(JSON.parse(response.body)).toEqual({ error: 'request_too_large' });
});
