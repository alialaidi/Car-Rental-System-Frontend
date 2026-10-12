import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className = '' }: PageHeaderProps) {
  return (
    <header className={[styles.pageHeader, className].filter(Boolean).join(' ')}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {description ? <p className={styles.pageDescription}>{description}</p> : null}
      </div>
      {action ? <div className={styles.pageHeaderAction}>{action}</div> : null}
    </header>
  );
}
