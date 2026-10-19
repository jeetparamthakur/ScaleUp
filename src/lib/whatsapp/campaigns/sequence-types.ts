export type WhatsappFollowUpDelayMode = 'relative' | 'absolute';

export interface WhatsappCampaignFollowUpDraft {
  id: string;
  body: string;
  delayMode: WhatsappFollowUpDelayMode;
  delayDays: number;
  scheduledDate: string;
}

export interface WhatsappCampaignSequenceStepInput {
  stepOrder: number;
  body: string;
  delayDays: number;
  delayMode?: WhatsappFollowUpDelayMode;
  scheduledDate?: string;
}
