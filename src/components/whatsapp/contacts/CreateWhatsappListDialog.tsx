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

interface CreateWhatsappListDialogProps {
  open: boolean;
  isSubmitting: boolean;
  error?: string | null;
  showCrmStep?: boolean;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    visibility: WhatsappListVisibility;
    prospectIds?: string[];
  }) => Promise<void>;
}

export default function CreateWhatsappListDialog({
  open,
  isSubmitting,
  error,
  showCrmStep = false,
  onClose,
  onSubmit,
}: CreateWhatsappListDialogProps) {
  const [step, setStep] = useState<'details' | 'contacts'>('details');
  const [name, setName] = useState('');
  const [visibility, setVisibility] =
    useState<WhatsappListVisibility>('org');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function reset() {
    setStep('details');
    setName('');
    setVisibility('org');
    setSelectedIds(new Set());
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleCreateEmpty() {
    await onSubmit({ name: name.trim(), visibility });
    reset();
  }

  async function handleCreateWithProspects() {
    await onSubmit({
      name: name.trim(),
      visibility,
      prospectIds: [...selectedIds],
    });
    reset();
  }

  async function handleDetailsNext() {
    if (!name.trim()) {
      return;
    }

    if (showCrmStep) {
      setStep('contacts');
      return;
    }

    await handleCreateEmpty();
  }

  const isContactsStep = showCrmStep && step === 'contacts';
  const dialogMaxWidth = isContactsStep ? 'lg' : 'sm';
  const title = isContactsStep ? 'Add contacts from CRM' : 'Create list';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={dialogMaxWidth}
      scroll="paper"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} className="pt-1">
          {error ? (
            <Alert severity="error" className="rounded-xl">
              {error}
            </Alert>
          ) : null}

          {!isContactsStep ? (
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
                    label="Only me"
                  />
                </RadioGroup>
              </FormControl>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                Search and select CRM contacts below, or skip to create an empty
                list.
              </Typography>
              <WhatsappCrmProspectPicker
                selectedIds={selectedIds}
                onSelectedIdsChange={setSelectedIds}
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        {isContactsStep ? (
          <Button
            onClick={() => setStep('details')}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            Back
          </Button>
        ) : (
          <Button onClick={handleClose} className="rounded-xl">
            Cancel
          </Button>
        )}

        {isContactsStep ? (
          <>
            <Button
              onClick={() => void handleCreateEmpty()}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Skip — empty list
            </Button>
            <Button
              variant="contained"
              disabled={selectedIds.size === 0 || isSubmitting}
              onClick={() => void handleCreateWithProspects()}
              className="rounded-xl shadow-primary-soft"
            >
              {isSubmitting ? 'Creating…' : 'Create with contacts'}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            disabled={!name.trim() || isSubmitting}
            onClick={() => void handleDetailsNext()}
            className="rounded-xl shadow-primary-soft"
          >
            {isSubmitting
              ? 'Creating…'
              : showCrmStep
                ? 'Next'
                : 'Create list'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
