import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AuthApi } from '../api/authApi';
import { ApiError } from '../../../shared/api/apiError';
import { AuthProvider } from '../AuthProvider';
import type { AuthTokens } from '../model/session';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

function accessToken(): string {
  const payload = btoa(
    JSON.stringify({ sub: '5', unique_name: 'driver', role: 'Customer' }),
  ).replace(/=/g, '');
  return 'eyJhbGciOiJub25lIn0.' + payload + '.unsigned';
}

function tokens(): AuthTokens {
  return {
    accessToken: accessToken(),
    refreshToken: 'refresh',
    accessTokenExpiresAtUtc: new Date('2030-01-01T00:00:00Z'),
  };
}

function api(overrides: Partial<AuthApi> = {}): AuthApi {
  return {
    login: vi.fn(async () => tokens()),
    register: vi.fn(async () => tokens()),
    refresh: vi.fn(async () => {
      throw new Error('No refresh expected.');
    }),
    logout: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe('authentication forms', () => {
  it('submits login credentials and announces a generic credential error', async () => {
    const user = userEvent.setup();
    const success = vi.fn();
    const authApi = api();
    const { rerender } = render(
      <AuthProvider api={authApi}>
        <LoginForm onSuccess={success} />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText('Username or email'), 'driver@example.test');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.keyboard('{Tab}');
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(authApi.login).toHaveBeenCalledWith({
        usernameOrEmail: 'driver@example.test',
        password: 'secret123',
      }),
    );
    expect(success).toHaveBeenCalledOnce();

    const failedApi = api({
      login: vi.fn(async () => {
        throw new Error('Invalid username or password.');
      }),
    });
    rerender(
      <AuthProvider api={failedApi}>
        <LoginForm />
      </AuthProvider>,
    );
    await user.clear(screen.getByLabelText('Username or email'));
    await user.type(screen.getByLabelText('Username or email'), 'unknown');
    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong.');
  });

  it('requires registration fields and submits the backend DTO names', async () => {
    const user = userEvent.setup();
    const authApi = api();
    render(
      <AuthProvider api={authApi}>
        <RegisterForm />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(authApi.register).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Username'), 'new-driver');
    await user.type(screen.getByLabelText('Email'), 'new@example.test');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Full name'), 'New Driver');
    await user.type(screen.getByLabelText('Driving license number'), 'DL-123');
    fireEvent.change(screen.getByLabelText('Driving license expiry'), {
      target: { value: '2030-05-16' },
    });
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(authApi.register).toHaveBeenCalledOnce());
    expect(authApi.register).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'new-driver',
        email: 'new@example.test',
        fullName: 'New Driver',
        drivingLicenseNumber: 'DL-123',
        drivingLicenseExpiry: '2030-05-16T00:00:00.000Z',
      }),
    );
  });

  it('shows server duplicate-field validation on the matching registration field', async () => {
    const user = userEvent.setup();
    const authApi = api({
      register: vi.fn(async () => {
        throw new ApiError({
          kind: 'http',
          status: 409,
          title: 'Conflict',
          errors: { Email: ['Email already exists.'] },
        });
      }),
    });
    render(
      <AuthProvider api={authApi}>
        <RegisterForm />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText('Username'), 'driver');
    await user.type(screen.getByLabelText('Email'), 'used@example.test');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Full name'), 'Driver');
    await user.type(screen.getByLabelText('Driving license number'), 'DL-1');
    fireEvent.change(screen.getByLabelText('Driving license expiry'), {
      target: { value: '2030-05-16' },
    });
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Email already exists.')).toBeInTheDocument();
  });
});
