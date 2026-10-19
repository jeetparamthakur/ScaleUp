'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatSendingWindowDuration } from '@/lib/email/campaigns/schedule-utils';
import type { WhatsappCampaignDetail } from '@/lib/whatsapp/campaigns/types';

interface WhatsappCampaignOverviewTabProps {
  campaign: WhatsappCampaignDetail;
}

export default function WhatsappCampaignOverviewTab({
  campaign,
}: WhatsappCampaignOverviewTabProps) {
  const launchLabel = campaign.launchAt
    ? new Date(campaign.launchAt).toLocaleString(
        undefined,
        campaign.timezone ? { timeZone: campaign.timezone } : undefined,
      )
    : 'Send immediately when scheduled';

  const sendingWindowLabel =
    campaign.sendingWindowStartMinutes != null &&
    campaign.sendingWindowEndMinutes != null
      ? formatSendingWindowDuration(
          campaign.sendingWindowStartMinutes,
          campaign.sendingWindowEndMinutes,
        )
      : null;

  return (
    <Box className="surface-panel rounded-2xl p-5 md:p-6">
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Message
          </Typography>
          <Typography variant="body1" className="mt-1 whitespace-pre-wrap">
            {campaign.messageBody}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Launch
          </Typography>
          <Typography variant="body2" className="mt-1">
            {launchLabel}
            {campaign.timezone ? ` (${campaign.timezone})` : ''}
          </Typography>
        </Box>

        {sendingWindowLabel ? (
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Daily sending window
            </Typography>
            <Typography variant="body2" className="mt-1">
              {sendingWindowLabel}
              {campaign.timezone ? ` (${campaign.timezone})` : ''}
            </Typography>
          </Box>
        ) : null}

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Pacing
          </Typography>
          <Typography variant="body2" className="mt-1">
            Up to {campaign.dailyBatchSize} messages per day
            {campaign.sendIntervalSeconds
              ? `, ${campaign.sendIntervalSeconds}s between sends`
              : ''}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
