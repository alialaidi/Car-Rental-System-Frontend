import { describe, expect, it, vi } from 'vitest';
import { createAuthApi } from './authApi';
import type { AuthHttpClient } from './authApi';
import type { HttpRequestOptions } from '../../../shared/api/httpClient';

describe('authApi', () => {
  it('calls the planned endpoints with wire request shapes and maps expiry dates', async () => {
    const dto = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      accessTokenExpiresAtUtc: '2026-11-12T13:14:15Z',
    };
    const calls: Array<{ path: string; body?: unknown; options?: HttpRequestOptions }> = [];
    const post = vi.fn(
      async <T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> => {
        calls.push({ path, body, options });
        return (path.endsWith('/logout') ? undefined : dto) as T;
      },
    );
    const api = createAuthApi({ post } as AuthHttpClient);

    const request = { usernameOrEmail: 'driver', password: 'passphrase1' };
    const login = await api.login(request);
    const registration = {
      username: 'driver',
      email: 'driver@example.test',
      password: 'passphrase1',
      fullName: 'A Driver',
      drivingLicenseNumber: 'DL-1',
      drivingLicenseExpiry: '2030-12-31',
    };
    await api.register(registration);
    await api.refresh('old-refresh-token');
    await api.logout('new-refresh-token');

    expect(login.accessTokenExpiresAtUtc).toEqual(new Date(dto.accessTokenExpiresAtUtc));
    expect(calls.map(({ path }) => path)).toEqual([
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/auth/logout',
    ]);
    expect(calls[0]?.body).toEqual(request);
    expect(calls[1]?.body).toEqual(registration);
    expect(calls[2]?.body).toEqual({ refreshToken: 'old-refresh-token' });
    expect(calls[3]?.body).toEqual({ refreshToken: 'new-refresh-token' });
    expect(calls.every(({ options }) => options?.skipUnauthorizedHandler)).toBe(true);
  });

  it('rejects incomplete or invalid token responses', async () => {
    const client = {
      post: async <T>() =>
        ({
          accessToken: '',
          refreshToken: 'refresh-token',
          accessTokenExpiresAtUtc: 'not-a-date',
        }) as T,
    };
    const api = createAuthApi(client);
    await expect(
      api.login({ usernameOrEmail: 'driver', password: 'secret' }),
    ).rejects.toMatchObject({ kind: 'parse' });
  });
});
