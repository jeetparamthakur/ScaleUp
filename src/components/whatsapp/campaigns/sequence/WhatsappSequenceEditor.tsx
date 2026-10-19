'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddFollowUpButton from '@/components/email/campaigns/create/sequence/AddFollowUpButton';
import WhatsappCampaignMessageEditor from '@/components/whatsapp/campaigns/WhatsappCampaignMessageEditor';
import WhatsappFollowUpCard from '@/components/whatsapp/campaigns/sequence/WhatsappFollowUpCard';
import WhatsappSaveAsTemplateBar from '@/components/whatsapp/campaigns/sequence/WhatsappSaveAsTemplateBar';
import {
  DEFAULT_WHATSAPP_FOLLOW_UP_BODY,
  DEFAULT_WHATSAPP_FOLLOW_UP_DELAY_DAYS,
} from '@/lib/whatsapp/campaigns/sequence-defaults';
import type { WhatsappCampaignFollowUpDraft } from '@/lib/whatsapp/campaigns/sequence-types';
import { WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD } from '@/lib/whatsapp/campaigns/wizard-ui';

interface WhatsappSequenceEditorProps {
  initialBody: string;
  onInitialBodyChange: (value: string) => void;
  followUps: WhatsappCampaignFollowUpDraft[];
  onFollowUpsChange: (value: WhatsappCampaignFollowUpDraft[]) => void;
  disabled?: boolean;
  onTemplateSaved?: () => Promise<unknown>;
  showSaveAsTemplate?: boolean;
}

function createFollowUpDraft(): WhatsappCampaignFollowUpDraft {
  return {
    id: crypto.randomUUID(),
    body: DEFAULT_WHATSAPP_FOLLOW_UP_BODY,
    delayMode: 'relative',
    delayDays: DEFAULT_WHATSAPP_FOLLOW_UP_DELAY_DAYS,
    scheduledDate: '',
  };
}

export default function WhatsappSequenceEditor({
  initialBody,
  onInitialBodyChange,
  followUps,
  onFollowUpsChange,
  disabled = false,
  onTemplateSaved,
  showSaveAsTemplate = true,
}: WhatsappSequenceEditorProps) {
  function handleAddFollowUp() {
    onFollowUpsChange([...followUps, createFollowUpDraft()]);
  }

  function handleUpdateFollowUp(
    index: number,
    next: WhatsappCampaignFollowUpDraft,
  ) {
    onFollowUpsChange(
      followUps.map((row, rowIndex) => (rowIndex === index ? next : row)),
    );
  }

  function handleRemoveFollowUp(index: number) {
    onFollowUpsChange(followUps.filter((_, rowIndex) => rowIndex !== index));
  }

  const sequenceMessageCount = 1 + followUps.length;
  const canShowSaveAsTemplate =
    showSaveAsTemplate && sequenceMessageCount >= 2;

  return (
    <Stack spacing={3}>
      <Box className={WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" className="font-semibold">
            Step 1 — Initial message
          </Typography>
          <WhatsappCampaignMessageEditor
            value={initialBody}
            onChange={onInitialBodyChange}
            disabled={disabled}
          />
        </Stack>
      </Box>

      {followUps.map((followUp, index) => (
        <WhatsappFollowUpCard
          key={followUp.id}
          followUp={followUp}
          stepNumber={index + 2}
          followUpIndex={index}
          disabled={disabled}
          onChange={(next) => handleUpdateFollowUp(index, next)}
          onRemove={() => handleRemoveFollowUp(index)}
        />
      ))}

      <AddFollowUpButton onClick={handleAddFollowUp} disabled={disabled} />

      {canShowSaveAsTemplate ? (
        <Box className={WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" className="font-semibold">
              Save as template
            </Typography>
            <WhatsappSaveAsTemplateBar
              initialBody={initialBody}
              followUps={followUps}
              onTemplateSaved={onTemplateSaved}
              disabled={disabled}
            />
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
}
