'use client';

import * as Label from '@radix-ui/react-label';
import { cn } from '@/lib/cn';

export interface FieldProps {
  id: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Field({
  id,
  label,
  description,
  error,
  required = false,
  className,
  children,
}: FieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label ? (
        <Label.Root
          htmlFor={id}
          className="text-sm font-medium text-[var(--foreground)]"
        >
          {label}
          {required ? (
            <span className="text-[var(--control-fg-error)]" aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </Label.Root>
      ) : null}
      {children}
      {description && !error ? (
        <p id={descriptionId} className="text-xs text-muted">
          {description}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-[var(--control-fg-error)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
