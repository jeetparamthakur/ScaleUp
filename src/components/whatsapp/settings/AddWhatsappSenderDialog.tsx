'use client';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { invalidateQuery } from '@/hooks/api';
import { useWhatsappSenderQr } from '@/hooks/useWhatsappSenderConnections';
import { whatsappSenderConnectionsService } from '@/lib/api/services/whatsapp-sender-connections.service';

type AddSenderStep = 'openwa-qr' | 'openwa-details';

interface AddWhatsappSenderDialogProps {
  open: boolean;
  onClose: () => void;
  onCompleted: () => void;
  resumeConnectionId?: string | null;
  /** When true (reconnect), close after QR succeeds without asking for name/limit. */
  skipDetailsOnReady?: boolean;
}

function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? `+${digits}` : phone;
}

interface AddWhatsappSenderDialogBodyProps {
  open: boolean;
  onClose: () => void;
  onCompleted: () => void;
  resumeConnectionId: string | null;
  skipDetailsOnReady: boolean;
}

function AddWhatsappSenderDialogBody({
  open,
  onClose,
  onCompleted,
  resumeConnectionId,
  skipDetailsOnReady,
}: AddWhatsappSenderDialogBodyProps) {
  const [step] = useState<AddSenderStep>('openwa-qr');
  const [connectionId, setConnectionId] = useState<string | null>(
    resumeConnectionId,
  );
  const [isStartingConnection, setIsStartingConnection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const qrEnabled = step === 'openwa-qr' && Boolean(connectionId);
  const qrQuery = useWhatsappSenderQr(connectionId, qrEnabled);

  const isReady = qrQuery.data?.status === 'ready';
  const phone = qrQuery.data?.phone;
  const pushName = qrQuery.data?.pushName;

  const hasAutoCompletedReconnectRef = useRef(false);
  const hasAutoStartedNewConnectionRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasAutoCompletedReconnectRef.current = false;
      hasAutoStartedNewConnectionRef.current = false;
      return;
    }
    if (!skipDetailsOnReady || !isReady || hasAutoCompletedReconnectRef.current) {
      return;
    }
    hasAutoCompletedReconnectRef.current = true;
    onCompleted();
    onClose();
  }, [open, skipDetailsOnReady, isReady, onCompleted, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (resumeConnectionId || connectionId) {
      return;
    }
    if (hasAutoStartedNewConnectionRef.current) {
      return;
    }
    hasAutoStartedNewConnectionRef.current = true;

    void (async () => {
      setError(null);
      setIsStartingConnection(true);
      try {
        const created =
          await whatsappSenderConnectionsService.createConnection();
        invalidateQuery('whatsapp.connections');
        setConnectionId(created.id);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to start WhatsApp connection',
        );
      } finally {
        setIsStartingConnection(false);
      }
    })();
  }, [open, resumeConnectionId, connectionId]);

  const shownStep: AddSenderStep =
    step === 'openwa-qr' && isReady && !skipDetailsOnReady
      ? 'openwa-details'
      : step;

  async function handleSaveDetails() {
    if (!connectionId) {
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const parsedLimit =
        dailyLimit.trim() === '' ? null : Number.parseInt(dailyLimit, 10);
      if (
        parsedLimit !== null &&
        (!Number.isFinite(parsedLimit) || parsedLimit < 1)
      ) {
        setError('Daily limit must be a positive number or empty for unlimited.');
        return;
      }

      await whatsappSenderConnectionsService.updateConnection(connectionId, {
        displayName: displayName.trim() || undefined,
        dailySendLimit: parsedLimit,
      });

      onCompleted();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save connection details',
      );
    } finally {
      setIsSaving(false);
    }
  }

  const title =
    shownStep === 'openwa-qr'
      ? skipDetailsOnReady
        ? 'Reconnect WhatsApp'
        : 'Scan QR code'
      : 'Connection details';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          className:
            'overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-foreground/10 sm:rounded-3xl',
          elevation: 0,
        },
        backdrop: {
          className: 'bg-foreground/25 backdrop-blur-[2px]',
        },
      }}
    >
      <DialogTitle component="div" className="px-6 pt-6 pb-2">
        <Typography variant="h6" component="h2" className="font-semibold text-foreground">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent className="px-6">
        <Stack spacing={2.5} className="py-1">
          {error ? <Alert severity="error">{error}</Alert> : null}

          {shownStep === 'openwa-qr' ? (
            <Stack spacing={2} className="items-center">
              {skipDetailsOnReady && isReady ? (
                <Stack spacing={1} className="items-center py-6">
                  <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 48 }} />
                  <Typography variant="subtitle1" className="font-semibold">
                    WhatsApp reconnected
                  </Typography>
                  {phone ? (
                    <Typography variant="body2">
                      {formatWhatsAppPhone(phone)}
                    </Typography>
                  ) : null}
                </Stack>
              ) : null}
              {qrQuery.error ? (
                <Alert severity="error" className="w-full">
                  {qrQuery.error}
                </Alert>
              ) : null}

              {!skipDetailsOnReady || !isReady ? (
                <>
                  {qrQuery.data?.qrCode ? (
                    <Box
                      component="img"
                      src={qrQuery.data.qrCode}
                      alt="WhatsApp QR code"
                      className="max-w-[280px] rounded-xl border border-border bg-white p-2"
                    />
                  ) : (
                    <Stack spacing={1} className="items-center py-8">
                      <CircularProgress size={32} />
                      <Typography variant="body2" color="text.secondary">
                        {isStartingConnection || !connectionId
                          ? 'Starting connection…'
                          : qrQuery.isLoading || qrQuery.isFetching
                            ? 'Preparing QR code…'
                            : 'Waiting for QR code…'}
                      </Typography>
                    </Stack>
                  )}

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="text-center"
                  >
                    Open WhatsApp → Linked devices → Scan this code.
                  </Typography>
                  {qrQuery.data?.status ? (
                    <Typography variant="caption" color="text.secondary">
                      Status: {qrQuery.data.status.replace(/_/g, ' ')}
                    </Typography>
                  ) : null}
                </>
              ) : null}
            </Stack>
          ) : null}

          {shownStep === 'openwa-details' ? (
            <Stack spacing={2}>
              <Stack spacing={1} className="items-center py-2">
                <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 48 }} />
                <Typography variant="subtitle1" className="font-semibold">
                  WhatsApp connected
                </Typography>
                {phone ? (
                  <Typography variant="body2">{formatWhatsAppPhone(phone)}</Typography>
                ) : null}
              </Stack>

              <TextField
                label="Connection name"
                placeholder={pushName || 'e.g. Sales line 1'}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                fullWidth
                helperText="A label you will recognize in the campaigns table"
              />

              <TextField
                label="Daily message limit"
                type="number"
                placeholder="Unlimited"
                value={dailyLimit}
                onChange={(event) => setDailyLimit(event.target.value)}
                fullWidth
                helperText="Leave empty for no daily cap on this number"
              />
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 py-4">
        {shownStep === 'openwa-qr' ? (
          <Button onClick={onClose} disabled={isStartingConnection} color="inherit">
            Cancel
          </Button>
        ) : null}

        {shownStep === 'openwa-details' ? (
          <>
            <Button onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={isSaving}
              onClick={() => void handleSaveDetails()}
            >
              {isSaving ? 'Saving…' : 'Save & finish'}
            </Button>
          </>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

export default function AddWhatsappSenderDialog({
  open,
  onClose,
  onCompleted,
  resumeConnectionId = null,
  skipDetailsOnReady = false,
}: AddWhatsappSenderDialogProps) {
  const dialogInstanceKey = `${resumeConnectionId ?? 'new'}:${skipDetailsOnReady ? 'reconnect' : 'setup'}`;

  if (!open) {
    return null;
  }

  return (
    <AddWhatsappSenderDialogBody
      key={dialogInstanceKey}
      open={open}
      resumeConnectionId={resumeConnectionId}
      skipDetailsOnReady={skipDetailsOnReady}
      onClose={onClose}
      onCompleted={onCompleted}
    />
  );
}
