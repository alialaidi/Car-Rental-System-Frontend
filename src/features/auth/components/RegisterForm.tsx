import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, TextField } from '../../../shared/ui';
import { isApiError, toUserMessage } from '../../../shared/api/apiError';
import type { RegisterRequest } from '../model/session';
import { useAuth } from '../useAuth';
import styles from './auth.module.css';

type RegisterValues = Omit<RegisterRequest, 'drivingLicenseExpiry'> & {
  drivingLicenseExpiry: string;
};

const INITIAL_VALUES: RegisterValues = {
  username: '',
  email: '',
  password: '',
  phoneNumber: '',
  fullName: '',
  drivingLicenseNumber: '',
  drivingLicenseExpiry: '',
  address: '',
};

function fieldMessage(error: unknown, field: string): string | undefined {
  if (!isApiError(error) || !error.errors) return undefined;
  const normalizedField = field.toLowerCase();
  const match = Object.entries(error.errors).find(
    ([key]) => key.toLowerCase().replace(/[^a-z]/g, '') === normalizedField.replace(/[^a-z]/g, ''),
  );
  return match?.[1][0];
}

export interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register } = useAuth();
  const [values, setValues] = useState<RegisterValues>(INITIAL_VALUES);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  function update<K extends keyof RegisterValues>(key: K, value: RegisterValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const request: RegisterRequest = {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
        drivingLicenseNumber: values.drivingLicenseNumber.trim(),
        drivingLicenseExpiry: new Date(
          values.drivingLicenseExpiry + 'T00:00:00.000Z',
        ).toISOString(),
        ...(values.phoneNumber?.trim() ? { phoneNumber: values.phoneNumber.trim() } : {}),
        ...(values.address?.trim() ? { address: values.address.trim() } : {}),
      };
      await register(request);
      onSuccess?.();
    } catch (reason) {
      setError(reason);
    } finally {
      setPending(false);
    }
  }

  const usernameError = fieldMessage(error, 'username');
  const emailError = fieldMessage(error, 'email');
  const fullNameError = fieldMessage(error, 'fullName');
  const licenseError = fieldMessage(error, 'drivingLicenseNumber');
  const expiryError = fieldMessage(error, 'drivingLicenseExpiry');
  const passwordError = fieldMessage(error, 'password');

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error ? (
        <div ref={errorRef} tabIndex={-1}>
          <Alert title="Unable to create account" variant="error">
            {toUserMessage(error)}
          </Alert>
        </div>
      ) : null}
      <TextField
        autoComplete="username"
        error={usernameError}
        id="register-username"
        label="Username"
        maxLength={50}
        onChange={(event) => update('username', event.currentTarget.value)}
        required
        value={values.username}
      />
      <TextField
        autoComplete="email"
        error={emailError}
        id="register-email"
        label="Email"
        onChange={(event) => update('email', event.currentTarget.value)}
        required
        type="email"
        value={values.email}
      />
      <TextField
        autoComplete="new-password"
        error={passwordError}
        id="register-password"
        label="Password"
        minLength={8}
        onChange={(event) => update('password', event.currentTarget.value)}
        required
        type="password"
        value={values.password}
      />
      <TextField
        autoComplete="name"
        error={fullNameError}
        id="register-full-name"
        label="Full name"
        onChange={(event) => update('fullName', event.currentTarget.value)}
        required
        value={values.fullName}
      />
      <TextField
        error={licenseError}
        id="register-license"
        label="Driving license number"
        onChange={(event) => update('drivingLicenseNumber', event.currentTarget.value)}
        required
        value={values.drivingLicenseNumber}
      />
      <TextField
        error={expiryError}
        id="register-license-expiry"
        label="Driving license expiry"
        onChange={(event) => update('drivingLicenseExpiry', event.currentTarget.value)}
        required
        type="date"
        value={values.drivingLicenseExpiry}
      />
      <TextField
        autoComplete="tel"
        id="register-phone"
        label="Phone number (optional)"
        onChange={(event) => update('phoneNumber', event.currentTarget.value)}
        type="tel"
        value={values.phoneNumber}
      />
      <TextField
        autoComplete="street-address"
        id="register-address"
        label="Address (optional)"
        onChange={(event) => update('address', event.currentTarget.value)}
        value={values.address}
      />
      <Button className={styles.submit} disabled={pending} type="submit">
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
      {pending ? (
        <p aria-live="polite" className={styles.pending}>
          Creating your account…
        </p>
      ) : null}
    </form>
  );
}
