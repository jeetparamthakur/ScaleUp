'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useOrgPath } from '@/hooks/useOrgPath';
import type {
  WhatsappCampaignDetail,
  WhatsappCampaignStatus,
} from '@/lib/whatsapp/campaigns/types';

function statusColor(
  status: WhatsappCampaignStatus,
): 'default' | 'success' | 'warning' | 'info' {
  if (status === 'completed') {
    return 'success';
  }
  if (status === 'sending' || status === 'scheduled') {
    return 'info';
  }
  if (status === 'stopped') {
    return 'warning';
  }
  return 'default';
}

interface WhatsappCampaignDetailHeaderProps {
  campaign: WhatsappCampaignDetail;
}

export default function WhatsappCampaignDetailHeader({
  campaign,
}: WhatsappCampaignDetailHeaderProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();

  return (
    <Stack spacing={2}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(toOrgPath('/whatsapp/campaigns'))}
        className="self-start rounded-xl"
        color="inherit"
      >
        Back to campaigns
      </Button>

      <Box className="surface-panel rounded-2xl p-5 md:p-6">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h5" className="font-bold">
              {campaign.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              Created {new Date(campaign.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Chip
            label={campaign.status.replace(/_/g, ' ')}
            color={statusColor(campaign.status)}
            variant="outlined"
          />
        </Stack>

        <Stack direction="row" spacing={1} className="mt-4 flex-wrap gap-2">
          <Chip size="small" label={`Sent ${campaign.progress.sent}`} />
          <Chip size="small" color="success" label={`Replied ${campaign.progress.replied}`} />
          <Chip size="small" label={`Pending ${campaign.progress.pending}`} />
          <Chip size="small" label={`Failed ${campaign.progress.failed}`} />
        </Stack>
      </Box>
    </Stack>
  );
}
