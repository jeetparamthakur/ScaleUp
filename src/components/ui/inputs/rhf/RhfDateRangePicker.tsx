'use client';

import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import DateRangePicker, {
  type DateRangePickerProps,
  type DateRangeValue,
} from '../DateRangePicker';

interface RhfDateRangePickerProps<T extends FieldValues> extends Omit<
  DateRangePickerProps,
  'value' | 'onChange' | 'error'
> {
  name: FieldPath<T>;
  control: Control<T>;
}

export default function RhfDateRangePicker<T extends FieldValues>({
  name,
  control,
  ...pickerProps
}: RhfDateRangePickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DateRangePicker
          {...pickerProps}
          id={pickerProps.id ?? name}
          value={(field.value as DateRangeValue) ?? { from: '', to: '' }}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
