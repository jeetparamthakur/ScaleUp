'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatTrendDateLabel } from '@/lib/whatsapp/dashboard/chart-labels';
import type { WhatsappDashboardDailyTrendPoint } from '@/lib/whatsapp/dashboard/types';

interface WhatsappDashboardSendTrendChartProps {
  points: WhatsappDashboardDailyTrendPoint[];
  rangeSubtitle: string;
}

interface ChartRow {
  label: string;
  messagesSent: number;
  replies: number;
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <Box
      className="rounded-xl border px-3 py-2"
      sx={{
        bgcolor: 'var(--surface)',
        borderColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
      }}
    >
      <Typography variant="caption" className="mb-1 block font-semibold">
        {label}
      </Typography>
      <Stack spacing={0.25}>
        {payload
          .filter((entry) => entry.value > 0)
          .map((entry) => (
            <Typography key={entry.dataKey} variant="caption" color="text.secondary">
              {entry.dataKey === 'messagesSent' ? 'Sent' : 'Replies'}:{' '}
              <span className="font-semibold text-foreground">{entry.value}</span>
            </Typography>
          ))}
      </Stack>
    </Box>
  );
}

export default function WhatsappDashboardSendTrendChart({
  points,
  rangeSubtitle,
}: WhatsappDashboardSendTrendChartProps) {
  const chartData = useMemo<ChartRow[]>(
    () =>
      points.map((point) => ({
        label: formatTrendDateLabel(point.date),
        messagesSent: point.messagesSent,
        replies: point.replies,
      })),
    [points],
  );

  const maxValue = useMemo(
    () =>
      Math.max(
        ...chartData.flatMap((row) => [row.messagesSent, row.replies]),
        1,
      ),
    [chartData],
  );

  const hasActivity = chartData.some(
    (row) => row.messagesSent > 0 || row.replies > 0,
  );

  return (
    <Box className="dashboard-panel surface-panel rounded-2xl p-5 md:p-6">
      <Typography variant="subtitle1" className="font-semibold">
        Send volume
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mt-1">
        Campaign messages and replies — {rangeSubtitle}
      </Typography>

      {!hasActivity ? (
        <Box className="flex min-h-[240px] items-center justify-center">
          <Typography variant="body2" color="text.secondary" className="max-w-sm text-center">
            Activity will appear here once campaigns start sending.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: 260 }} className="mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid
                stroke="color-mix(in srgb, var(--foreground) 6%, transparent)"
                vertical={false}
                strokeDasharray="3 6"
              />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--color-secondary)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                domain={[0, Math.ceil(maxValue * 1.15)]}
                tick={{ fill: 'var(--color-secondary)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<TrendTooltip />} />
              <Legend
                verticalAlign="top"
                height={28}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="messagesSent"
                name="Sent"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 2, fill: '#10B981' }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="replies"
                name="Replies"
                stroke="#0EA5E9"
                strokeWidth={2}
                dot={{ r: 2, fill: '#0EA5E9' }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}
