'use client';

import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import MarkChatReadOutlinedIcon from '@mui/icons-material/MarkChatReadOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatDashboardCount } from '@/lib/whatsapp/dashboard/chart-labels';
import type { WhatsappDashboardSummary } from '@/lib/whatsapp/dashboard/types';

interface KpiCardConfig {
  label: string;
  value: string;
  subtext?: string;
  icon: typeof SendOutlinedIcon;
}

interface WhatsappDashboardKpiGridProps {
  summary: WhatsappDashboardSummary | null;
  isLoading: boolean;
}

function buildCards(summary: WhatsappDashboardSummary): KpiCardConfig[] {
  return [
    {
      label: 'Messages sent',
      value: formatDashboardCount(summary.messagesSent),
      subtext: 'Campaign sends only',
      icon: SendOutlinedIcon,
    },
    {
      label: 'Replies',
      value: formatDashboardCount(summary.replies),
      subtext: 'Across all campaigns',
      icon: MarkChatReadOutlinedIcon,
    },
    {
      label: 'Running campaigns',
      value: formatDashboardCount(summary.campaignsRunning),
      subtext: `${formatDashboardCount(summary.campaignsScheduled)} scheduled`,
      icon: CampaignOutlinedIcon,
    },
    {
      label: 'Senders ready',
      value: `${formatDashboardCount(summary.sendersReady)} / ${formatDashboardCount(summary.sendersTotal)}`,
      subtext: 'Connected numbers',
      icon: PhoneIphoneOutlinedIcon,
    },
  ];
}

function KpiSkeletonCard({ index }: { index: number }) {
  return (
    <Card
      key={`skeleton-${index}`}
      className="dashboard-panel surface-panel rounded-2xl shadow-none"
    >
      <CardContent className="p-5">
        <Stack spacing={2}>
          <Box className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <SendOutlinedIcon sx={{ fontSize: 22 }} aria-hidden />
          </Box>
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={32} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function KpiMetricCard({ card }: { card: KpiCardConfig }) {
  const Icon = card.icon;

  return (
    <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
      <CardContent className="p-5">
        <Stack spacing={2}>
          <Box className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <Icon sx={{ fontSize: 22 }} aria-hidden />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {card.label}
            </Typography>
            <Typography
              variant="h5"
              component="p"
              className="mt-1 font-bold tabular-nums"
            >
              {card.value}
            </Typography>
            {card.subtext ? (
              <Typography variant="caption" color="text.secondary" className="mt-1 block">
                {card.subtext}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function WhatsappDashboardKpiGrid({
  summary,
  isLoading,
}: WhatsappDashboardKpiGridProps) {
  if (isLoading) {
    return (
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <KpiSkeletonCard key={index} index={index} />
        ))}
      </Box>
    );
  }

  const cards = summary ? buildCards(summary) : [];

  return (
    <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <KpiMetricCard key={card.label} card={card} />
      ))}
    </Box>
  );
}
