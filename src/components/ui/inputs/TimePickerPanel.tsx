'use client';

import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/cn';
import {
  HOUR_12_OPTIONS,
  MERIDIEM_OPTIONS,
  type Meridiem,
  buildMinuteOptions,
  from12Hour,
  to12Hour,
} from './time-picker.utils';

export interface TimePickerPanelProps {
  hour24: number;
  minute: number;
  minuteStep: number;
  onChange: (hour24: number, minute: number) => void;
  className?: string;
}

interface TimeColumnProps<T extends string | number> {
  label: string;
  options: readonly T[];
  value: T;
  onSelect: (value: T) => void;
  formatOption?: (value: T) => string;
}

function TimeColumn<T extends string | number>({
  label,
  options,
  value,
  onSelect,
  formatOption,
}: TimeColumnProps<T>) {
  const listRef = useRef<HTMLUListElement>(null);
  const selectedId = `time-col-${label}-${String(value)}`;

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    const selected = list.querySelector<HTMLElement>(`[data-value="${String(value)}"]`);
    selected?.scrollIntoView({ block: 'center' });
  }, [value, options]);

  return (
    <div className="markos-time-picker-column">
      {label ? (
        <span className="markos-time-picker-column-label">{label}</span>
      ) : (
        <span className="markos-time-picker-column-label" aria-hidden="true">
          &nbsp;
        </span>
      )}
      <ul ref={listRef} className="markos-time-picker-column-list" aria-label={label}>
        {options.map((option) => {
          const selected = option === value;
          const display = formatOption ? formatOption(option) : String(option);

          return (
            <li key={String(option)}>
              <button
                type="button"
                data-value={String(option)}
                id={selected ? selectedId : undefined}
                aria-pressed={selected}
                className={cn(
                  'markos-time-picker-option',
                  selected && 'markos-time-picker-option-selected',
                )}
                onClick={() => onSelect(option)}
              >
                {display}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function TimePickerPanel({
  hour24,
  minute,
  minuteStep,
  onChange,
  className,
}: TimePickerPanelProps) {
  const { hour12, meridiem } = to12Hour(hour24);
  const minuteOptions = useMemo(
    () => buildMinuteOptions(minuteStep),
    [minuteStep],
  );

  const safeMinute = minuteOptions.includes(minute)
    ? minute
    : minuteOptions[0] ?? 0;

  function commit(h12: number, min: number, period: Meridiem) {
    onChange(from12Hour(h12, period), min);
  }

  return (
    <div className={cn('markos-time-picker', className)}>
      <div className="markos-time-picker-columns">
        <TimeColumn
          label="Hour"
          options={HOUR_12_OPTIONS}
          value={hour12}
          onSelect={(nextHour) => commit(nextHour, safeMinute, meridiem)}
          formatOption={(hour) => String(hour).padStart(2, '0')}
        />
        <TimeColumn
          label="Min"
          options={minuteOptions}
          value={safeMinute}
          onSelect={(nextMinute) => commit(hour12, nextMinute, meridiem)}
          formatOption={(min) => String(min).padStart(2, '0')}
        />
        <TimeColumn
          label=""
          options={MERIDIEM_OPTIONS}
          value={meridiem}
          onSelect={(nextMeridiem) => commit(hour12, safeMinute, nextMeridiem)}
        />
      </div>
    </div>
  );
}
