'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';
import Field from './Field';
import {
  controlShellClass,
  controlShellDataAttrs,
} from './controlStyles';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fieldClassName?: string;
  shellClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    description,
    error,
    helperText,
    startIcon,
    endAdornment,
    required,
    disabled,
    className,
    fieldClassName,
    shellClassName,
    'aria-invalid': ariaInvalid,
    ...inputProps
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? inputProps.name ?? generatedId;
  const invalid = Boolean(error) || ariaInvalid === true;
  const message = error ?? helperText;

  const control = (
    <div
      className={controlShellClass(invalid, disabled, shellClassName)}
      {...controlShellDataAttrs(invalid, disabled)}
    >
      {startIcon ? (
        <span className="flex shrink-0 pl-3 text-muted" aria-hidden="true">
          {startIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={
          message && inputId ? `${inputId}-message` : undefined
        }
        className={cn(
          'control-field-input',
          startIcon ? 'pl-2' : undefined,
          className,
        )}
        {...inputProps}
      />
      {endAdornment ? (
        <span className="flex shrink-0 pr-1">{endAdornment}</span>
      ) : null}
    </div>
  );

  if (!label && !message && !description) {
    return control;
  }

  return (
    <Field
      id={inputId ?? 'input'}
      label={label}
      description={description}
      error={error}
      required={required}
      className={fieldClassName}
    >
      {control}
      {helperText && !error ? (
        <p
          id={inputId ? `${inputId}-message` : undefined}
          className="text-xs text-muted"
        >
          {helperText}
        </p>
      ) : null}
    </Field>
  );
});

export default Input;
