import type { ReactNode } from 'react';
import styles from './ui.module.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  title?: string;
  className?: string;
}

export function Alert({ children, variant = 'info', title, className = '' }: AlertProps) {
  const role = variant === 'error' ? 'alert' : 'status';

  return (
    <div
      className={[styles.alert, styles['alert-' + variant], className].filter(Boolean).join(' ')}
      role={role}
    >
      {title ? <strong className={styles.alertTitle}>{title}</strong> : null}
      <div>{children}</div>
    </div>
  );
}
