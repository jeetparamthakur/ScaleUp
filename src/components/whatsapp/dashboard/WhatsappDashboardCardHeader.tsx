'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import WhatsappDashboardCampaignFilter from '@/components/whatsapp/dashboard/WhatsappDashboardCampaignFilter';
import type { WhatsappDashboardCampaignRow } from '@/lib/whatsapp/dashboard/types';

interface WhatsappDashboardCardHeaderProps {
  title: string;
  subtitle: string;
  campaigns: WhatsappDashboardCampaignRow[];
  campaignFilter: string;
  onCampaignFilterChange: (campaignId: string) => void;
  filterDisabled?: boolean;
}

export default function WhatsappDashboardCardHeader({
  title,
  subtitle,
  campaigns,
  campaignFilter,
  onCampaignFilterChange,
  filterDisabled = false,
}: WhatsappDashboardCardHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      className="items-start justify-between gap-3"
    >
      <Box className="min-w-0">
        <Typography variant="subtitle1" className="font-semibold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          {subtitle}
        </Typography>
      </Box>
      <WhatsappDashboardCampaignFilter
        campaigns={campaigns}
        value={campaignFilter}
        onChange={onCampaignFilterChange}
        disabled={filterDisabled}
      />
    </Stack>
  );
}
