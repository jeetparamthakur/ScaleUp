'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import WhatsappCrmProspectPicker from '@/components/whatsapp/contacts/crm/WhatsappCrmProspectPicker';
import type {
  CreateWhatsappListMemberInput,
  WhatsappListFieldSchema,
} from '@/lib/whatsapp/lists/detail-types';

type AddContactTab = 'manual' | 'crm';

interface AddWhatsappContactDialogProps {
  open: boolean;
  fieldSchema: WhatsappListFieldSchema;
  isSubmitting: boolean;
  isSubmittingFromCrm?: boolean;
  showCrmTab?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: CreateWhatsappListMemberInput) => Promise<void>;
  onSubmitFromCrm?: (input: { prospectIds: string[] }) => Promise<void>;
}

export default function AddWhatsappContactDialog({
  open,
  fieldSchema,
  isSubmitting,
  isSubmittingFromCrm = false,
  showCrmTab = false,
  error,
  onClose,
  onSubmit,
  onSubmitFromCrm,
}: AddWhatsappContactDialogProps) {
  const [tab, setTab] = useState<AddContactTab>('manual');
  const [phone, setPhone] = useState('');
  const [standardValues, setStandardValues] = useState<Record<string, string>>(
    {},
  );
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function resetForm() {
    setTab('manual');
    setPhone('');
    setStandardValues({});
    setCustomValues({});
    setSelectedIds(new Set());
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function buildInput(): CreateWhatsappListMemberInput {
    return {
      phone: phone.trim(),
      firstName: standardValues.firstName?.trim() || undefined,
      lastName: standardValues.lastName?.trim() || undefined,
      company: standardValues.company?.trim() || undefined,
      customFields: Object.fromEntries(
        Object.entries(customValues)
          .map(([key, value]) => [key, value.trim()])
          .filter(([, value]) => value),
      ),
    };
  }

  async function handleSubmitManual() {
    await onSubmit(buildInput());
    resetForm();
  }

  async function handleSubmitCrm() {
    if (!onSubmitFromCrm || selectedIds.size === 0) {
      return;
    }

    await onSubmitFromCrm({ prospectIds: [...selectedIds] });
    resetForm();
  }

  function renderField(key: string, label: string) {
    const isStandard = ['firstName', 'lastName', 'company'].includes(key);

    return (
      <TextField
        key={key}
        label={label}
        value={
          isStandard ? (standardValues[key] ?? '') : (customValues[key] ?? '')
        }
        onChange={(event) => {
          const value = event.target.value;
          if (isStandard) {
            setStandardValues((current) => ({ ...current, [key]: value }));
          } else {
            setCustomValues((current) => ({ ...current, [key]: value }));
          }
        }}
        fullWidth
      />
    );
  }

  const isCrmTab = showCrmTab && tab === 'crm';
  const dialogMaxWidth = isCrmTab ? 'lg' : 'sm';
  const busy = isSubmitting || isSubmittingFromCrm;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={dialogMaxWidth}
      scroll="paper"
    >
      <DialogTitle className="flex flex-col gap-2">
        <span>Add contact</span>
        {showCrmTab ? (
          <Tabs
            value={tab}
            onChange={(_event, value: AddContactTab) => setTab(value)}
            aria-label="Add contact method"
          >
            <Tab label="Manual entry" value="manual" />
            <Tab label="Search CRM" value="crm" />
          </Tabs>
        ) : null}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="pt-1">
          {error ? (
            <Alert severity="error" className="rounded-xl">
              {error}
            </Alert>
          ) : null}

          {isCrmTab ? (
            <WhatsappCrmProspectPicker
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
            />
          ) : (
            <>
              <TextField
                label={fieldSchema.phone.label}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                fullWidth
                autoFocus
              />
              {fieldSchema.fields.map((field) =>
                renderField(field.key, field.label),
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={handleClose} className="rounded-xl" disabled={busy}>
          Cancel
        </Button>
        {isCrmTab ? (
          <Button
            variant="contained"
            disabled={selectedIds.size === 0 || busy}
            onClick={() => void handleSubmitCrm()}
            className="rounded-xl shadow-primary-soft"
          >
            {isSubmittingFromCrm
              ? 'Adding…'
              : `Add ${selectedIds.size > 0 ? selectedIds.size : ''} contact${selectedIds.size === 1 ? '' : 's'}`}
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={!phone.trim() || isSubmitting}
            onClick={() => void handleSubmitManual()}
            className="rounded-xl shadow-primary-soft"
          >
            {isSubmitting ? 'Adding…' : 'Add contact'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
