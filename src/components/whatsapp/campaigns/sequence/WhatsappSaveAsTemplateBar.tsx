'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import { Input } from '@/components/ui/inputs';
import SaveAsTemplateDialog from '@/components/email/campaigns/create/sequence/SaveAsTemplateDialog';
import { useNotify } from '@/hooks/useNotify';
import { useWhatsappTemplates } from '@/hooks/useWhatsappTemplates';
import type { WhatsappCampaignFollowUpDraft } from '@/lib/whatsapp/campaigns/sequence-types';
import {
  getSaveWhatsappTemplateValidationError,
  mapWhatsappSequenceToCreateTemplateInput,
} from '@/lib/whatsapp/campaigns/template-mapping';
interface WhatsappSaveAsTemplateBarProps {
  initialBody: string;
  followUps: WhatsappCampaignFollowUpDraft[];
  onTemplateSaved?: () => Promise<unknown>;
  disabled?: boolean;
}

export default function WhatsappSaveAsTemplateBar({
  initialBody,
  followUps,
  onTemplateSaved,
  disabled = false,
}: WhatsappSaveAsTemplateBarProps) {
  const { createTemplate, isCreating } = useWhatsappTemplates();
  const { notifySuccess, notifyError } = useNotify();
  const [templateName, setTemplateName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const trimmedName = templateName.trim();
  const canOpenDialog = Boolean(trimmedName) && !isCreating && !disabled;

  function handleCloseDialog() {
    if (isCreating) {
      return;
    }

    setDialogOpen(false);
  }

  async function handleConfirm() {
    const validationError = getSaveWhatsappTemplateValidationError(
      initialBody,
      followUps,
      { name: trimmedName },
    );

    if (validationError) {
      notifyError(validationError);
      return;
    }

    try {
      const payload = mapWhatsappSequenceToCreateTemplateInput(
        initialBody,
        followUps,
        { name: trimmedName },
      );
      await createTemplate(payload);
      await onTemplateSaved?.();

      notifySuccess(`Template "${trimmedName}" saved`);
      setTemplateName('');
      setDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save template';
      notifyError(message);
    }
  }

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        className="w-full"
        sx={{ alignItems: { xs: 'stretch', sm: 'flex-end' } }}
      >
        <Box className="min-w-0 w-full flex-1">
          <Input
            id="whatsapp-save-template-name"
            label="Template name"
            placeholder="e.g. Insurance ops outreach"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
            disabled={isCreating || disabled}
            spellCheck={false}
            autoComplete="off"
            fieldClassName="w-full min-w-0"
          />
        </Box>
        <Button
          type="button"
          variant="outlined"
          onClick={() => setDialogOpen(true)}
          disabled={!canOpenDialog}
          className="w-fit shrink-0 self-start rounded-xl sm:self-auto"
          sx={{
            height: 'var(--control-height)',
            minWidth: 'unset',
            px: 2,
            whiteSpace: 'nowrap',
          }}
        >
          Save template
        </Button>
      </Stack>

      <SaveAsTemplateDialog
        open={dialogOpen}
        templateName={trimmedName}
        isSaving={isCreating}
        onClose={handleCloseDialog}
        onConfirm={() => void handleConfirm()}
      />
    </>
  );
}
