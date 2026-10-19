'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { WhatsappDashboardSenderRow } from '@/lib/whatsapp/dashboard/types';
import type { WhatsappSenderConnectionStatus } from '@/lib/whatsapp/connections/types';

function statusChipColor(
  status: WhatsappSenderConnectionStatus,
): 'success' | 'warning' | 'default' | 'error' {
  if (status === 'ready') {
    return 'success';
  }
  if (
    status === 'failed' ||
    status === 'action_required' ||
    status === 'disconnected'
  ) {
    return 'error';
  }
  if (
    status === 'qr_ready' ||
    status === 'authenticating' ||
    status === 'initializing'
  ) {
    return 'warning';
  }
  return 'default';
}

function formatStatusLabel(status: WhatsappSenderConnectionStatus): string {
  return status.replace(/_/g, ' ');
}

function formatDailyUsage(row: WhatsappDashboardSenderRow): string {
  if (row.dailySendLimit == null) {
    return `${row.sendsTodayCount.toLocaleString()} today · no limit`;
  }
  const remaining = row.remainingDailyCapacity ?? 0;
  return `${row.sendsTodayCount.toLocaleString()} / ${row.dailySendLimit.toLocaleString()} today · ${remaining.toLocaleString()} left`;
}

interface WhatsappDashboardSendersPanelProps {
  senders: WhatsappDashboardSenderRow[];
}

export default function WhatsappDashboardSendersPanel({
  senders,
}: WhatsappDashboardSendersPanelProps) {
  return (
    <Box className="dashboard-panel surface-panel rounded-2xl p-5 md:p-6">
      <Typography variant="subtitle1" className="font-semibold">
        Senders
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mt-1">
        Campaign volume and daily capacity for your connected numbers
      </Typography>

      {senders.length === 0 ? (
        <Box className="flex min-h-[160px] items-center justify-center">
          <Typography variant="body2" color="text.secondary">
            Add a sender in WhatsApp settings to start campaigns.
          </Typography>
        </Box>
      ) : (
        <TableContainer className="mt-4">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sender</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Campaign messages</TableCell>
                <TableCell align="right">Daily usage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {senders.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="body2" className="font-medium">
                      {row.label}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={formatStatusLabel(row.status)}
                      color={statusChipColor(row.status)}
                      variant={row.status === 'ready' ? 'filled' : 'outlined'}
                      className="capitalize"
                    />
                  </TableCell>
                  <TableCell align="right" className="tabular-nums">
                    {row.messagesSent.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" color="text.secondary" className="tabular-nums">
                      {formatDailyUsage(row)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
