import type { SelectHTMLAttributes } from 'react';
import { FormField } from './FormField';
import styles from './ui.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  description?: string;
  fieldClassName?: string;
}

export function SelectField({
  id,
  label,
  options,
  placeholder,
  error,
  description,
  required,
  className = '',
  fieldClassName = '',
  ...selectProps
}: SelectFieldProps) {
  return (
    <FormField
      id={id}
      label={label}
      error={error}
      description={description}
      className={fieldClassName}
    >
      {({ id: controlId, describedBy, invalid }) => (
        <select
          {...selectProps}
          className={[styles.control, className].filter(Boolean).join(' ')}
          id={controlId}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          required={required}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}
