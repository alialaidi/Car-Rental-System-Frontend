import { useId, type ReactNode } from 'react';
import { isApiError, toUserMessage } from '../api/apiError';
import type { ApiError } from '../api/apiError';
import styles from './ui.module.css';

export interface ErrorStateProps {
  error: ApiError | unknown;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({ error, onRetry, action, className = '' }: ErrorStateProps) {
  const titleId = useId();
  const title = isApiError(error) ? error.title : 'Something went wrong';
  const detail = isApiError(error) ? error.detail : toUserMessage(error);
  const traceId = isApiError(error) ? error.traceId : undefined;

  return (
    <section
      aria-labelledby={titleId}
      className={[styles.state, styles.errorState, className].filter(Boolean).join(' ')}
      role="alert"
    >
      <h2 className={styles.stateTitle} id={titleId}>
        {title}
      </h2>
      {detail ? <p className={styles.stateDescription}>{detail}</p> : null}
      {traceId ? <p className={styles.traceId}>Reference: {traceId}</p> : null}
      {onRetry ? (
        <button className={styles.inlineButton} onClick={onRetry} type="button">
          Try again
        </button>
      ) : null}
      {action}
    </section>
  );
}
