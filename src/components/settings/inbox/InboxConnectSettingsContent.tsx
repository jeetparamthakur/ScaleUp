'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import WhatsAppConnectDialog from '@/components/settings/inbox/WhatsAppConnectDialog';
import { inboxChannels } from '@/lib/inbox/channels';
import {
  useWhatsappAvailability,
  useWhatsappConnection,
} from '@/hooks/useWhatsappInbox';

export default function InboxConnectSettingsContent() {
  const { data: availability } = useWhatsappAvailability();
  const {
    connection,
    isLoading,
    startConnect,
    isStarting,
    disconnect,
    isDisconnecting,
    refetch,
  } = useWhatsappConnection();
  const [qrOpen, setQrOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleWhatsappConnected = useCallback(() => {
    void refetch();
  }, [refetch]);

  async function handleConnect() {
    setActionError(null);
    try {
      if (connection?.status !== 'ready') {
        await startConnect();
      }
      setQrOpen(true);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to start WhatsApp connection',
      );
    }
  }

  async function handleDisconnectFromModal() {
    setActionError(null);
    await disconnect();
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Integrations"
        title="Connect inbox"
        description="Link social channels so conversations appear in your workspace Inbox."
      />

      {!availability?.available ? (
        <Alert severity="info">
          WhatsApp is not available yet. A platform administrator must configure
          OpenWA under Platform → WhatsApp / OpenWA.
        </Alert>
      ) : null}

      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inboxChannels.map(({ id, label, description, icon: Icon }) => {
          const isWhatsapp = id === 'whatsapp';
          const connected = isWhatsapp && connection?.status === 'ready';

          return (
            <Box
              key={id}
              className="settings-hub-card surface-panel flex h-full flex-col rounded-2xl p-5 md:p-6"
            >
              <Stack spacing={2.5} className="flex-1">
                <Box className="settings-hub-card-icon">
                  <Icon sx={{ fontSize: 22 }} aria-hidden />
                </Box>
                <Box className="min-w-0 flex-1">
                  <Stack direction="row" spacing={1} className="items-center">
                    <Typography
                      variant="subtitle1"
                      component="h2"
                      className="font-semibold text-foreground"
                    >
                      {label}
                    </Typography>
                    {connected ? (
                      <Chip label="Connected" size="small" color="success" />
                    ) : null}
                  </Stack>
                  <Typography
                    variant="body2"
                    className="mt-1.5 line-clamp-3 text-pretty text-muted"
                  >
                    {description}
                  </Typography>
                  {isWhatsapp && connection?.phone ? (
                    <Typography variant="caption" className="mt-2 block text-muted">
                      {connection.pushName ? `${connection.pushName} · ` : ''}
                      {connection.phone}
                    </Typography>
                  ) : null}
                </Box>

                {isWhatsapp ? (
                  <Button
                    variant={connected ? 'outlined' : 'contained'}
                    size="small"
                    className="self-start"
                    onClick={() => void handleConnect()}
                    disabled={
                      !availability?.available ||
                      isStarting ||
                      isLoading ||
                      isDisconnecting
                    }
                  >
                    {connected ? 'Manage connection' : 'Connect WhatsApp'}
                  </Button>
                ) : (
                  <Button variant="outlined" size="small" disabled className="self-start">
                    Coming soon
                  </Button>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>

      <WhatsAppConnectDialog
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onConnected={handleWhatsappConnected}
        onDisconnect={handleDisconnectFromModal}
        isDisconnecting={isDisconnecting}
      />
    </Stack>
  );
}
