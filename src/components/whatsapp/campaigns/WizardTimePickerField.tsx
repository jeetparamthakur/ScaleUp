'use client';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { useState } from 'react';
import type { DateTime } from 'luxon';
import {
  formatTimeHm,
  parseTimeHm,
} from '@/lib/whatsapp/campaigns/launch-schedule';

const WIZARD_TIME_LOCALE_TEXT = {
  fieldHoursPlaceholder: () => 'hh',
  fieldMinutesPlaceholder: () => 'mm',
  fieldMeridiemPlaceholder: () => 'aa',
};

interface WizardTimePickerFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  textFieldClassName?: string;
}

export default function WizardTimePickerField({
  id,
  label,
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
  required = false,
  textFieldClassName,
}: WizardTimePickerFieldProps) {
  const [open, setOpen] = useState(false);

  function openPicker() {
    if (disabled) {
      return;
    }

    setOpen(true);
  }

  function handleChange(next: DateTime | null) {
    onChange(formatTimeHm(next));
  }

  return (
    <LocalizationProvider
      dateAdapter={AdapterLuxon}
      localeText={WIZARD_TIME_LOCALE_TEXT}
    >
      <TimePicker
        label={label}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={parseTimeHm(value)}
        onChange={handleChange}
        disabled={disabled}
        ampm
        format="h:mm a"
        minutesStep={5}
        slots={{
          openPickerIcon: AccessTimeOutlinedIcon,
        }}
        slotProps={{
          textField: {
            id,
            fullWidth: true,
            required,
            error,
            helperText,
            className: textFieldClassName
              ? `${textFieldClassName} rounded-xl`
              : 'rounded-xl',
            onClick: openPicker,
            onKeyDown: (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPicker();
              }
            },
            sx: {
              cursor: disabled ? undefined : 'pointer',
              '& .MuiPickersInputBase-root': {
                cursor: disabled ? undefined : 'pointer',
              },
              '& .MuiPickersSectionList-root': {
                cursor: disabled ? undefined : 'pointer',
              },
            },
          },
          openPickerButton: {
            className: 'text-text-secondary',
            onClick: (event) => {
              event.stopPropagation();
              openPicker();
            },
          },
          popper: {
            placement: 'bottom-start',
            sx: {
              '& .MuiPaper-root': {
                borderRadius: '12px',
                border:
                  '1px solid color-mix(in srgb, var(--foreground) 12%, transparent)',
                boxShadow:
                  '0 12px 40px color-mix(in srgb, var(--foreground) 14%, transparent)',
              },
              '& .MuiMultiSectionDigitalClockSection-item': {
                borderRadius: '10px',
                fontWeight: 500,
                '&.Mui-selected': {
                  fontWeight: 700,
                  borderRadius: '10px',
                },
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
