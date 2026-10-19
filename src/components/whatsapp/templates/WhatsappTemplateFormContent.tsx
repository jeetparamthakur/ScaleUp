'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import WhatsappSequenceEditor from '@/components/whatsapp/campaigns/sequence/WhatsappSequenceEditor';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import FormAlert from '@/components/ui/FormAlert';
import {
  useWhatsappTemplate,
  useWhatsappTemplates,
} from '@/hooks/useWhatsappTemplates';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import { DEFAULT_WHATSAPP_INITIAL_BODY } from '@/lib/whatsapp/campaigns/sequence-defaults';
import type { WhatsappCampaignFollowUpDraft } from '@/lib/whatsapp/campaigns/sequence-types';
import {
  getSaveWhatsappTemplateValidationError,
  inferWhatsappTemplateType,
  mapWhatsappSequenceToCreateTemplateInput,
  mapWhatsappTemplateToSequenceDrafts,
} from '@/lib/whatsapp/campaigns/template-mapping';
import { whatsappTemplateMeta } from '@/lib/whatsapp/navigation';

interface WhatsappTemplateFormContentProps {
  mode: 'create' | 'edit';
  templateId?: string;
}

interface WhatsappTemplateFormSnapshot {
  name: string;
  description: string;
  visibility: 'private' | 'org';
  isActive: boolean;
  initialBody: string;
  followUps: WhatsappCampaignFollowUpDraft[];
}

function WhatsappTemplateFormInner({
  mode,
  templateId,
  initial,
}: {
  mode: 'create' | 'edit';
  templateId?: string;
  initial: WhatsappTemplateFormSnapshot;
}) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError } = useNotify();

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [visibility, setVisibility] = useState(initial.visibility);
  const [isActive, setIsActive] = useState(initial.isActive);
  const [initialBody, setInitialBody] = useState(initial.initialBody);
  const [followUps, setFollowUps] = useState(initial.followUps);

  const {
    createTemplate,
    updateTemplate,
    isCreating,
    isUpdating,
    error: mutationError,
  } = useWhatsappTemplates({ includeInactive: true });

  async function handleSubmit() {
    const validationError = getSaveWhatsappTemplateValidationError(
      initialBody,
      followUps,
      { name },
    );

    if (validationError) {
      notifyError(validationError);
      return;
    }

    const base = mapWhatsappSequenceToCreateTemplateInput(
      initialBody,
      followUps,
      { name },
    );

    const payload = {
      name: base.name,
      description: description.trim() || undefined,
      visibility,
      isActive,
      steps: base.steps,
      type: inferWhatsappTemplateType(base.steps.length),
    };

    try {
      if (mode === 'edit' && templateId) {
        await updateTemplate(templateId, payload);
      } else {
        await createTemplate(payload);
      }
      router.push(toOrgPath(whatsappTemplateMeta.href));
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to save template'));
    }
  }

  const isSaving = isCreating || isUpdating;

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline={whatsappTemplateMeta.pluralLabel}
        title={
          mode === 'create'
            ? 'Create WhatsApp template'
            : 'Edit WhatsApp template'
        }
        description={whatsappTemplateMeta.description}
        titleAction={
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
            }
            label="Active"
            title="Visible in campaign wizard dropdowns"
            className="mr-0"
          />
        }
        parentBack={{
          href: whatsappTemplateMeta.href,
          label: whatsappTemplateMeta.pluralLabel,
        }}
        showPlatformBackLink={false}
      />

      {mutationError ? <FormAlert message={mutationError} /> : null}

      <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          <Stack spacing={3}>
            <TextField
              label="Template name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
              className="rounded-xl"
            />
            <TextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
              multiline
              minRows={2}
              className="rounded-xl"
            />
            <TextField
              select
              label="Visibility"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as 'private' | 'org')
              }
              fullWidth
              className="rounded-xl"
            >
              <MenuItem value="private">Private (only you)</MenuItem>
              <MenuItem value="org">Organization (shared)</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Box>
        <Typography variant="subtitle1" className="mb-3 font-semibold">
          Message sequence
        </Typography>
        <WhatsappSequenceEditor
          initialBody={initialBody}
          onInitialBodyChange={setInitialBody}
          followUps={followUps}
          onFollowUpsChange={setFollowUps}
          disabled={isSaving}
          showSaveAsTemplate={false}
        />
      </Box>

      <Stack direction="row" spacing={1.5} className="justify-end">
        <Button
          component={Link}
          href={toOrgPath(whatsappTemplateMeta.href)}
          variant="outlined"
          className="rounded-2xl"
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={isSaving}
          className="rounded-2xl"
        >
          {isSaving
            ? 'Saving…'
            : mode === 'create'
              ? 'Create template'
              : 'Save changes'}
        </Button>
      </Stack>
    </Stack>
  );
}

export default function WhatsappTemplateFormContent({
  mode,
  templateId,
}: WhatsappTemplateFormContentProps) {
  const {
    data: template,
    isLoading: isLoadingTemplate,
    error: fetchError,
  } = useWhatsappTemplate(mode === 'edit' ? (templateId ?? null) : null);

  if (mode === 'edit' && isLoadingTemplate) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    );
  }

  if (mode === 'edit' && fetchError) {
    return <Alert severity="error">{fetchError}</Alert>;
  }

  if (mode === 'edit' && !template) {
    return <Alert severity="error">Template not found</Alert>;
  }

  const initial: WhatsappTemplateFormSnapshot =
    mode === 'edit' && template
      ? {
          name: template.name,
          description: template.description ?? '',
          visibility: template.visibility,
          isActive: template.isActive,
          ...mapWhatsappTemplateToSequenceDrafts(template),
        }
      : {
          name: '',
          description: '',
          visibility: 'private',
          isActive: true,
          initialBody: DEFAULT_WHATSAPP_INITIAL_BODY,
          followUps: [],
        };

  return (
    <WhatsappTemplateFormInner
      key={mode === 'edit' ? template?.id : 'create'}
      mode={mode}
      templateId={templateId}
      initial={initial}
    />
  );
}
