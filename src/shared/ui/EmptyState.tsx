import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className = '' }: EmptyStateProps) {
  return (
    <section aria-label={title} className={[styles.state, className].filter(Boolean).join(' ')}>
      <h2 className={styles.stateTitle}>{title}</h2>
      {description ? <p className={styles.stateDescription}>{description}</p> : null}
      {action}
    </section>
  );
}
