'use client';

import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import Input, { type InputProps } from '../Input';

interface RhfInputProps<T extends FieldValues> extends Omit<
  InputProps,
  'value' | 'onChange' | 'error'
> {
  name: FieldPath<T>;
  control: Control<T>;
}

export default function RhfInput<T extends FieldValues>({
  name,
  control,
  ...inputProps
}: RhfInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Input
          {...inputProps}
          {...field}
          id={inputProps.id ?? name}
          value={field.value ?? ''}
          error={fieldState.error?.message}
          aria-invalid={fieldState.error ? true : undefined}
        />
      )}
    />
  );
}
