'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useState } from 'react';
import WhatsappCampaignOverviewTab from '@/components/whatsapp/campaigns/detail/tabs/WhatsappCampaignOverviewTab';
import WhatsappCampaignRecipientsTab from '@/components/whatsapp/campaigns/detail/tabs/WhatsappCampaignRecipientsTab';
import WhatsappCampaignRepliesTab from '@/components/whatsapp/campaigns/detail/tabs/WhatsappCampaignRepliesTab';
import type { WhatsappCampaignDetail } from '@/lib/whatsapp/campaigns/types';

type WhatsappCampaignDetailTab = 'overview' | 'recipients' | 'replies';

interface WhatsappCampaignDetailTabsProps {
  campaign: WhatsappCampaignDetail;
}

export default function WhatsappCampaignDetailTabs({
  campaign,
}: WhatsappCampaignDetailTabsProps) {
  const [tab, setTab] = useState<WhatsappCampaignDetailTab>('overview');

  return (
    <>
      <Tabs
        value={tab}
        onChange={(_, value: WhatsappCampaignDetailTab) => setTab(value)}
        className="mb-4"
      >
        <Tab value="overview" label="Overview" />
        <Tab value="recipients" label="Recipients" />
        <Tab value="replies" label="Replies" />
      </Tabs>

      {tab === 'overview' ? <WhatsappCampaignOverviewTab campaign={campaign} /> : null}
      {tab === 'recipients' ? (
        <WhatsappCampaignRecipientsTab campaign={campaign} />
      ) : null}
      {tab === 'replies' ? (
        <WhatsappCampaignRepliesTab campaignId={campaign.id} />
      ) : null}
    </>
  );
}
