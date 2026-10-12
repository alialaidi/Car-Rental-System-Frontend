import type { InputHTMLAttributes } from 'react';
import { FormField } from './FormField';
import styles from './ui.module.css';

export interface DateTimeFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type'
> {
  id: string;
  label: string;
  error?: string;
  description?: string;
  fieldClassName?: string;
}

export function DateTimeField({
  id,
  label,
  error,
  description,
  required,
  className = '',
  fieldClassName = '',
  ...inputProps
}: DateTimeFieldProps) {
  return (
    <FormField
      id={id}
      label={label}
      error={error}
      description={description}
      className={fieldClassName}
    >
      {({ id: controlId, describedBy, invalid }) => (
        <input
          {...inputProps}
          className={[styles.control, className].filter(Boolean).join(' ')}
          id={controlId}
          type="datetime-local"
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          required={required}
        />
      )}
    </FormField>
  );
}
