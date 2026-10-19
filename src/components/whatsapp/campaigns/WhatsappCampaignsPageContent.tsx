'use client';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import { useState } from 'react';
import CreateWhatsappCampaignDialog from '@/components/whatsapp/campaigns/CreateWhatsappCampaignDialog';
import WhatsappCampaignsContent from '@/components/whatsapp/campaigns/WhatsappCampaignsContent';
import WhatsAppHubShell from '@/components/whatsapp/WhatsAppHubShell';
import { useWhatsappCampaigns } from '@/hooks/useWhatsappCampaigns';

export default function WhatsappCampaignsPageContent() {
  const [createOpen, setCreateOpen] = useState(false);
  const { refetch } = useWhatsappCampaigns();

  return (
    <WhatsAppHubShell
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="shrink-0 rounded-2xl px-5 py-2.5 shadow-primary-soft"
          onClick={() => setCreateOpen(true)}
        >
          Create campaign
        </Button>
      }
    >
      <WhatsappCampaignsContent onCreateCampaign={() => setCreateOpen(true)} />
      <CreateWhatsappCampaignDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void refetch()}
      />
    </WhatsAppHubShell>
  );
}
