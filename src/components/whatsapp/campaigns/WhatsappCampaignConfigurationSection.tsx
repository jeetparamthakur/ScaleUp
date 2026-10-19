'use client';

import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { Input } from '@/components/ui/inputs';
import {
  buildWhatsappDailyLimitHelperText,
  computeWhatsappSendersDailyCapacity,
  estimateContactsPerSender,
  isWhatsappDailyBatchWithinSenderLimits,
} from '@/lib/whatsapp/campaigns/sender-capacity';
import WhatsappCampaignLaunchScheduleFields from '@/components/whatsapp/campaigns/WhatsappCampaignLaunchScheduleFields';
import type { WhatsappCampaignScheduleMode } from '@/lib/whatsapp/campaigns/launch-schedule';
import type { WhatsappSenderConnection } from '@/lib/whatsapp/connections/types';
interface WhatsappCampaignConfigurationSectionProps {
  dailyBatchSize: number;
  onDailyBatchSizeChange: (value: number) => void;
  sendIntervalSeconds: string;
  onSendIntervalSecondsChange: (value: string) => void;
  distributeRecipientsEqually: boolean;
  onDistributeRecipientsEquallyChange: (value: boolean) => void;
  selectedSenders: WhatsappSenderConnection[];
  contactCount: number;
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

export default function WhatsappCampaignConfigurationSection({
  dailyBatchSize,
  onDailyBatchSizeChange,
  sendIntervalSeconds,
  onSendIntervalSecondsChange,
  distributeRecipientsEqually,
  onDistributeRecipientsEquallyChange,
  selectedSenders,
  contactCount,
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
}: WhatsappCampaignConfigurationSectionProps) {
  const combinedLimit = useMemo(
    () => computeWhatsappSendersDailyCapacity(selectedSenders),
    [selectedSenders],
  );

  const dailyLimitExceeded = !isWhatsappDailyBatchWithinSenderLimits(
    dailyBatchSize,
    selectedSenders,
  );

  const dailyHelper = buildWhatsappDailyLimitHelperText(
    dailyBatchSize,
    combinedLimit,
  );

  const perSenderCounts = useMemo(() => {
    if (!distributeRecipientsEqually || selectedSenders.length < 2) {
      return [];
    }
    return estimateContactsPerSender(contactCount, selectedSenders.length);
  }, [
    contactCount,
    distributeRecipientsEqually,
    selectedSenders.length,
  ]);

  const showDistribute = selectedSenders.length > 1;

  return (
    <Box
      component="section"
      aria-labelledby="whatsapp-campaign-config-heading"
      className="mt-4"
    >
      <Typography
        id="whatsapp-campaign-config-heading"
        variant="subtitle1"
        component="h3"
        className="mb-3 text-base font-semibold leading-snug text-foreground"
      >
        Configuration
      </Typography>

      <Stack spacing={2.5}>
        <WhatsappCampaignLaunchScheduleFields
          scheduleMode={scheduleMode}
          onScheduleModeChange={onScheduleModeChange}
          launchDate={launchDate}
          onLaunchDateChange={onLaunchDateChange}
          launchTime={launchTime}
          onLaunchTimeChange={onLaunchTimeChange}
          launchEndTime={launchEndTime}
          onLaunchEndTimeChange={onLaunchEndTimeChange}
          timezone={timezone}
          onTimezoneChange={onTimezoneChange}
          scheduleError={scheduleError}
          disabled={disabled}
        />

        <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
          <Input
            id="whatsapp-campaign-daily-batch"
            label="Daily send limit"
            type="number"
            value={String(dailyBatchSize)}
            onChange={(event) =>
              onDailyBatchSizeChange(
                Number.parseInt(event.target.value, 10) || 0,
              )
            }
            required
            disabled={disabled}
            min={1}
            error={dailyLimitExceeded ? dailyHelper : undefined}
            className="min-w-0"
          />

          <Input
            id="whatsapp-campaign-send-interval"
            label="Time between messages (seconds)"
            type="number"
            value={sendIntervalSeconds}
            onChange={(event) =>
              onSendIntervalSecondsChange(event.target.value)
            }
            disabled={disabled}
            placeholder="Random 1–3 min if empty"
            min={1}
            max={3600}
            className="min-w-0"
          />
        </Box>

        {showDistribute ? (
          <Stack spacing={0.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={distributeRecipientsEqually}
                  onChange={(_, checked) =>
                    onDistributeRecipientsEquallyChange(checked)
                  }
                  disabled={disabled}
                />
              }
              label="Distribute audience equally across senders"
            />
            {distributeRecipientsEqually && perSenderCounts.length > 0 ? (
              <Typography variant="body2" color="text.secondary">
                {selectedSenders.map((sender, index) => {
                  const label =
                    sender.displayName ??
                    sender.phone ??
                    sender.pushName ??
                    'WhatsApp number';
                  const count = perSenderCounts[index] ?? 0;
                  return `${label}: ~${count.toLocaleString()}`;
                }).join(' · ')}
              </Typography>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}