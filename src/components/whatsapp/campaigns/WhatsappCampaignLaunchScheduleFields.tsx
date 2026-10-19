'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import {
  DatePicker,
  SearchSelect,
  TimePicker,
} from '@/components/ui/inputs';
import {
  buildTimezoneOptions,
  formatTimezoneLabel,
  getTodayDateInputValue,
} from '@/lib/email/campaigns/schedule-utils';
import type { WhatsappCampaignScheduleMode } from '@/lib/whatsapp/campaigns/launch-schedule';

interface WhatsappCampaignLaunchScheduleFieldsProps {
  scheduleMode: WhatsappCampaignScheduleMode;
  onScheduleModeChange: (mode: WhatsappCampaignScheduleMode) => void;
  launchDate: string;
  onLaunchDateChange: (value: string) => void;
  launchTime: string;
  onLaunchTimeChange: (value: string) => void;
  launchEndTime: string;
  onLaunchEndTimeChange: (value: string) => void;
  timezone: string;
  onTimezoneChange: (value: string) => void;
  scheduleError?: string | null;
  disabled?: boolean;
}

const scheduleModeToggleSx = {
  width: '100%',
  display: 'flex',
  p: 0.25,
  gap: 0.25,
  borderRadius: '10px',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  '& .MuiToggleButtonGroup-grouped': {
    flex: '1 1 50%',
    maxWidth: '50%',
    minWidth: 0,
    minHeight: 32,
    border: 0,
    borderRadius: '8px !important',
    borderLeft: 'none !important',
    py: 0.375,
    px: 0.75,
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.8125rem',
    lineHeight: 1.25,
    color: 'text.secondary',
    transition:
      'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
    '&.Mui-selected': {
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      fontWeight: 600,
      boxShadow: '0 1px 4px color-mix(in srgb, var(--primary) 22%, transparent)',
      '&:hover': {
        bgcolor: 'primary.dark',
      },
    },
    '&:hover:not(.Mui-selected)': {
      bgcolor: 'action.hover',
      color: 'text.primary',
    },
  },
} as const;

const scheduleFieldGridClass =
  'grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5';

export default function WhatsappCampaignLaunchScheduleFields({
  scheduleMode,
  onScheduleModeChange,
  launchDate,
  onLaunchDateChange,
  launchTime,
  onLaunchTimeChange,
  launchEndTime,
  onLaunchEndTimeChange,
  timezone,
  onTimezoneChange,
  scheduleError,
  disabled = false,
}: WhatsappCampaignLaunchScheduleFieldsProps) {
  const minDate = getTodayDateInputValue(timezone);
  const scheduleErrorMessage = scheduleError ?? undefined;

  const timezoneOptions = useMemo(
    () =>
      buildTimezoneOptions(timezone).map((option) => ({
        value: option.value,
        label: formatTimezoneLabel(option.value),
        keywords: `${option.label} ${option.offsetLabel}`,
      })),
    [timezone],
  );

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary" className="font-medium">
        Sending schedule
      </Typography>

      <Box className="w-full max-w-[17.5rem] sm:max-w-[19rem]">
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={scheduleMode}
          onChange={(_event, value: WhatsappCampaignScheduleMode | null) => {
            if (value) {
              onScheduleModeChange(value);
            }
          }}
          disabled={disabled}
          aria-label="Sending schedule"
          sx={scheduleModeToggleSx}
        >
          <ToggleButton value="immediate">Start immediately</ToggleButton>
          <ToggleButton value="scheduled">Schedule</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {scheduleMode === 'scheduled' ? (
        <Stack spacing={2}>
          <Box className={scheduleFieldGridClass}>
            <DatePicker
              id="whatsapp-campaign-launch-date"
              label="Launch date"
              value={launchDate}
              onChange={onLaunchDateChange}
              minDate={minDate}
              disabled={disabled}
              required
              error={scheduleErrorMessage}
              helperText={
                scheduleError ? undefined : 'Date in your selected timezone'
              }
              className="min-w-0"
            />

            <SearchSelect
              id="whatsapp-campaign-timezone"
              label="Timezone"
              value={timezone}
              onChange={onTimezoneChange}
              options={timezoneOptions}
              disabled={disabled}
              error={scheduleErrorMessage}
              searchPlaceholder="Filter timezones"
              className="min-w-0"
            />
          </Box>

          <Box className={scheduleFieldGridClass}>
            <TimePicker
              id="whatsapp-campaign-launch-start-time"
              label="Start time"
              value={launchTime}
              onChange={onLaunchTimeChange}
              required
              disabled={disabled}
              error={scheduleErrorMessage}
              className="min-w-0"
            />

            <TimePicker
              id="whatsapp-campaign-launch-end-time"
              label="End time"
              value={launchEndTime}
              onChange={onLaunchEndTimeChange}
              required
              disabled={disabled}
              error={scheduleErrorMessage}
              className="min-w-0"
            />
          </Box>
        </Stack>
      ) : (
        <Box className={scheduleFieldGridClass}>
          <SearchSelect
            id="whatsapp-campaign-timezone-immediate"
            label="Timezone"
            value={timezone}
            onChange={onTimezoneChange}
            options={timezoneOptions}
            disabled={disabled}
            error={scheduleErrorMessage}
            searchPlaceholder="Filter timezones"
            className="min-w-0"
          />

          <TimePicker
            id="whatsapp-campaign-launch-end-time-immediate"
            label="End time"
            value={launchEndTime}
            onChange={onLaunchEndTimeChange}
            required
            disabled={disabled}
            error={scheduleErrorMessage}
            className="min-w-0"
          />
        </Box>
      )}
    </Stack>
  );
}
