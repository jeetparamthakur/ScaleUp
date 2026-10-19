'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import Field from './Field';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  helperText?: string;
  fieldClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      id,
      label,
      description,
      error,
      helperText,
      required,
      disabled,
      className,
      fieldClassName,
      rows = 4,
      ...props
    },
    ref,
  ) {
    const textareaId = id ?? props.name ?? 'textarea';
    const invalid = Boolean(error);
    const message = error ?? helperText;

    return (
      <Field
        id={textareaId}
        label={label}
        description={description}
        error={error}
        required={required}
        className={fieldClassName}
      >
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={message ? `${textareaId}-message` : undefined}
          className={cn(
            'w-full min-h-[var(--textarea-min-height)] resize-y rounded-[var(--control-radius)] border border-[var(--control-border)] bg-[var(--control-bg)] px-3.5 py-2.5 text-[0.9375rem] text-[var(--control-fg)] outline-none transition-[border-color,box-shadow]',
            'placeholder:text-[var(--control-placeholder)]',
            'focus:border-[color-mix(in_srgb,var(--control-border-focus)_55%,var(--control-border))]',
            invalid && 'border-[var(--control-border-error)]',
            disabled && 'opacity-55',
            className,
          )}
          {...props}
        />
        {helperText && !error ? (
          <p id={`${textareaId}-message`} className="text-xs text-muted">
            {helperText}
          </p>
        ) : null}
      </Field>
    );
  },
);

export default Textarea;
