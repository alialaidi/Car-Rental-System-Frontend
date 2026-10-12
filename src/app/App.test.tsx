import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { PublicLayout } from './layouts/PublicLayout';
import { AuthProvider } from '../features/auth/AuthProvider';
import type { AuthApi } from '../features/auth/api/authApi';

const api: AuthApi = {
  login: async () => {
    throw new Error('Unexpected login.');
  },
  register: async () => {
    throw new Error('Unexpected register.');
  },
  refresh: async () => {
    throw new Error('No stored session.');
  },
  logout: async () => undefined,
};

describe('App', () => {
  it('renders the public sign-in page', async () => {
    render(
      <AuthProvider api={api}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route element={<LoginPage />} path="/login" />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });
});
