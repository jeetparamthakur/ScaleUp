'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import SequenceSetupChoice, {
  type SequenceSetupMode,
} from '@/components/email/campaigns/create/sequence/SequenceSetupChoice';
import WhatsappTemplateSelectField from '@/components/whatsapp/campaigns/shared/WhatsappTemplateSelectField';
import WhatsappSequenceEditor from '@/components/whatsapp/campaigns/sequence/WhatsappSequenceEditor';
import WhatsappSequenceTemplatePreview from '@/components/whatsapp/campaigns/sequence/WhatsappSequenceTemplatePreview';
import { useWhatsappTemplates } from '@/hooks/useWhatsappTemplates';
import type { WhatsappCampaignFollowUpDraft } from '@/lib/whatsapp/campaigns/sequence-types';
import { mapWhatsappTemplateToSequenceDrafts } from '@/lib/whatsapp/campaigns/template-mapping';
import { canProceedWhatsappSequenceStep } from '@/lib/whatsapp/campaigns/whatsapp-campaign-wizard-payload';
import { WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD } from '@/lib/whatsapp/campaigns/wizard-ui';

type SequencePhase =
  | 'choice'
  | 'template-select'
  | 'template-preview'
  | 'editor';

interface WhatsappCampaignSequenceStepProps {
  initialBody: string;
  onInitialBodyChange: (value: string) => void;
  followUps: WhatsappCampaignFollowUpDraft[];
  onFollowUpsChange: (value: WhatsappCampaignFollowUpDraft[]) => void;
  disabled?: boolean;
  onCanContinueChange: (value: boolean) => void;
}

function canContinueForPhase(
  phase: SequencePhase,
  initialBody: string,
  followUps: WhatsappCampaignFollowUpDraft[],
  selectedTemplateId: string,
): boolean {
  switch (phase) {
    case 'choice':
      return false;
    case 'template-select':
      return Boolean(selectedTemplateId);
    case 'template-preview':
      return true;
    case 'editor':
      return canProceedWhatsappSequenceStep(initialBody, followUps);
    default:
      return false;
  }
}

export default function WhatsappCampaignSequenceStep({
  initialBody,
  onInitialBodyChange,
  followUps,
  onFollowUpsChange,
  disabled = false,
  onCanContinueChange,
}: WhatsappCampaignSequenceStepProps) {
  const { templates, isLoading, refetch } = useWhatsappTemplates();
  const [phase, setPhase] = useState<SequencePhase>('choice');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [selectedTemplateId, templates],
  );

  useEffect(() => {
    onCanContinueChange(
      canContinueForPhase(phase, initialBody, followUps, selectedTemplateId),
    );
  }, [
    followUps,
    initialBody,
    onCanContinueChange,
    phase,
    selectedTemplateId,
  ]);

  function handleSetupChoice(mode: SequenceSetupMode) {
    if (mode === 'template') {
      setPhase('template-select');
      return;
    }

    setSelectedTemplateId('');
    onInitialBodyChange('');
    onFollowUpsChange([]);
    setPhase('editor');
  }

  function handleTemplateSelect(templateId: string) {
    if (!templateId) {
      return;
    }

    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    setSelectedTemplateId(templateId);
    const mapped = mapWhatsappTemplateToSequenceDrafts(template);
    onInitialBodyChange(mapped.initialBody);
    onFollowUpsChange(mapped.followUps);
    setPhase('template-preview');
  }

  function handleCustomize() {
    setPhase('editor');
  }

  function handleInnerBack() {
    if (phase === 'editor') {
      if (selectedTemplateId) {
        setPhase('template-preview');
        return;
      }

      setPhase('choice');
      return;
    }

    if (phase === 'template-preview') {
      setSelectedTemplateId('');
      setPhase('template-select');
      return;
    }

    if (phase === 'template-select') {
      setPhase('choice');
    }
  }

  const showInnerBack = phase !== 'choice';

  function renderPhaseIntro() {
    switch (phase) {
      case 'choice':
        return {
          title: 'How do you want to start?',
          description:
            'Choose a saved template or write your own WhatsApp sequence.',
        };
      case 'template-select':
        return {
          title: 'Pick a template',
          description: 'Select a saved sequence to pre-fill your messages.',
        };
      case 'editor':
        return {
          title: 'WhatsApp sequence',
        };
      default:
        return null;
    }
  }

  const intro = renderPhaseIntro();

  return (
    <Stack spacing={3}>
      {showInnerBack ? (
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleInnerBack}
          disabled={disabled}
          className="self-start rounded-2xl px-4"
        >
          Back
        </Button>
      ) : null}

      {intro ? (
        <Stack spacing={0.75}>
          <Typography variant="h6" component="h2" className="font-bold">
            {intro.title}
          </Typography>
          {intro.description ? (
            <Typography variant="body2" color="text.secondary">
              {intro.description}
            </Typography>
          ) : null}
        </Stack>
      ) : null}

      {phase === 'choice' ? (
        <SequenceSetupChoice onSelect={handleSetupChoice} />
      ) : null}

      {phase === 'template-select' ? (
        <Box className={WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD}>
          {templates.length === 0 && !isLoading ? (
            <Alert severity="info" className="rounded-xl">
              No saved templates yet. Start from scratch and use Save as template
              in the editor.
            </Alert>
          ) : (
            <WhatsappTemplateSelectField
              value={selectedTemplateId}
              onChange={handleTemplateSelect}
              templates={templates}
              isLoading={isLoading}
              disabled={disabled}
            />
          )}
        </Box>
      ) : null}

      {phase === 'template-preview' && selectedTemplate ? (
        <WhatsappSequenceTemplatePreview
          templateName={selectedTemplate.name}
          initialBody={initialBody}
          followUps={followUps}
          onCustomize={handleCustomize}
        />
      ) : null}

      {phase === 'editor' ? (
        <WhatsappSequenceEditor
          initialBody={initialBody}
          onInitialBodyChange={onInitialBodyChange}
          followUps={followUps}
          onFollowUpsChange={onFollowUpsChange}
          disabled={disabled}
          onTemplateSaved={refetch}
        />
      ) : null}
    </Stack>
  );
}
