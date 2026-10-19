'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import WhatsappCrmProspectPicker from '@/components/whatsapp/contacts/crm/WhatsappCrmProspectPicker';
import type { WhatsappListVisibility } from '@/lib/whatsapp/lists/types';

export type WhatsappCrmProspectImportMode = 'create' | 'append';

interface WhatsappCrmProspectImportDialogProps {
  open: boolean;
  mode: WhatsappCrmProspectImportMode;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmitCreate: (input: {
    name: string;
    visibility: WhatsappListVisibility;
    prospectIds: string[];
  }) => Promise<void>;
  onSubmitAppend: (input: { prospectIds: string[] }) => Promise<void>;
}

export default function WhatsappCrmProspectImportDialog({
  open,
  mode,
  isSubmitting,
  error,
  onClose,
  onSubmitCreate,
  onSubmitAppend,
}: WhatsappCrmProspectImportDialogProps) {
  const [step, setStep] = useState<'details' | 'prospects'>(
    mode === 'append' ? 'prospects' : 'details',
  );
  const [name, setName] = useState('');
  const [visibility, setVisibility] =
    useState<WhatsappListVisibility>('org');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function reset() {
    setStep(mode === 'append' ? 'prospects' : 'details');
    setName('');
    setVisibility('org');
    setSelectedIds(new Set());
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handlePrimaryAction() {
    if (mode === 'create' && step === 'details') {
      if (!name.trim()) {
        return;
      }
      setStep('prospects');
      return;
    }

    const prospectIds = [...selectedIds];
    if (prospectIds.length === 0) {
      return;
    }

    if (mode === 'create') {
      await onSubmitCreate({
        name: name.trim(),
        visibility,
        prospectIds,
      });
    } else {
      await onSubmitAppend({ prospectIds });
    }

    reset();
  }

  const title =
    mode === 'create' ? 'Import list from CRM' : 'Add contacts from CRM';

  const primaryLabel =
    mode === 'create' && step === 'details'
      ? 'Next'
      : mode === 'create'
        ? 'Create list'
        : 'Add to list';

  const canProceed =
    mode === 'create' && step === 'details'
      ? name.trim().length > 0
      : selectedIds.size > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
      slotProps={{
        paper: { className: 'rounded-2xl' },
      }}
    >
      <DialogTitle className="font-bold">{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} className="pt-1">
          {error ? (
            <Alert severity="error" className="rounded-xl">
              {error}
            </Alert>
          ) : null}

          {mode === 'create' && step === 'details' ? (
            <>
              <TextField
                label="List name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                fullWidth
                autoFocus
              />
              <FormControl>
                <Typography variant="subtitle2" className="mb-1 font-semibold">
                  Visibility
                </Typography>
                <RadioGroup
                  row
                  value={visibility}
                  onChange={(event) =>
                    setVisibility(event.target.value as WhatsappListVisibility)
                  }
                >
                  <FormControlLabel
                    value="org"
                    control={<Radio />}
                    label="Organization"
                  />
                  <FormControlLabel
                    value="private"
                    control={<Radio />}
                    label="Private"
                  />
                </RadioGroup>
              </FormControl>
            </>
          ) : (
            <WhatsappCrmProspectPicker
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions className="flex-wrap gap-2 px-6 py-4">
        {step === 'prospects' && selectedIds.size > 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            className="mr-auto"
          >
            {selectedIds.size.toLocaleString()} contact
            {selectedIds.size === 1 ? '' : 's'} selected
          </Typography>
        ) : null}
        {mode === 'create' && step === 'prospects' ? (
          <Button
            onClick={() => setStep('details')}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            Back
          </Button>
        ) : (
          <Button onClick={handleClose} disabled={isSubmitting} className="rounded-xl">
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          onClick={() => void handlePrimaryAction()}
          disabled={!canProceed || isSubmitting}
          className="rounded-xl shadow-primary-soft"
        >
          {isSubmitting ? 'Saving…' : primaryLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
