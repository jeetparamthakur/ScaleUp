export type WhatsappListVisibility = 'org' | 'private';

export interface WhatsappContactList {
  id: string;
  name: string;
  contactCount: number;
  visibility: WhatsappListVisibility;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsappListImportPreview {
  columns: string[];
  sampleRows: Record<string, string>[];
  suggestedMapping: Record<string, string>;
  rowCount: number;
}

export interface WhatsappAdditionalFieldMapping {
  key: string;
  sourceColumn: string;
  secondarySourceColumn?: string;
}

export interface WhatsappListFieldMapping {
  phone: string;
  additionalFields: WhatsappAdditionalFieldMapping[];
}

export interface WhatsappListImportInput {
  name: string;
  visibility: WhatsappListVisibility;
  fieldMapping: WhatsappListFieldMapping;
}

export interface WhatsappListImportResult {
  list: WhatsappContactList;
  importedCount: number;
  skippedCount: number;
}

export interface CreateWhatsappContactListInput {
  name: string;
  visibility: WhatsappListVisibility;
}

export interface WhatsappListProspectImportInput {
  name: string;
  visibility: WhatsappListVisibility;
  prospectIds: string[];
}

export interface WhatsappListProspectImportResult {
  list: WhatsappContactList;
  importedCount: number;
  skippedCount: number;
}
