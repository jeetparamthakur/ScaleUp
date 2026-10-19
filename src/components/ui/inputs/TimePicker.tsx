'use client';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import * as Popover from '@radix-ui/react-popover';
import { useId, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import Field from './Field';
import TimePickerPanel from './TimePickerPanel';
import {
  controlShellClass,
  controlShellDataAttrs,
  popoverContentClass,
} from './controlStyles';
import {
  formatTimeHmDisplay,
  parseTimeHmString,
  partsToTimeHm,
  snapMinuteToStep,
  stepSecondsToMinuteStep,
} from './time-picker.utils';

export interface TimePickerProps {
  id?: string;
  label?: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  fieldClassName?: string;
  placeholder?: string;
  /** Step in seconds (default 300 = 5 minutes). */
  step?: number;
}

const DEFAULT_TIME_HM = '09:00';

export default function TimePicker({
  id,
  label,
  description,
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  required,
  className,
  fieldClassName,
  placeholder = 'Select time',
  step = 300,
}: TimePickerProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const minuteStep = stepSecondsToMinuteStep(step);

  const resolvedParts = useMemo(() => {
    const parsed = parseTimeHmString(value);
    if (parsed) {
      return {
        hour24: parsed.hour24,
        minute: snapMinuteToStep(parsed.minute, minuteStep),
      };
    }

    const fallback = parseTimeHmString(DEFAULT_TIME_HM);
    return {
      hour24: fallback?.hour24 ?? 9,
      minute: snapMinuteToStep(fallback?.minute ?? 0, minuteStep),
    };
  }, [minuteStep, value]);

  const displayValue = formatTimeHmDisplay(value);
  const invalid = Boolean(error);

  function handleTimeChange(hour24: number, minute: number) {
    onChange(partsToTimeHm(hour24, minute));
  }

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
            <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cn(popoverContentClass, 'w-auto min-w-0 p-3')}
          align="start"
          sideOffset={6}
          collisionPadding={16}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <TimePickerPanel
            hour24={resolvedParts.hour24}
            minute={resolvedParts.minute}
            minuteStep={minuteStep}
            onChange={handleTimeChange}
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
      className={fieldClassName}
    >
      {control}
      {helperText && !error ? (
        <p className="text-xs text-muted">{helperText}</p>
      ) : null}
    </Field>
  );
}
