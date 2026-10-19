'use client';

import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type {
  WhatsappSenderConnection,
  WhatsappSenderConnectionStatus,
} from '@/lib/whatsapp/connections/types';
import { getInitials } from '@/lib/inbox/getInitials';

function formatPhone(phone: string | null): string {
  if (!phone) {
    return '—';
  }
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? `+${digits}` : phone;
}

function connectionLabel(
  displayName: string | null,
  pushName: string | null,
  phone: string | null,
): string {
  if (displayName?.trim()) {
    return displayName.trim();
  }
  if (pushName?.trim()) {
    return pushName.trim();
  }
  if (phone) {
    return formatPhone(phone);
  }
  return 'WhatsApp number';
}

function statusChipColor(
  status: WhatsappSenderConnectionStatus,
): 'success' | 'warning' | 'default' | 'error' {
  if (status === 'ready') {
    return 'success';
  }
  if (status === 'failed' || status === 'action_required') {
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

function formatDailyLimit(limit: number | null): string {
  if (limit == null) {
    return 'Unlimited';
  }
  return String(limit);
}

function formatCreatedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

interface WhatsappSenderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  connection: WhatsappSenderConnection | null;
  linkedCampaigns: { id: string; name: string }[];
  isLoadingCampaigns?: boolean;
  canEdit?: boolean;
  onEdit?: () => void;
}

function MetricTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof SendOutlinedIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Box className="dashboard-panel flex min-w-0 flex-1 flex-col rounded-2xl p-4">
      <Box className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
        <Icon sx={{ fontSize: 20 }} aria-hidden />
      </Box>
      <Typography variant="caption" color="text.secondary" className="block">
        {label}
      </Typography>
      <Typography variant="h5" component="p" className="mt-0.5 font-bold tabular-nums">
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary" className="mt-1 block">
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      className="items-baseline justify-between gap-3 py-2.5"
    >
      <Typography variant="body2" color="text.secondary" className="shrink-0">
        {label}
      </Typography>
      <Typography variant="body2" className="min-w-0 text-right font-medium text-foreground">
        {value}
      </Typography>
    </Stack>
  );
}

export default function WhatsappSenderDetailDrawer({
  open,
  onClose,
  connection,
  linkedCampaigns,
  isLoadingCampaigns = false,
  canEdit = false,
  onEdit,
}: WhatsappSenderDetailDrawerProps) {
  if (!connection) {
    return null;
  }

  const title = connectionLabel(
    connection.displayName,
    connection.pushName,
    connection.phone,
  );
  const initials = getInitials(title);
  const limit = connection.dailySendLimit;
  const sentToday = connection.sendsTodayCount;
  const remaining = connection.remainingDailyCapacity;
  const usagePercent =
    limit != null && limit > 0 ? Math.min(100, (sentToday / limit) * 100) : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: 'w-full max-w-lg bg-surface',
        },
      }}
    >
      <Box className="relative flex h-full flex-col">
        <Box
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-500/[0.12] via-emerald-500/[0.04] to-transparent"
          aria-hidden
        />

        <Stack
          direction="row"
          spacing={0.5}
          className="relative shrink-0 items-start justify-end px-4 pt-4 sm:px-5"
        >
          {canEdit && onEdit ? (
            <IconButton
              size="small"
              onClick={onEdit}
              aria-label="Edit WhatsApp number"
              className="text-muted hover:bg-foreground/5"
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          ) : null}
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Close sender details"
            className="text-muted hover:bg-foreground/5"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box className="relative flex-1 overflow-y-auto px-5 pb-6 pt-1 sm:px-6">
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} className="items-center">
              <Box
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-semibold text-white shadow-md shadow-emerald-900/20"
                aria-hidden
              >
                {initials || <WhatsAppIcon />}
              </Box>
              <Box className="min-w-0 flex-1">
                <Typography
                  id="whatsapp-sender-detail-title"
                  variant="h6"
                  component="h2"
                  className="truncate font-semibold text-foreground"
                >
                  {title}
                </Typography>
                <Typography variant="body2" className="mt-0.5 tabular-nums text-muted">
                  {formatPhone(connection.phone)}
                </Typography>
                <Box className="mt-2">
                  <Chip
                    label={formatStatusLabel(connection.status)}
                    size="small"
                    color={statusChipColor(connection.status)}
                    variant={connection.status === 'ready' ? 'filled' : 'outlined'}
                  />
                </Box>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <MetricTile
                icon={SendOutlinedIcon}
                label="Sent today"
                value={String(sentToday)}
                hint={
                  limit != null
                    ? `${formatDailyLimit(limit)} daily cap`
                    : 'No daily cap set'
                }
              />
              <MetricTile
                icon={SpeedOutlinedIcon}
                label="Remaining today"
                value={remaining == null ? '∞' : String(remaining)}
                hint={limit == null ? 'Unlimited sends' : 'Until midnight UTC'}
              />
            </Stack>

            {usagePercent != null ? (
              <Box>
                <Stack direction="row" className="mb-1 items-center justify-between">
                  <Typography variant="caption" color="text.secondary">
                    Daily usage
                  </Typography>
                  <Typography variant="caption" className="tabular-nums text-muted">
                    {sentToday} / {limit}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={usagePercent}
                  className="h-2 rounded-full"
                  color={usagePercent >= 90 ? 'warning' : 'success'}
                />
              </Box>
            ) : null}

            {connection.lastError ? (
              <Alert severity="error" className="rounded-xl">
                {connection.lastError}
              </Alert>
            ) : null}

            <Box className="dashboard-panel rounded-2xl px-4 py-1">
              <Typography
                variant="subtitle2"
                className="px-0 py-3 font-semibold text-foreground"
              >
                Details
              </Typography>
              <DetailRow label="Display name" value={connection.displayName?.trim() || '—'} />
              <DetailRow
                label="WhatsApp profile"
                value={connection.pushName?.trim() || '—'}
              />
              <DetailRow label="Daily limit" value={formatDailyLimit(limit)} />
              <DetailRow label="Connected" value={formatCreatedAt(connection.createdAt)} />
              <DetailRow
                label="Gateway"
                value={connection.openWaAvailable ? 'Open WhatsApp (QR)' : 'Unavailable'}
              />
            </Box>

            <Box className="dashboard-panel rounded-2xl p-4">
              <Stack direction="row" spacing={1} className="mb-3 items-center">
                <CampaignOutlinedIcon
                  className="text-muted"
                  sx={{ fontSize: 20 }}
                  aria-hidden
                />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Connected campaigns
                </Typography>
              </Stack>

              {isLoadingCampaigns ? (
                <Stack className="items-center py-6">
                  <CircularProgress size={24} />
                </Stack>
              ) : linkedCampaigns.length > 0 ? (
                <Stack spacing={1} component="ul" className="m-0 list-none p-0">
                  {linkedCampaigns.map((campaign) => (
                    <Box
                      key={campaign.id}
                      component="li"
                      className="rounded-xl border border-border/60 bg-surface px-3 py-2.5 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]"
                    >
                      <Typography variant="body2" className="font-medium text-foreground">
                        {campaign.name}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Stack spacing={0.5} className="py-2 text-center">
                  <Typography variant="body2" className="font-medium text-foreground">
                    No campaigns yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="text-pretty">
                    When you assign this number to a WhatsApp campaign, its name will show up
                    here.
                  </Typography>
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
