import {
  DEFAULT_WHATSAPP_FOLLOW_UP_DELAY_DAYS,
} from '@/lib/whatsapp/campaigns/sequence-defaults';
import type {
  WhatsappCampaignFollowUpDraft,
  WhatsappCampaignSequenceStepInput,
} from '@/lib/whatsapp/campaigns/sequence-types';

function isCompleteFollowUp(followUp: WhatsappCampaignFollowUpDraft): boolean {
  if (!followUp.body.trim()) {
    return false;
  }

  if (followUp.delayMode === 'absolute') {
    return Boolean(followUp.scheduledDate);
  }

  return followUp.delayDays >= 1;
}

export function canProceedWhatsappSequenceStep(
  initialBody: string,
  followUps: WhatsappCampaignFollowUpDraft[],
): boolean {
  if (!initialBody.trim()) {
    return false;
  }

  return followUps.every(isCompleteFollowUp);
}

export function buildWhatsappCampaignSteps(
  initialBody: string,
  followUps: WhatsappCampaignFollowUpDraft[],
): WhatsappCampaignSequenceStepInput[] {
  const steps: WhatsappCampaignSequenceStepInput[] = [
    {
      stepOrder: 1,
      body: initialBody.trim(),
      delayDays: 0,
      delayMode: 'relative',
    },
  ];

  followUps.forEach((followUp, index) => {
    if (!isCompleteFollowUp(followUp)) {
      return;
    }

    const delayMode = followUp.delayMode ?? 'relative';
    steps.push({
      stepOrder: index + 2,
      body: followUp.body.trim(),
      delayMode,
      delayDays:
        delayMode === 'absolute'
          ? 0
          : (followUp.delayDays ?? DEFAULT_WHATSAPP_FOLLOW_UP_DELAY_DAYS),
      scheduledDate:
        delayMode === 'absolute' ? followUp.scheduledDate : undefined,
    });
  });

  return steps;
}

export function formatWhatsappStepDelayLabel(
  step: WhatsappCampaignSequenceStepInput,
): string {
  if (step.stepOrder === 1) {
    return 'Sends when the campaign starts for each contact';
  }

  if (step.delayMode === 'absolute' && step.scheduledDate) {
    return `Scheduled for ${step.scheduledDate}`;
  }

  return `${step.delayDays} day${step.delayDays === 1 ? '' : 's'} after no reply`;
}
