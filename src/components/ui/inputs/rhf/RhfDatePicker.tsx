'use client';

import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import DatePicker, { type DatePickerProps } from '../DatePicker';

interface RhfDatePickerProps<T extends FieldValues> extends Omit<
  DatePickerProps,
  'value' | 'onChange' | 'error'
> {
  name: FieldPath<T>;
  control: Control<T>;
}

export default function RhfDatePicker<T extends FieldValues>({
  name,
  control,
  ...pickerProps
}: RhfDatePickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          {...pickerProps}
          id={pickerProps.id ?? name}
          value={field.value ?? ''}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
