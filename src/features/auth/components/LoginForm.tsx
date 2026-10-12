import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, TextField } from '../../../shared/ui';
import { isApiError, toUserMessage } from '../../../shared/api/apiError';
import { useAuth } from '../useAuth';
import styles from './auth.module.css';

function retryDelaySeconds(retryAfter?: string): number {
  if (!retryAfter) return 15;
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds > 0) return Math.min(Math.ceil(seconds), 60);
  const timestamp = Date.parse(retryAfter);
  return Number.isNaN(timestamp)
    ? 15
    : Math.max(1, Math.min(60, Math.ceil((timestamp - Date.now()) / 1000)));
}

export interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!error) return;
    errorRef.current?.focus();
  }, [error]);

  useEffect(() => {
    if (retrySeconds <= 0) return undefined;
    const timer = window.setTimeout(
      () => setRetrySeconds((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [retrySeconds]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await login({ usernameOrEmail: usernameOrEmail.trim(), password });
      onSuccess?.();
    } catch (reason) {
      setError(reason);
      if (isApiError(reason) && reason.status === 429) {
        setRetrySeconds(retryDelaySeconds(reason.retryAfter));
      }
    } finally {
      setPending(false);
    }
  }

  const rateLimited = isApiError(error) && error.status === 429;
  const disabled = pending || retrySeconds > 0;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error ? (
        <div ref={errorRef} tabIndex={-1}>
          <Alert title={rateLimited ? 'Too many attempts' : 'Unable to sign in'} variant="error">
            {rateLimited && retrySeconds > 0
              ? 'Please try again in ' + retrySeconds + ' seconds.'
              : toUserMessage(error)}
          </Alert>
        </div>
      ) : null}
      <TextField
        autoComplete="username"
        id="login-username"
        label="Username or email"
        onChange={(event) => setUsernameOrEmail(event.currentTarget.value)}
        required
        value={usernameOrEmail}
      />
      <TextField
        autoComplete="current-password"
        id="login-password"
        label="Password"
        onChange={(event) => setPassword(event.currentTarget.value)}
        required
        type="password"
        value={password}
      />
      <Button className={styles.submit} disabled={disabled} type="submit">
        {pending
          ? 'Signing in…'
          : retrySeconds > 0
            ? 'Try again in ' + retrySeconds + 's'
            : 'Sign in'}
      </Button>
      {pending ? (
        <p aria-live="polite" className={styles.pending}>
          Signing in…
        </p>
      ) : null}
    </form>
  );
}
