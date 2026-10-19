'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DatePicker, Input, SearchSelect } from '@/components/ui/inputs';
import type { WhatsappFollowUpDelayMode } from '@/lib/whatsapp/campaigns/sequence-types';

interface WhatsappFollowUpTimingFieldsProps {
  delayMode: WhatsappFollowUpDelayMode;
  delayDays: number;
  scheduledDate: string;
  minDate?: string;
  disabled?: boolean;
  onDelayModeChange: (mode: WhatsappFollowUpDelayMode) => void;
  onDelayDaysChange: (days: number) => void;
  onScheduledDateChange: (date: string) => void;
}

const DELAY_MODE_OPTIONS = [
  { value: 'relative', label: 'after no reply' },
  { value: 'absolute', label: 'on date' },
] as const;

export default function WhatsappFollowUpTimingFields({
  delayMode,
  delayDays,
  scheduledDate,
  minDate,
  disabled = false,
  onDelayModeChange,
  onDelayDaysChange,
  onScheduledDateChange,
}: WhatsappFollowUpTimingFieldsProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
    >
      <Typography variant="body2" color="text.secondary">
        Send
      </Typography>
      <SearchSelect
        id="whatsapp-follow-up-delay-mode"
        value={delayMode}
        onChange={(next) =>
          onDelayModeChange(next as WhatsappFollowUpDelayMode)
        }
        options={[...DELAY_MODE_OPTIONS]}
        disabled={disabled}
        className="min-w-[10rem]"
        aria-label="Follow-up timing"
      />
      {delayMode === 'absolute' ? (
        <DatePicker
          id="whatsapp-follow-up-scheduled-date"
          value={scheduledDate}
          onChange={onScheduledDateChange}
          minDate={minDate}
          disabled={disabled}
          className="min-w-[10rem]"
        />
      ) : (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Input
            id="whatsapp-follow-up-delay-days"
            type="number"
            value={String(delayDays)}
            disabled={disabled}
            onChange={(event) =>
              onDelayDaysChange(Number(event.target.value) || 1)
            }
            min={1}
            max={90}
            className="w-20"
            aria-label="Days after no reply"
          />
          <Typography variant="body2" color="text.secondary">
            days later
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
