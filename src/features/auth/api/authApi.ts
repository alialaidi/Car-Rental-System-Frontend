import type { HttpRequestOptions } from '../../../shared/api/httpClient';
import { httpClient } from '../../../shared/api/httpClient';
import { ApiError } from '../../../shared/api/apiError';
import type { AuthTokens, LoginRequest, RegisterRequest } from '../model/session';

interface AuthResultDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
}

export interface AuthHttpClient {
  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
}

export interface AuthApi {
  register(request: RegisterRequest): Promise<AuthTokens>;
  login(request: LoginRequest): Promise<AuthTokens>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  logout(refreshToken: string): Promise<void>;
}

function mapAuthResult(result: AuthResultDto): AuthTokens {
  const accessTokenExpiresAtUtc = new Date(result.accessTokenExpiresAtUtc);
  if (
    !result.accessToken ||
    !result.refreshToken ||
    Number.isNaN(accessTokenExpiresAtUtc.getTime())
  ) {
    throw new ApiError({
      kind: 'parse',
      title: 'Invalid authentication response',
      detail: 'The server returned an incomplete sign-in response.',
    });
  }
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    accessTokenExpiresAtUtc,
  };
}

export function createAuthApi(client: AuthHttpClient = httpClient): AuthApi {
  const options: HttpRequestOptions = { skipUnauthorizedHandler: true };
  return {
    async register(request) {
      const result = await client.post<AuthResultDto>('/api/auth/register', request, options);
      return mapAuthResult(result);
    },
    async login(request) {
      const result = await client.post<AuthResultDto>('/api/auth/login', request, options);
      return mapAuthResult(result);
    },
    async refresh(refreshToken) {
      const result = await client.post<AuthResultDto>(
        '/api/auth/refresh',
        { refreshToken },
        options,
      );
      return mapAuthResult(result);
    },
    logout(refreshToken) {
      return client.post<void>('/api/auth/logout', { refreshToken }, options);
    },
  };
}

export const authApi = createAuthApi();
