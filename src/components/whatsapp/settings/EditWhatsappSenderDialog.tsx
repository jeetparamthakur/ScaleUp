'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { whatsappSenderConnectionsService } from '@/lib/api/services/whatsapp-sender-connections.service';
import type { WhatsappSenderConnection } from '@/lib/whatsapp/connections/types';

interface EditWhatsappSenderDialogProps {
  open: boolean;
  onClose: () => void;
  connection: WhatsappSenderConnection | null;
  onSaved: (updated: WhatsappSenderConnection) => void;
}

function formatPhone(phone: string | null): string {
  if (!phone) {
    return '—';
  }
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? `+${digits}` : phone;
}

function EditWhatsappSenderDialogBody({
  connection,
  onClose,
  onSaved,
}: {
  connection: WhatsappSenderConnection;
  onClose: () => void;
  onSaved: (updated: WhatsappSenderConnection) => void;
}) {
  const [displayName, setDisplayName] = useState(
    () => connection.displayName?.trim() ?? '',
  );
  const [dailyLimit, setDailyLimit] = useState(() =>
    connection.dailySendLimit == null ? '' : String(connection.dailySendLimit),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
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

      const updated = await whatsappSenderConnectionsService.updateConnection(
        connection.id,
        {
          displayName: displayName.trim() || undefined,
          dailySendLimit: parsedLimit,
        },
      );

      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="edit-whatsapp-sender-title"
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
        <Typography
          id="edit-whatsapp-sender-title"
          variant="h6"
          component="h2"
          className="font-semibold text-foreground"
        >
          Edit WhatsApp number
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1 tabular-nums">
          {formatPhone(connection.phone)}
        </Typography>
      </DialogTitle>
      <DialogContent className="px-6">
        <Stack spacing={2.5} className="py-1">
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Connection name"
            placeholder={connection.pushName?.trim() || 'e.g. Sales line 1'}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            fullWidth
            autoFocus
            helperText="A label you will recognize in campaigns and the inbox"
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
      </DialogContent>
      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} disabled={isSaving} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="rounded-xl"
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function EditWhatsappSenderDialog({
  open,
  onClose,
  connection,
  onSaved,
}: EditWhatsappSenderDialogProps) {
  if (!open || !connection) {
    return null;
  }

  return (
    <EditWhatsappSenderDialogBody
      key={connection.id}
      connection={connection}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
