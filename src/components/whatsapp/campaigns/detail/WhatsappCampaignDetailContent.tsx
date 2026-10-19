'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import WhatsappCampaignDetailHeader from '@/components/whatsapp/campaigns/detail/WhatsappCampaignDetailHeader';
import WhatsappCampaignDetailTabs from '@/components/whatsapp/campaigns/detail/WhatsappCampaignDetailTabs';
import { useWhatsappCampaign } from '@/hooks/useWhatsappCampaigns';

interface WhatsappCampaignDetailContentProps {
  campaignId: string;
}

export default function WhatsappCampaignDetailContent({
  campaignId,
}: WhatsappCampaignDetailContentProps) {
  const { data: campaign, error, isLoading } = useWhatsappCampaign(campaignId);

  if (isLoading) {
    return (
      <Stack className="items-center py-16">
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (error || !campaign) {
    return (
      <Alert severity="error" className="rounded-2xl">
        Could not load this WhatsApp campaign.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <WhatsappCampaignDetailHeader campaign={campaign} />
      <Box>
        <WhatsappCampaignDetailTabs campaign={campaign} />
      </Box>
    </Stack>
  );
}
