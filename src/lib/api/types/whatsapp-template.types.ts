export type WhatsappTemplateType = 'single' | 'sequence';

export type WhatsappTemplateVisibility = 'private' | 'org';

export type WhatsappTemplateDelayMode = 'relative' | 'absolute';

export interface WhatsappTemplateStep {
  id: string;
  stepOrder: number;
  body: string;
  delayMode: WhatsappTemplateDelayMode;
  delayDays: number;
  scheduledDate: string | null;
}

export interface WhatsappTemplate {
  id: string;
  name: string;
  description: string | null;
  type: WhatsappTemplateType;
  visibility: WhatsappTemplateVisibility;
  isActive: boolean;
  createdByUserId: string;
  steps: WhatsappTemplateStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWhatsappTemplateStepInput {
  stepOrder: number;
  body: string;
  delayMode?: WhatsappTemplateDelayMode;
  delayDays?: number;
  scheduledDate?: string;
}

export interface CreateWhatsappTemplateInput {
  name: string;
  description?: string;
  type: WhatsappTemplateType;
  visibility?: WhatsappTemplateVisibility;
  isActive?: boolean;
  steps: CreateWhatsappTemplateStepInput[];
}

export interface UpdateWhatsappTemplateInput {
  name?: string;
  description?: string;
  visibility?: WhatsappTemplateVisibility;
  isActive?: boolean;
  steps?: CreateWhatsappTemplateStepInput[];
}

export interface ListWhatsappTemplatesOptions {
  type?: WhatsappTemplateType;
  includeInactive?: boolean;
}
