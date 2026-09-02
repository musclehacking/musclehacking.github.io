export type BoundedFormDataResult =
  | { ok: true; form: FormData }
  | { ok: false; code: 'request_too_large' | 'malformed_form' };

export async function readBoundedFormData(request: Request, maximumBytes: number): Promise<BoundedFormDataResult> {
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    return { ok: false, code: 'request_too_large' };
  }

  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, code: 'request_too_large' };
      }
      chunks.push(value);
    }
  }

  const boundedBody = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    boundedBody.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const contentType = request.headers.get('content-type');
  try {
    const form = await new Response(boundedBody, {
      headers: contentType ? { 'content-type': contentType } : undefined,
    }).formData();
    return { ok: true, form };
  } catch {
    return { ok: false, code: 'malformed_form' };
  }
}
