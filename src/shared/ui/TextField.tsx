import type { InputHTMLAttributes } from 'react';
import { FormField } from './FormField';
import styles from './ui.module.css';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  error?: string;
  description?: string;
  fieldClassName?: string;
}

export function TextField({
  id,
  label,
  error,
  description,
  required,
  className = '',
  fieldClassName = '',
  ...inputProps
}: TextFieldProps) {
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
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          required={required}
        />
      )}
    </FormField>
  );
}
