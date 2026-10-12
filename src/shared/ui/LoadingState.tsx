import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface LoadingStateProps {
  label?: string;
  action?: ReactNode;
  className?: string;
}

export function LoadingState({ label = 'Loading…', action, className = '' }: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={[styles.state, className].filter(Boolean).join(' ')}
      role="status"
    >
      <span aria-hidden="true" className={styles.spinner} />
      <span>{label}</span>
      {action}
    </div>
  );
}
