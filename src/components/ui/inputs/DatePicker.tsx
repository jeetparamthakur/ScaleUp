'use client';

import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import * as Popover from '@radix-ui/react-popover';
import { DateTime } from 'luxon';
import { useId, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import CalendarPanel from './CalendarPanel';
import Field from './Field';
import {
  controlShellClass,
  controlShellDataAttrs,
  popoverContentClass,
} from './controlStyles';

export interface DatePickerProps {
  id?: string;
  label?: string;
  description?: string;
  value: string;
  onChange: (isoDate: string) => void;
  minDate?: string;
  maxDate?: string;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

function parseIsoDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = DateTime.fromISO(value).startOf('day');
  if (!parsed.isValid) {
    return undefined;
  }

  return parsed.toJSDate();
}

function toIsoDate(date: Date | undefined): string {
  if (!date) {
    return '';
  }

  return DateTime.fromJSDate(date).toISODate() ?? '';
}

export default function DatePicker({
  id: idProp,
  label,
  description,
  value,
  onChange,
  minDate,
  maxDate,
  format = 'MM/dd/yyyy',
  placeholder = 'Select date',
  disabled = false,
  error,
  helperText,
  required,
  className,
}: DatePickerProps) {
  const generatedId = useId();
  const fieldId = idProp ?? generatedId;
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseIsoDate(value), [value]);

  const displayValue = useMemo(() => {
    if (!selected) {
      return '';
    }

    return DateTime.fromJSDate(selected).toFormat(format);
  }, [format, selected]);

  const min = minDate ? parseIsoDate(minDate) : undefined;
  const max = maxDate ? parseIsoDate(maxDate) : undefined;

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
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          id={fieldId}
          aria-expanded={open}
          className={cn(
            controlShellClass(invalid, disabled, 'cursor-pointer text-left'),
            className,
          )}
          {...controlShellDataAttrs(invalid, disabled)}
        >
          <span
            className={cn(
              'control-field-input flex items-center truncate',
              !displayValue && 'text-[var(--control-placeholder)]',
            )}
          >
            {displayValue || placeholder}
          </span>
          <span className="flex shrink-0 pr-2 text-muted" aria-hidden="true">
            <CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cn(popoverContentClass, 'w-auto min-w-0')}
          align="start"
          sideOffset={6}
        >
          <CalendarPanel
            mode="single"
            selected={selected}
            onSelect={(next) => {
              const date = next as Date | undefined;
              onChange(toIsoDate(date));
              setOpen(false);
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
