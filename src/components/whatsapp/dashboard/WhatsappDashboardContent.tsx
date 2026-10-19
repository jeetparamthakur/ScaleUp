'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import WhatsappDashboardCampaignBars from '@/components/whatsapp/dashboard/WhatsappDashboardCampaignBars';
import WhatsappDashboardCampaignStatusPie from '@/components/whatsapp/dashboard/WhatsappDashboardCampaignStatusPie';
import WhatsappDashboardDownloadDialog from '@/components/whatsapp/dashboard/WhatsappDashboardDownloadDialog';
import WhatsappDashboardKpiGrid from '@/components/whatsapp/dashboard/WhatsappDashboardKpiGrid';
import WhatsappDashboardSendTrendChart from '@/components/whatsapp/dashboard/WhatsappDashboardSendTrendChart';
import WhatsappDashboardSendersPanel from '@/components/whatsapp/dashboard/WhatsappDashboardSendersPanel';
import WhatsappDashboardToolbar, {
  WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID,
} from '@/components/whatsapp/dashboard/WhatsappDashboardToolbar';
import { useWhatsappCampaigns } from '@/hooks/useWhatsappCampaigns';
import { useWhatsappDashboard } from '@/hooks/useWhatsappDashboard';
import { useOrgPath } from '@/hooks/useOrgPath';
import {
  formatWhatsappDashboardDateRangeLabel,
  getDefaultWhatsappDashboardDateRange,
} from '@/lib/whatsapp/dashboard/date-range';
import type { WhatsappDashboardCampaignRow } from '@/lib/whatsapp/dashboard/types';

export default function WhatsappDashboardContent() {
  const toOrgPath = useOrgPath();
  const defaultRange = useMemo(() => getDefaultWhatsappDashboardDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);
  const [campaignFilter, setCampaignFilter] = useState(
    WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID,
  );
  const [downloadOpen, setDownloadOpen] = useState(false);

  const dashboardQuery = useMemo(
    () => ({
      dateFrom,
      dateTo,
      campaignId:
        campaignFilter === WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID
          ? undefined
          : campaignFilter,
    }),
    [campaignFilter, dateFrom, dateTo],
  );

  const { data: campaignList } = useWhatsappCampaigns();
  const { data, error, isLoading } = useWhatsappDashboard(dashboardQuery);

  const campaignFilterOptions = useMemo<WhatsappDashboardCampaignRow[]>(
    () =>
      (campaignList ?? []).map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        messagesSent: 0,
        replies: 0,
        recipientsSent: 0,
      })),
    [campaignList],
  );

  const campaignScopeLabel = useMemo(() => {
    if (campaignFilter === WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID) {
      return 'All campaigns';
    }
    const match = campaignFilterOptions.find((row) => row.id === campaignFilter);
    return match?.name ?? 'Selected campaign';
  }, [campaignFilter, campaignFilterOptions]);

  const rangeSubtitle = formatWhatsappDashboardDateRangeLabel(dateFrom, dateTo);

  const isEmpty =
    data &&
    data.summary.messagesSent === 0 &&
    data.campaigns.length === 0 &&
    data.senders.length === 0;

  return (
    <Stack spacing={3.5}>
      <WhatsappDashboardToolbar
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        campaigns={campaignFilterOptions}
        campaignFilter={campaignFilter}
        onCampaignFilterChange={setCampaignFilter}
        onDownloadClick={() => setDownloadOpen(true)}
        disabled={isLoading}
      />

      <WhatsappDashboardDownloadDialog
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        query={dashboardQuery}
        campaignScopeLabel={campaignScopeLabel}
      />

      {error ? (
        <Alert severity="error" className="rounded-2xl">
          Could not load WhatsApp dashboard metrics.
        </Alert>
      ) : null}

      <WhatsappDashboardKpiGrid summary={data?.summary ?? null} isLoading={isLoading} />

      {isEmpty && !isLoading ? (
        <Box className="surface-panel rounded-2xl p-8 text-center">
          <Typography variant="subtitle1" className="font-semibold">
            No WhatsApp activity yet
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-2 max-w-md mx-auto">
            Create a campaign and connect a sender to see sends, replies, and charts here.
          </Typography>
          <Button
            component={Link}
            href={toOrgPath('/whatsapp/campaigns')}
            variant="contained"
            className="mt-6 rounded-2xl px-5 shadow-primary-soft"
          >
            Go to campaigns
          </Button>
        </Box>
      ) : (
        <>
          <Box className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <WhatsappDashboardCampaignStatusPie
              slices={data?.campaignStatusSlices ?? []}
            />
            <WhatsappDashboardSendTrendChart
              points={data?.dailySendTrend ?? []}
              rangeSubtitle={rangeSubtitle}
            />
          </Box>

          <WhatsappDashboardCampaignBars campaigns={data?.campaigns ?? []} />

          <WhatsappDashboardSendersPanel senders={data?.senders ?? []} />
        </>
      )}
    </Stack>
  );
}
