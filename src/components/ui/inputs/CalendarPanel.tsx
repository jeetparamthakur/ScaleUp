'use client';

import { DayPicker, type DateRange } from 'react-day-picker';
import { cn } from '@/lib/cn';
import 'react-day-picker/style.css';

export interface CalendarPanelProps {
  mode: 'single' | 'range';
  selected?: Date | DateRange;
  onSelect?: (value: Date | DateRange | undefined) => void;
  disabled?: (date: Date) => boolean;
  numberOfMonths?: number;
  className?: string;
}

export default function CalendarPanel({
  mode,
  selected,
  onSelect,
  disabled,
  numberOfMonths = 1,
  className,
}: CalendarPanelProps) {
  if (mode === 'range') {
    return (
      <DayPicker
        mode="range"
        resetOnSelect
        selected={selected as DateRange}
        onSelect={onSelect as (range: DateRange | undefined) => void}
        disabled={disabled}
        numberOfMonths={numberOfMonths}
        className={cn('markos-day-picker', className)}
      />
    );
  }

  return (
    <DayPicker
      mode="single"
      selected={selected as Date | undefined}
      onSelect={onSelect as (date: Date | undefined) => void}
      disabled={disabled}
      className={cn('markos-day-picker', className)}
    />
  );
}
