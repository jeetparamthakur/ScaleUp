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
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';

export interface WhatsappConnectQrQuery {
  data?: {
    status?: string;
    qrCode?: string | null;
    phone?: string | null;
    pushName?: string | null;
  };
  error?: string | null;
  isLoading: boolean;
  isFetching: boolean;
}

interface WhatsappConnectDialogProps {
  open: boolean;
  onClose: () => void;
  onConnected: () => void;
  onDisconnect: () => Promise<void>;
  isDisconnecting: boolean;
  qrQuery: WhatsappConnectQrQuery;
  connectedHelperText: string;
}

function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 10) {
    return phone;
  }
  return `+${digits}`;
}

export default function WhatsappConnectDialog({
  open,
  onClose,
  onConnected,
  onDisconnect,
  isDisconnecting,
  qrQuery,
  connectedHelperText,
}: WhatsappConnectDialogProps) {
  const [disconnectError, setDisconnectError] = useState<string | null>(null);

  const status = qrQuery.data?.status;
  const isReady = status === 'ready';
  const phone = qrQuery.data?.phone;
  const pushName = qrQuery.data?.pushName;

  const hasNotifiedConnectedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasNotifiedConnectedRef.current = false;
      return;
    }

    if (!isReady) {
      hasNotifiedConnectedRef.current = false;
      return;
    }

    if (hasNotifiedConnectedRef.current) {
      return;
    }

    hasNotifiedConnectedRef.current = true;
    onConnected();
  }, [open, isReady, onConnected]);

  function handleClose() {
    if (isDisconnecting) {
      return;
    }
    setDisconnectError(null);
    onClose();
  }

  async function handleDeleteSession() {
    setDisconnectError(null);
    try {
      await onDisconnect();
      onClose();
    } catch (err) {
      setDisconnectError(
        err instanceof Error ? err.message : 'Failed to remove WhatsApp session',
      );
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isReady ? 'WhatsApp connected' : 'Connect WhatsApp'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} className="items-center py-1">
          {qrQuery.error ? (
            <Alert severity="error" className="w-full">
              {qrQuery.error}
            </Alert>
          ) : null}

          {disconnectError ? (
            <Alert severity="error" className="w-full">
              {disconnectError}
            </Alert>
          ) : null}

          {isReady ? (
            <Stack spacing={1.5} className="w-full items-center py-2">
              <CheckCircleOutlinedIcon
                color="success"
                sx={{ fontSize: 48 }}
                aria-hidden
              />
              <Typography variant="subtitle1" className="font-semibold text-foreground">
                {pushName ?? 'Your WhatsApp'}
              </Typography>
              {phone ? (
                <Typography variant="body1" className="text-foreground">
                  {formatWhatsAppPhone(phone)}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Linked successfully. Your number will appear shortly.
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" className="text-center">
                {connectedHelperText}
              </Typography>
            </Stack>
          ) : (
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
                    {qrQuery.isLoading || qrQuery.isFetching
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
                Open WhatsApp on your phone, go to{' '}
                <span className="font-medium text-foreground">Linked devices</span>
                , and scan this QR code.
              </Typography>
              {status ? (
                <Typography variant="caption" color="text.secondary">
                  Status: {status.replace(/_/g, ' ')}
                </Typography>
              ) : null}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        {isReady ? (
          <>
            <Button
              color="error"
              variant="outlined"
              onClick={() => void handleDeleteSession()}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? 'Removing…' : 'Delete session'}
            </Button>
            <Button variant="contained" onClick={handleClose} disabled={isDisconnecting}>
              Done
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} disabled={isDisconnecting}>
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
