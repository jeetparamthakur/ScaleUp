'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import AddWhatsappSenderDialog from '@/components/whatsapp/settings/AddWhatsappSenderDialog';
import EditWhatsappSenderDialog from '@/components/whatsapp/settings/EditWhatsappSenderDialog';
import WhatsappSenderDetailDrawer from '@/components/whatsapp/settings/WhatsappSenderDetailDrawer';
import { useWhatsappCampaigns } from '@/hooks/useWhatsappCampaigns';
import {
  useDisconnectWhatsappSenderConnection,
  useWhatsappModuleAvailability,
  useWhatsappSenderConnections,
} from '@/hooks/useWhatsappSenderConnections';
import type { WhatsappSenderConnection } from '@/lib/whatsapp/connections/types';
import { whatsappSenderConnectionsService } from '@/lib/api/services/whatsapp-sender-connections.service';
import type { WhatsappSenderConnectionStatus } from '@/lib/whatsapp/connections/types';
import {
  getWhatsappSenderResumeAction,
  getWhatsappSenderResumeActionLabel,
} from '@/lib/whatsapp/connections/sender-resume-action';

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

function formatDailyLimit(limit: number | null): string {
  if (limit == null) {
    return 'Unlimited';
  }
  return String(limit);
}

export default function WhatsappSettingsContent() {
  const { data: availability } = useWhatsappModuleAvailability();
  const {
    data: connections,
    error: listError,
    isLoading,
    refetch,
  } = useWhatsappSenderConnections({ refetchIntervalMs: 15000 });
  const { disconnect, isDisconnecting } = useDisconnectWhatsappSenderConnection();

  const [addOpen, setAddOpen] = useState(false);
  const [resumeConnectionId, setResumeConnectionId] = useState<string | null>(
    null,
  );
  const [skipDetailsOnReady, setSkipDetailsOnReady] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rowActionErrors, setRowActionErrors] = useState<
    Record<string, string>
  >({});
  const [resumingConnectionId, setResumingConnectionId] = useState<
    string | null
  >(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailConnection, setDetailConnection] =
    useState<WhatsappSenderConnection | null>(null);
  const [editConnection, setEditConnection] =
    useState<WhatsappSenderConnection | null>(null);

  const detailOpen = detailConnection != null;
  const { data: campaigns, isLoading: isLoadingCampaigns } = useWhatsappCampaigns();

  const linkedCampaignsForDetail = useMemo(() => {
    if (!detailConnection || !campaigns) {
      return [];
    }
    return campaigns
      .filter((campaign) =>
        campaign.senderConnectionIds.includes(detailConnection.id),
      )
      .map((campaign) => ({ id: campaign.id, name: campaign.name }));
  }, [campaigns, detailConnection]);

  const canManage = availability?.available;

  function openAddModal() {
    setResumeConnectionId(null);
    setSkipDetailsOnReady(false);
    setAddOpen(true);
  }

  function clearRowActionError(connectionId: string) {
    setRowActionErrors((previous) => {
      if (!(connectionId in previous)) {
        return previous;
      }
      const next = { ...previous };
      delete next[connectionId];
      return next;
    });
  }

  async function handleResumeConnection(connectionId: string) {
    clearRowActionError(connectionId);
    setResumingConnectionId(connectionId);
    try {
      const row = connections?.find((connection) => connection.id === connectionId);
      const isReconnect =
        row != null &&
        getWhatsappSenderResumeAction(row.status, row.phone) === 'reconnect';

      await whatsappSenderConnectionsService.startConnection(connectionId);
      setSkipDetailsOnReady(isReconnect);
      setResumeConnectionId(connectionId);
      setAddOpen(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not restore this connection';
      setRowActionErrors((previous) => ({
        ...previous,
        [connectionId]: message,
      }));
    } finally {
      setResumingConnectionId(null);
    }
  }

  function openDetail(row: WhatsappSenderConnection) {
    setDetailConnection(row);
  }

  function openEdit(row: WhatsappSenderConnection) {
    setEditConnection(row);
  }

  function handleSenderUpdated(updated: WhatsappSenderConnection) {
    void refetch();
    if (detailConnection?.id === updated.id) {
      setDetailConnection(updated);
    }
  }

  async function handleDelete(connectionId: string) {
    setActionError(null);
    setDeletingId(connectionId);
    try {
      await disconnect(connectionId);
      await refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to remove connection',
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Stack spacing={3}>
      <Box className="surface-panel rounded-2xl p-6 md:p-8">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          className="items-start justify-between"
        >
          <Box>
            <Typography variant="h6" component="h2" className="font-semibold text-foreground">
              WhatsApp numbers
            </Typography>
            <Typography variant="body2" className="mt-1 max-w-2xl text-pretty text-muted">
              Connect sender numbers for campaigns. Use Open WhatsApp (QR) today; Meta
              Cloud API is coming soon.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className="shrink-0 rounded-2xl"
            disabled={!canManage}
            onClick={openAddModal}
          >
            Add
          </Button>
        </Stack>
      </Box>

      {!availability?.available ? (
        <Alert severity="info">
          WhatsApp messaging is not available yet. Ask your platform administrator
          to enable the WhatsApp gateway for this workspace.
        </Alert>
      ) : null}

      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      {listError ? (
        <Alert severity="error">
          Could not load WhatsApp numbers: {listError}. Your connection may
          still exist — try refreshing the page.
        </Alert>
      ) : null}

      <Box className="surface-panel overflow-hidden rounded-2xl">
        {isLoading ? (
          <Stack className="items-center py-16">
            <CircularProgress size={28} />
          </Stack>
        ) : connections && connections.length > 0 ? (
          <TableContainer>
            <Table aria-label="WhatsApp sender connections">
              <TableHead>
                <TableRow>
                  <TableCell className="font-semibold">Name</TableCell>
                  <TableCell className="font-semibold">Phone</TableCell>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell className="font-semibold">Daily limit</TableCell>
                  <TableCell align="right" className="font-semibold">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections.map((row) => {
                  const resumeAction = getWhatsappSenderResumeAction(
                    row.status,
                    row.phone,
                  );
                  const resumeLabel =
                    getWhatsappSenderResumeActionLabel(resumeAction);
                  const rowActionError = rowActionErrors[row.id];

                  return (
                  <TableRow
                    key={row.id}
                    hover
                    className="cursor-pointer"
                    tabIndex={0}
                    aria-label={`View details for ${connectionLabel(row.displayName, row.pushName, row.phone)}`}
                    onClick={() => openDetail(row)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openDetail(row);
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" className="font-medium">
                        {connectionLabel(row.displayName, row.pushName, row.phone)}
                      </Typography>
                      {rowActionError ? (
                        <Typography variant="caption" color="error" className="mt-0.5 block">
                          {rowActionError}
                        </Typography>
                      ) : row.lastError ? (
                        <Typography variant="caption" color="error" className="mt-0.5 block">
                          {row.lastError}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="tabular-nums">
                        {formatPhone(row.phone)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatStatusLabel(row.status)}
                        size="small"
                        color={statusChipColor(row.status)}
                        variant={row.status === 'ready' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDailyLimit(row.dailySendLimit)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <Stack direction="row" spacing={0.5} className="justify-end">
                        {canManage ? (
                          <Tooltip title="Edit connection">
                            <span>
                              <IconButton
                                size="small"
                                aria-label="Edit connection"
                                onClick={() => openEdit(row)}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : null}
                        {row.status !== 'ready' ? (
                          <Tooltip
                            title={
                              resumingConnectionId === row.id
                                ? 'Connecting…'
                                : resumeLabel
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                color={
                                  resumeAction === 'reconnect'
                                    ? 'primary'
                                    : 'default'
                                }
                                aria-label={
                                  resumingConnectionId === row.id
                                    ? 'Connecting'
                                    : resumeLabel
                                }
                                disabled={
                                  !canManage || resumingConnectionId === row.id
                                }
                                onClick={() =>
                                  void handleResumeConnection(row.id)
                                }
                              >
                                {resumingConnectionId === row.id ? (
                                  <CircularProgress size={18} color="inherit" />
                                ) : resumeAction === 'reconnect' ? (
                                  <SyncOutlinedIcon fontSize="small" />
                                ) : (
                                  <PlayCircleOutlineOutlinedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : null}
                        <Tooltip title="Delete connection">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="Delete connection"
                              disabled={
                                !canManage ||
                                isDisconnecting ||
                                deletingId === row.id
                              }
                              onClick={() => void handleDelete(row.id)}
                            >
                              {deletingId === row.id ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                <DeleteOutlineOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : listError ? (
          <Stack spacing={1} className="px-6 py-12 text-center">
            <Typography variant="subtitle1" className="font-semibold text-foreground">
              Numbers unavailable
            </Typography>
            <Typography variant="body2" className="text-muted">
              Fix the error above, then refresh to see your senders again.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1} className="px-6 py-12 text-center">
            <Typography variant="subtitle1" className="font-semibold text-foreground">
              No numbers linked yet
            </Typography>
            <Typography variant="body2" className="text-muted">
              Click Add to connect a number with Open WhatsApp (QR).
            </Typography>
          </Stack>
        )}
      </Box>

      <AddWhatsappSenderDialog
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setResumeConnectionId(null);
          setSkipDetailsOnReady(false);
        }}
        onCompleted={() => void refetch()}
        resumeConnectionId={resumeConnectionId}
        skipDetailsOnReady={skipDetailsOnReady}
      />

      <WhatsappSenderDetailDrawer
        open={detailOpen}
        onClose={() => setDetailConnection(null)}
        connection={detailConnection}
        linkedCampaigns={linkedCampaignsForDetail}
        isLoadingCampaigns={isLoadingCampaigns && detailOpen}
        canEdit={Boolean(canManage)}
        onEdit={
          detailConnection
            ? () => {
                openEdit(detailConnection);
              }
            : undefined
        }
      />

      <EditWhatsappSenderDialog
        open={editConnection != null}
        onClose={() => setEditConnection(null)}
        connection={editConnection}
        onSaved={handleSenderUpdated}
      />
    </Stack>
  );
}
