import type { CreateWhatsappTemplateInput, WhatsappTemplate } from '@/lib/api';
import {
  DEFAULT_WHATSAPP_FOLLOW_UP_DELAY_DAYS,
  DEFAULT_WHATSAPP_INITIAL_BODY,
} from '@/lib/whatsapp/campaigns/sequence-defaults';
import type { WhatsappCampaignFollowUpDraft } from '@/lib/whatsapp/campaigns/sequence-types';
import { buildWhatsappCampaignSteps } from '@/lib/whatsapp/campaigns/whatsapp-campaign-wizard-payload';

export function inferWhatsappTemplateType(
  stepCount: number,
): CreateWhatsappTemplateInput['type'] {
  return stepCount <= 1 ? 'single' : 'sequence';
}

export function mapWhatsappTemplateToSequenceDrafts(template: WhatsappTemplate): {
  initialBody: string;
  followUps: WhatsappCampaignFollowUpDraft[];
} {
  const sorted = [...template.steps].sort((a, b) => a.stepOrder - b.stepOrder);
  const initial = sorted[0];

  return {
    initialBody: initial?.body ?? DEFAULT_WHATSAPP_INITIAL_BODY,
    followUps: sorted.slice(1).map((step) => ({
      id: crypto.randomUUID(),
      body: step.body,
      delayMode: step.delayMode ?? 'relative',
      delayDays:
        step.delayMode === 'relative'
          ? (step.delayDays ?? DEFAULT_WHATSAPP_FOLLOW_UP_DELAY_DAYS)
          : DEFAULT_WHATSAPP_FOLLOW_UP_DELAY_DAYS,
      scheduledDate:
        step.delayMode === 'absolute'
          ? (step.scheduledDate ?? '')
          : '',
    })),
  };
}

export function getSaveWhatsappTemplateValidationError(
  initialBody: string,
  followUps: WhatsappCampaignFollowUpDraft[],
  options: { name: string },
): string | null {
  if (!options.name.trim()) {
    return 'Enter a template name';
  }

  if (!initialBody.trim()) {
    return 'Step 1 needs a message body';
  }

  for (let index = 0; index < followUps.length; index += 1) {
    const followUp = followUps[index];
    if (!followUp.body.trim()) {
      return `Follow-up ${index + 1} needs a message body`;
    }

    if (followUp.delayMode === 'absolute' && !followUp.scheduledDate) {
      return `Follow-up ${index + 1} needs a scheduled date`;
    }

    if (followUp.delayMode !== 'absolute' && followUp.delayDays < 1) {
      return `Follow-up ${index + 1} needs at least 1 day delay`;
    }
  }

  return null;
}

export function mapWhatsappSequenceToCreateTemplateInput(
  initialBody: string,
  followUps: WhatsappCampaignFollowUpDraft[],
  options: { name: string },
): CreateWhatsappTemplateInput {
  const steps = buildWhatsappCampaignSteps(initialBody, followUps);

  return {
    name: options.name.trim(),
    type: inferWhatsappTemplateType(steps.length),
    visibility: 'private',
    isActive: true,
    steps,
  };
}
