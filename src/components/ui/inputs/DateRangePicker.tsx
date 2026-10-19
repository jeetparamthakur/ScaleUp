'use client';

import * as Popover from '@radix-ui/react-popover';
import { DateTime } from 'luxon';
import { useId, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import CalendarPanel from './CalendarPanel';
import Field from './Field';
import { controlShellClass, controlShellDataAttrs } from './controlStyles';

const DATE_RANGE_CORNER_RADIUS_PX = 18;

export interface DateRangeValue {
  from: string;
  to: string;
}

export interface DateRangePickerProps {
  id?: string;
  label?: string;
  description?: string;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  minDate?: string;
  maxDate?: string;
  formatLabel?: (value: DateRangeValue) => string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

function parseIso(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = DateTime.fromISO(value).startOf('day');
  return parsed.isValid ? parsed.toJSDate() : undefined;
}

function toIso(date: Date | undefined): string {
  if (!date) {
    return '';
  }

  return DateTime.fromJSDate(date).toISODate() ?? '';
}

function defaultFormatLabel(value: DateRangeValue): string {
  if (!value.from && !value.to) {
    return '';
  }

  const from = value.from
    ? DateTime.fromISO(value.from).toFormat('MMM d, yyyy')
    : '…';
  const to = value.to
    ? DateTime.fromISO(value.to).toFormat('MMM d, yyyy')
    : '…';

  return `${from} – ${to}`;
}

export default function DateRangePicker({
  id: idProp,
  label,
  description,
  value,
  onChange,
  minDate,
  maxDate,
  formatLabel = defaultFormatLabel,
  placeholder = 'Select date range',
  disabled = false,
  error,
  helperText,
  required,
  className,
}: DateRangePickerProps) {
  const generatedId = useId();
  const fieldId = idProp ?? generatedId;
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => ({
      from: parseIso(value.from),
      to: parseIso(value.to),
    }),
    [value.from, value.to],
  );

  const display = formatLabel(value);
  const min = minDate ? parseIso(minDate) : undefined;
  const max = maxDate ? parseIso(maxDate) : undefined;

  function isDisabledDate(date: Date): boolean {
    if (min && date < min) {
      return true;
    }

    if (max && date > max) {
      return true;
    }

    return false;
  }

  const invalid = Boolean(error);

  const control = (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className={cn('inline-flex w-fit max-w-full', className)}>
        <Popover.Trigger asChild disabled={disabled}>
          <button
            type="button"
            id={fieldId}
            aria-expanded={open}
            style={{ borderRadius: DATE_RANGE_CORNER_RADIUS_PX }}
            className={cn(
              controlShellClass(
                invalid,
                disabled,
                cn(
                  'cursor-pointer text-left !h-auto !max-h-none !min-h-0 !w-auto px-2 py-2 font-medium',
                  !invalid &&
                    '!border-transparent !bg-primary !text-white focus-within:!border-white/25 focus-within:!shadow-[0_0_0_3px_color-mix(in_srgb,white_28%,transparent)]',
                ),
              ),
            )}
            {...controlShellDataAttrs(invalid, disabled)}
          >
            <span
              className={cn(
                'control-field-input flex items-center truncate',
                !display && !invalid && 'text-white/75',
              )}
            >
              {display || placeholder}
            </span>
          </button>
        </Popover.Trigger>
      </div>
      <Popover.Portal>
        <Popover.Content
          className={cn(
            'z-[1400] w-auto min-w-0 overflow-hidden border border-[var(--control-border)] bg-[var(--surface)] p-4 shadow-lg outline-none',
          )}
          style={{ borderRadius: DATE_RANGE_CORNER_RADIUS_PX }}
          align="end"
          side="bottom"
          sideOffset={6}
          collisionPadding={16}
        >
          <CalendarPanel
            mode="range"
            numberOfMonths={2}
            selected={selected}
            onSelect={(range) => {
              const next = range as { from?: Date; to?: Date } | undefined;
              if (!next?.from) {
                return;
              }
              onChange({
                from: toIso(next.from),
                to: toIso(next.to),
              });
              if (next.from && next.to) {
                setOpen(false);
              }
            }}
            disabled={isDisabledDate}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );

  if (!label && !error && !helperText && !description) {
    return control;
  }

  return (
    <Field
      id={fieldId}
      label={label}
      description={description}
      error={error}
      required={required}
    >
      {control}
      {helperText && !error ? (
        <p className="text-xs text-muted">{helperText}</p>
      ) : null}
    </Field>
  );
}
