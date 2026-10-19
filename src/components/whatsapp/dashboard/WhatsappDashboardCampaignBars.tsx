'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WhatsappDashboardCampaignRow } from '@/lib/whatsapp/dashboard/types';

interface WhatsappDashboardCampaignBarsProps {
  campaigns: WhatsappDashboardCampaignRow[];
}

interface BarRow {
  name: string;
  value: number;
}

const TOP_N = 8;

function truncateName(name: string, max = 28): string {
  if (name.length <= max) {
    return name;
  }
  return `${name.slice(0, max - 1)}…`;
}

function CampaignBarPanel({
  title,
  subtitle,
  rows,
  color,
}: {
  title: string;
  subtitle: string;
  rows: BarRow[];
  color: string;
}) {
  return (
    <Box className="dashboard-panel surface-panel min-w-0 flex-1 rounded-2xl p-5 md:p-6">
      <Typography variant="subtitle1" className="font-semibold">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mt-1">
        {subtitle}
      </Typography>

      {rows.length === 0 ? (
        <Box className="flex min-h-[220px] items-center justify-center">
          <Typography variant="body2" color="text.secondary">
            No data yet
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: 240 }} className="mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                stroke="color-mix(in srgb, var(--foreground) 6%, transparent)"
                horizontal={false}
                strokeDasharray="3 6"
              />
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={108}
                tick={{ fill: 'var(--color-secondary)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'color-mix(in srgb, var(--foreground) 4%, transparent)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) {
                    return null;
                  }
                  const row = payload[0].payload as BarRow;
                  return (
                    <Box
                      className="rounded-lg border px-2 py-1"
                      sx={{
                        bgcolor: 'var(--surface)',
                        borderColor:
                          'color-mix(in srgb, var(--foreground) 10%, transparent)',
                      }}
                    >
                      <Typography variant="caption" className="font-semibold">
                        {row.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" className="block">
                        {row.value.toLocaleString()}
                      </Typography>
                    </Box>
                  );
                }}
              />
              <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export default function WhatsappDashboardCampaignBars({
  campaigns,
}: WhatsappDashboardCampaignBarsProps) {
  const messagesRows = useMemo(
    () =>
      [...campaigns]
        .filter((row) => row.messagesSent > 0)
        .sort((a, b) => b.messagesSent - a.messagesSent)
        .slice(0, TOP_N)
        .map((row) => ({
          name: truncateName(row.name),
          value: row.messagesSent,
        })),
    [campaigns],
  );

  const repliesRows = useMemo(
    () =>
      [...campaigns]
        .filter((row) => row.replies > 0)
        .sort((a, b) => b.replies - a.replies)
        .slice(0, TOP_N)
        .map((row) => ({
          name: truncateName(row.name),
          value: row.replies,
        })),
    [campaigns],
  );

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
      <CampaignBarPanel
        title="Messages by campaign"
        subtitle={`Top ${TOP_N} by sends`}
        rows={messagesRows}
        color="#10B981"
      />
      <CampaignBarPanel
        title="Replies by campaign"
        subtitle={`Top ${TOP_N} by replies`}
        rows={repliesRows}
        color="#0EA5E9"
      />
    </Stack>
  );
}
