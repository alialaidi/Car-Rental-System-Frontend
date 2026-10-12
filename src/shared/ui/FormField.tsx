import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface FormControlProps {
  id: string;
  describedBy?: string;
  invalid: boolean;
}

export interface FormFieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  className?: string;
  children: (control: FormControlProps) => ReactNode;
}

export function FormField({
  id,
  label,
  description,
  error,
  className = '',
  children,
}: FormFieldProps) {
  const describedBy = [description ? id + '-description' : '', error ? id + '-error' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={[styles.formField, className].filter(Boolean).join(' ')}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      {description ? (
        <p className={styles.fieldDescription} id={id + '-description'}>
          {description}
        </p>
      ) : null}
      {children({ id, describedBy: describedBy || undefined, invalid: Boolean(error) })}
      {error ? (
        <p className={styles.fieldError} id={id + '-error'} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
