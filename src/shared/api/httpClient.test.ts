import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, isApiError, toUserMessage } from './apiError';
import { setTokenProvider, setUnauthorizedHandler } from './authBridge';
import { buildQueryString, httpClient } from './httpClient';

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', 'application/problem+json');
  return new Response(JSON.stringify(body), { status, headers: responseHeaders });
}

describe('httpClient', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
    vi.stubGlobal('fetch', vi.fn());
    setTokenProvider(() => null);
    setUnauthorizedHandler(async () => false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    setTokenProvider(() => null);
    setUnauthorizedHandler(async () => false);
  });

  it('sends credentials without cookies and adds bearer auth only when available', async () => {
    let token: string | null = 'token-123';
    setTokenProvider(() => token);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ id: 4 }));
    await expect(httpClient.get<{ id: number }>('/vehicles')).resolves.toEqual({ id: 4 });

    const [, request] = vi.mocked(fetch).mock.calls[0]!;
    expect(request?.credentials).toBe('omit');
    expect(new Headers(request?.headers).get('Authorization')).toBe('Bearer token-123');

    token = null;
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));
    await httpClient.get('/vehicles', { headers: { Authorization: 'Bearer stale' } });
    const [, secondRequest] = vi.mocked(fetch).mock.calls[1]!;
    expect(new Headers(secondRequest?.headers).has('Authorization')).toBe(false);
  });

  it('maps ProblemDetails, validation errors and trace ID', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          title: 'Validation failed',
          detail: 'Some fields need attention.',
          traceId: 'trace-42',
          errors: { Email: ['Email is invalid.'] },
        },
        422,
      ),
    );
    const error = await httpClient.post('/register', {}).catch((reason: unknown) => reason);
    expect(error).toMatchObject({
      kind: 'http',
      status: 422,
      title: 'Validation failed',
      traceId: 'trace-42',
      errors: { Email: ['Email is invalid.'] },
    });
  });

  it('maps a non-JSON error body without exposing it as the message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('<html>failed</html>', { status: 500 }));
    const error = await httpClient.get('/vehicles').catch((reason: unknown) => reason);
    expect(error).toMatchObject({ kind: 'http', status: 500, title: 'Request failed' });
    expect((error as Error).message).toBe('Request failed');
  });

  it('maps fetch failures to a network ApiError', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('socket unavailable'));
    const error = await httpClient.get('/vehicles').catch((reason: unknown) => reason);
    expect(error).toMatchObject({ kind: 'network' });
  });

  it('calls the unauthorized handler once and retries once after success', async () => {
    let token: string | null = 'expired';
    setTokenProvider(() => token);
    const handler = vi.fn(async () => {
      token = 'renewed';
      return true;
    });
    setUnauthorizedHandler(handler);
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ title: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    await expect(httpClient.get('/private')).resolves.toEqual({ ok: true });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    const [, retryRequest] = vi.mocked(fetch).mock.calls[1]!;
    expect(new Headers(retryRequest?.headers).get('Authorization')).toBe('Bearer renewed');
  });

  it('does not retry if the unauthorized handler fails', async () => {
    const handler = vi.fn(async () => false);
    setUnauthorizedHandler(handler);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ title: 'Unauthorized' }, 401));

    const error = await httpClient.get('/private').catch((reason: unknown) => reason);
    expect(error).toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('preserves Retry-After for 429 errors and returns a safe message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ title: 'Rate limited' }, 429, { 'Retry-After': '10' }),
    );
    const error = await httpClient.get('/vehicles').catch((reason: unknown) => reason);
    expect(isApiError(error)).toBe(true);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).retryAfter).toBe('10');
    expect(toUserMessage(error)).toMatch(/too many requests/i);
  });

  it('can disable unauthorized handling for auth endpoints', async () => {
    const handler = vi.fn(async () => true);
    setUnauthorizedHandler(handler);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ title: 'Unauthorized' }, 401));

    await expect(
      httpClient.post('/api/auth/login', {}, { skipUnauthorizedHandler: true }),
    ).rejects.toMatchObject({ status: 401 });
    expect(handler).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledOnce();
  });
  it('serializes dates and skips nullish query values', () => {
    expect(
      buildQueryString({
        page: 2,
        active: false,
        start: new Date('2026-01-02T03:04:05.000Z'),
        ignored: null,
        absent: undefined,
      }),
    ).toBe('page=2&active=false&start=2026-01-02T03%3A04%3A05.000Z');
  });

  it('surfaces a parse error for invalid successful JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{broken', { status: 200 }));
    const error = await httpClient.get('/vehicles').catch((reason: unknown) => reason);
    expect(error).toMatchObject({ kind: 'parse', status: 200 });
  });
});
