import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AuthApi } from './api/authApi';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';
import type { AuthTokens } from './model/session';
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from './tokenStore';

function makeJwt(role = 'Customer'): string {
  const bytes = new TextEncoder().encode(
    JSON.stringify({ sub: 'user-22', unique_name: 'renter', role, exp: 1900000000 }),
  );
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const payload = btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return 'eyJhbGciOiJub25lIn0.' + payload + '.unsigned';
}

function tokens(role = 'Customer', refreshToken = 'rotated-refresh'): AuthTokens {
  return {
    accessToken: makeJwt(role),
    refreshToken,
    accessTokenExpiresAtUtc: new Date('2030-01-01T00:00:00Z'),
  };
}

function fakeApi(overrides: Partial<AuthApi> = {}): AuthApi {
  return {
    register: vi.fn(async () => tokens()),
    login: vi.fn(async () => tokens()),
    refresh: vi.fn(async () => {
      throw new Error('No refresh token expected.');
    }),
    logout: vi.fn(async () => undefined),
    ...overrides,
  };
}

function AuthProbe() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{auth.status}</span>
      <span data-testid="auth-user">{auth.user?.username ?? 'signed-out'}</span>
      <span data-testid="auth-roles">{auth.roles.join(',')}</span>
      <button onClick={() => void auth.login({ usernameOrEmail: 'renter', password: 'valid123' })}>
        Sign in probe
      </button>
      <button onClick={() => void Promise.all([auth.refreshSession(), auth.refreshSession()])}>
        Refresh twice
      </button>
      <button onClick={() => void auth.logout()}>Sign out probe</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    clearTokens();
    sessionStorage.clear();
  });

  afterEach(() => {
    clearTokens();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('establishes the user on login and revokes/clears tokens on logout', async () => {
    const user = userEvent.setup();
    const api = fakeApi();
    render(
      <AuthProvider api={api}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous'));
    await user.click(screen.getByRole('button', { name: 'Sign in probe' }));
    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'),
    );
    expect(screen.getByTestId('auth-user')).toHaveTextContent('renter');
    expect(screen.getByTestId('auth-roles')).toHaveTextContent('Customer');
    expect(getAccessToken()).toBe(tokens().accessToken);
    expect(getRefreshToken()).toBe('rotated-refresh');

    await user.click(screen.getByRole('button', { name: 'Sign out probe' }));
    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous'));
    expect(api.logout).toHaveBeenCalledWith('rotated-refresh');
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('shares one refresh operation across parallel 401 callbacks', async () => {
    let completeRefresh: ((value: AuthTokens) => void) | undefined;
    const pending = new Promise<AuthTokens>((resolve) => {
      completeRefresh = resolve;
    });
    const api = fakeApi({ refresh: vi.fn(() => pending) });
    storeTokens('old-access', 'stored-refresh');

    const user = userEvent.setup();
    render(
      <AuthProvider api={api}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(api.refresh).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole('button', { name: 'Refresh twice' }));
    expect(api.refresh).toHaveBeenCalledTimes(1);

    completeRefresh?.(tokens('Employee', 'new-refresh'));
    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'),
    );
    expect(screen.getByTestId('auth-roles')).toHaveTextContent('Employee');
    expect(getRefreshToken()).toBe('new-refresh');
  });

  it('clears stored tokens when startup refresh fails', async () => {
    storeTokens('expired-access', 'expired-refresh');
    const api = fakeApi({ refresh: vi.fn(async () => Promise.reject(new Error('expired'))) });
    render(
      <AuthProvider api={api}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('anonymous'));
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
