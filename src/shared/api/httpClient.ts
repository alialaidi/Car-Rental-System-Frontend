import { env } from '../config/env';
import { ApiError } from './apiError';
import { getAccessToken, handleUnauthorized } from './authBridge';
import type { QueryParameters } from './paging';

export interface HttpRequestOptions {
  query?: QueryParameters;
  headers?: HeadersInit;
  signal?: AbortSignal;
  skipUnauthorizedHandler?: boolean;
}

function buildUrl(path: string, query?: QueryParameters): string {
  const url = new URL(path.replace(/^\/+/, ''), env.apiBaseUrl + '/');
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined) continue;
      url.searchParams.set(key, value instanceof Date ? value.toISOString() : String(value));
    }
  }
  return url.toString();
}

export function buildQueryString(query: QueryParameters): string {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    parameters.set(key, value instanceof Date ? value.toISOString() : String(value));
  }
  return parameters.toString();
}

function validationErrors(value: unknown): Record<string, string[]> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;

  const result: Record<string, string[]> = {};
  for (const [key, messages] of Object.entries(value)) {
    if (typeof messages === 'string') result[key] = [messages];
    else if (Array.isArray(messages) && messages.every((message) => typeof message === 'string')) {
      result[key] = messages;
    }
  }
  return Object.keys(result).length ? result : undefined;
}
function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function stringProperty(
  record: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = record?.[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function problemError(response: Response, body: unknown): ApiError {
  const problem = asRecord(body);
  const extensions = asRecord(problem?.extensions);
  return new ApiError({
    kind: 'http',
    status: response.status,
    title: stringProperty(problem, 'title') || response.statusText || 'Request failed',
    detail: stringProperty(problem, 'detail'),
    code: stringProperty(problem, 'code') || stringProperty(extensions, 'code'),
    traceId: stringProperty(problem, 'traceId') || stringProperty(extensions, 'traceId'),
    errors: validationErrors(problem?.errors),
    retryAfter: response.headers.get('Retry-After') || undefined,
  });
}

async function readErrorBody(response: Response): Promise<unknown> {
  try {
    const text = await response.text();
    return text ? (JSON.parse(text) as unknown) : undefined;
  } catch {
    return undefined;
  }
}

async function readSuccessBody<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 205) return undefined as T;
  try {
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  } catch {
    throw new ApiError({
      kind: 'parse',
      status: response.status,
      title: 'Invalid server response',
      detail: 'The successful response was not valid JSON.',
    });
  }
}

async function send<T>(
  path: string,
  method: string,
  body: unknown,
  options: HttpRequestOptions,
  isRetry: boolean,
): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(options.headers);
  headers.delete('Authorization');
  headers.set('Accept', 'application/json');
  const requestBody = body === undefined ? undefined : JSON.stringify(body);
  if (requestBody !== undefined) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', 'Bearer ' + token);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: requestBody,
      credentials: 'omit',
      signal: options.signal,
    });
  } catch {
    throw new ApiError({
      kind: 'network',
      title: 'Network error',
      detail: 'The request could not reach the server.',
    });
  }

  if (
    response.status === 401 &&
    !isRetry &&
    !options.skipUnauthorizedHandler &&
    (await handleUnauthorized())
  ) {
    return send<T>(path, method, body, options, true);
  }
  if (!response.ok) throw problemError(response, await readErrorBody(response));
  return readSuccessBody<T>(response);
}

export const httpClient = Object.freeze({
  get<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    return send<T>(path, 'GET', undefined, options, false);
  },
  post<T>(path: string, body?: unknown, options: HttpRequestOptions = {}): Promise<T> {
    return send<T>(path, 'POST', body, options, false);
  },
  put<T>(path: string, body?: unknown, options: HttpRequestOptions = {}): Promise<T> {
    return send<T>(path, 'PUT', body, options, false);
  },
  delete<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    return send<T>(path, 'DELETE', undefined, options, false);
  },
});
