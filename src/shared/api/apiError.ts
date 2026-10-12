export type ApiErrorKind = 'http' | 'network' | 'parse';

export interface ApiErrorDetails {
  kind: ApiErrorKind;
  status?: number;
  title: string;
  detail?: string;
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
  retryAfter?: string;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly title: string;
  readonly detail?: string;
  readonly code?: string;
  readonly traceId?: string;
  readonly errors?: Record<string, string[]>;
  readonly retryAfter?: string;

  constructor(details: ApiErrorDetails) {
    super(details.detail || details.title);
    this.name = 'ApiError';
    this.kind = details.kind;
    this.status = details.status;
    this.title = details.title;
    this.detail = details.detail;
    this.code = details.code;
    this.traceId = details.traceId;
    this.errors = details.errors;
    this.retryAfter = details.retryAfter;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function toUserMessage(error: unknown): string {
  if (!isApiError(error)) return 'Something went wrong. Please try again.';
  if (error.kind === 'network') return 'Unable to connect. Check your connection and try again.';
  if (error.kind === 'parse') return 'The server response could not be read. Please try again.';

  switch (error.status) {
    case 400:
    case 422:
      return 'Check the submitted information and try again.';
    case 401:
      return 'Your session may have expired. Sign in again to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested information could not be found.';
    case 409:
      return 'This action conflicts with the current information. Refresh and try again.';
    case 429:
      return 'Too many requests. Wait a moment and try again.';
    default:
      return 'The request could not be completed. Please try again.';
  }
}
