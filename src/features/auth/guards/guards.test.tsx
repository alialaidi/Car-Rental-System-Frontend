import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { AuthApi } from '../api/authApi';
import { AuthProvider } from '../AuthProvider';
import { RequireAuth } from './RequireAuth';
import { RequireRole } from './RequireRole';
import { ForbiddenPage } from '../../../app/RoutePages';
import type { AuthTokens } from '../model/session';
import { clearTokens, storeTokens } from '../tokenStore';

function accessToken(role: string): string {
  const payload = btoa(JSON.stringify({ sub: '17', unique_name: 'viewer', role })).replace(
    /=/g,
    '',
  );
  return 'eyJhbGciOiJub25lIn0.' + payload + '.unsigned';
}

function apiWith(refresh: () => Promise<AuthTokens>): AuthApi {
  return {
    login: async () => {
      throw new Error('Unexpected login.');
    },
    register: async () => {
      throw new Error('Unexpected register.');
    },
    refresh,
    logout: async () => undefined,
  };
}

afterEach(() => {
  clearTokens();
  sessionStorage.clear();
});

describe('auth route guards', () => {
  it('redirects anonymous users to login and hides protected content', async () => {
    const api = apiWith(async () => {
      throw new Error('No stored session.');
    });
    render(
      <AuthProvider api={api}>
        <MemoryRouter initialEntries={['/private']}>
          <Routes>
            <Route element={<RequireAuth />} path="/private">
              <Route element={<p>Private rental details</p>} index />
            </Route>
            <Route element={<p>Sign in screen</p>} path="/login" />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByText('Sign in screen')).toBeInTheDocument();
    expect(screen.queryByText('Private rental details')).not.toBeInTheDocument();
  });

  it('renders content only when the decoded session has an allowed role', async () => {
    storeTokens('expired', 'refresh');
    const api = apiWith(async () => ({
      accessToken: accessToken('Customer'),
      refreshToken: 'rotated',
      accessTokenExpiresAtUtc: new Date('2030-01-01T00:00:00Z'),
    }));
    render(
      <AuthProvider api={api}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<RequireRole roles={['Admin']} />} path="/admin">
              <Route element={<p>Admin controls</p>} index />
            </Route>
            <Route element={<ForbiddenPage />} path="/403" />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
    expect(screen.queryByText('Admin controls')).not.toBeInTheDocument();
  });
});
