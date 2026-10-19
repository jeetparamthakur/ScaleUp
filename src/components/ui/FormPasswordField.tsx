'use client';

import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useState } from 'react';
import FormTextField from './FormTextField';
import InputButton from './inputs/InputButton';

interface FormPasswordFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  startIcon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
}

export default function FormPasswordField({
  label,
  value,
  onChange,
  autoComplete,
  required,
  disabled,
  placeholder,
  startIcon,
  error,
  helperText,
}: FormPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FormTextField
      label={label}
      value={value}
      onChange={onChange}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      startIcon={startIcon}
      error={error}
      helperText={helperText}
      endAdornment={
        <InputButton
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
          className="form-field-action"
        >
          {visible ? (
            <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
          ) : (
            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
          )}
        </InputButton>
      }
    />
  );
}
