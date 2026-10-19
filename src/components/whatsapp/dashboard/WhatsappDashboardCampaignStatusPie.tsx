'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  formatWhatsappCampaignStatusLabel,
  getWhatsappCampaignStatusColor,
} from '@/lib/whatsapp/dashboard/chart-labels';
import type { WhatsappDashboardStatusSlice } from '@/lib/whatsapp/dashboard/types';

interface WhatsappDashboardCampaignStatusPieProps {
  slices: WhatsappDashboardStatusSlice[];
}

interface ChartSlice {
  status: string;
  label: string;
  count: number;
  color: string;
}

function StatusTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartSlice }[];
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const slice = payload[0].payload;

  return (
    <Box
      className="rounded-xl border px-3 py-2"
      sx={{
        bgcolor: 'var(--surface)',
        borderColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
      }}
    >
      <Typography variant="caption" className="font-semibold">
        {slice.label}
      </Typography>
      <Typography variant="caption" color="text.secondary" className="block">
        {slice.count.toLocaleString()} campaigns
      </Typography>
    </Box>
  );
}

export default function WhatsappDashboardCampaignStatusPie({
  slices,
}: WhatsappDashboardCampaignStatusPieProps) {
  const chartSlices = useMemo(
    () =>
      slices
        .filter((row) => row.count > 0)
        .map((row) => ({
          status: row.status,
          label: formatWhatsappCampaignStatusLabel(row.status),
          count: row.count,
          color: getWhatsappCampaignStatusColor(row.status),
        })),
    [slices],
  );

  const total = chartSlices.reduce((sum, row) => sum + row.count, 0);

  return (
    <Box className="dashboard-panel surface-panel rounded-2xl p-5 md:p-6">
      <Typography variant="subtitle1" className="font-semibold">
        Campaign status
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mt-1">
        Distribution of campaigns in your workspace
      </Typography>

      {total === 0 ? (
        <Box className="flex min-h-[240px] items-center justify-center">
          <Typography variant="body2" color="text.secondary">
            No campaigns yet
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2} className="mt-4">
          <Box sx={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartSlices}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {chartSlices.map((row) => (
                    <Cell key={row.status} fill={row.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<StatusTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Stack spacing={1}>
            {chartSlices.map((row) => (
              <Stack
                key={row.status}
                direction="row"
                className="items-center justify-between gap-2"
              >
                <Stack direction="row" spacing={1} className="min-w-0 items-center">
                  <Box
                    className="h-2 w-2 shrink-0 rounded-full"
                    sx={{ bgcolor: row.color }}
                  />
                  <Typography variant="body2" className="truncate">
                    {row.label}
                  </Typography>
                </Stack>
                <Typography variant="body2" className="shrink-0 tabular-nums font-medium">
                  {row.count.toLocaleString()}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
