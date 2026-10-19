'use client';

import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import SearchSelect, { type SearchSelectProps } from '../SearchSelect';

interface RhfSearchSelectProps<T extends FieldValues> extends Omit<
  SearchSelectProps,
  'value' | 'onChange' | 'error'
> {
  name: FieldPath<T>;
  control: Control<T>;
}

export default function RhfSearchSelect<T extends FieldValues>({
  name,
  control,
  ...selectProps
}: RhfSearchSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <SearchSelect
          {...selectProps}
          id={selectProps.id ?? name}
          value={field.value ?? ''}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
