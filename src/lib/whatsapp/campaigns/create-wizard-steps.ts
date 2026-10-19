export type WhatsappCampaignCreateStepId =
  | 'details'
  | 'sequence'
  | 'audience'
  | 'review';

export interface WhatsappCampaignCreateStep {
  id: WhatsappCampaignCreateStepId;
  label: string;
}

export const WHATSAPP_CAMPAIGN_CREATE_STEPS: WhatsappCampaignCreateStep[] = [
  { id: 'details', label: 'Details' },
  { id: 'sequence', label: 'Sequence' },
  { id: 'audience', label: 'Audience' },
  { id: 'review', label: 'Review' },
];

export const WHATSAPP_CAMPAIGN_CREATE_STEP_COUNT =
  WHATSAPP_CAMPAIGN_CREATE_STEPS.length;
