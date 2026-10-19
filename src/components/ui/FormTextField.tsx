'use client';

import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import Input from './inputs/Input';

interface RhfFormTextFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
}

interface ControlledFormTextFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  startIcon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  error?: boolean;
  helperText?: string;
  id?: string;
}

export type FormTextFieldProps<T extends FieldValues = FieldValues> =
  | RhfFormTextFieldProps<T>
  | ControlledFormTextFieldProps;

function isRhfProps<T extends FieldValues>(
  props: FormTextFieldProps<T>,
): props is RhfFormTextFieldProps<T> {
  return 'control' in props && 'name' in props;
}

export default function FormTextField<T extends FieldValues>(
  props: FormTextFieldProps<T>,
) {
  if (isRhfProps(props)) {
    const {
      name,
      control,
      label,
      type = 'text',
      autoComplete,
      disabled = false,
      placeholder,
      helperText,
    } = props;

    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={name}
            label={label}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            required
            disabled={disabled}
            value={field.value ?? ''}
            error={fieldState.error?.message}
            helperText={helperText}
            aria-invalid={fieldState.error ? true : undefined}
          />
        )}
      />
    );
  }

  const {
    label,
    value,
    onChange,
    type = 'text',
    autoComplete,
    required = false,
    disabled = false,
    placeholder,
    startIcon,
    endAdornment,
    error,
    helperText,
    id,
  } = props;

  return (
    <Input
      id={id}
      label={label}
      type={type}
      autoComplete={autoComplete}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      startIcon={startIcon}
      endAdornment={endAdornment}
      error={error ? helperText ?? 'Invalid value' : undefined}
      helperText={!error ? helperText : undefined}
      aria-invalid={error || undefined}
    />
  );
}
