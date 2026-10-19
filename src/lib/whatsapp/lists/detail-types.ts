import type { WhatsappListVisibility } from '@/lib/whatsapp/lists/types';

export interface WhatsappListFieldDefinition {
  key: string;
  label: string;
}

export interface WhatsappListFieldSchema {
  phone: WhatsappListFieldDefinition;
  fields: WhatsappListFieldDefinition[];
}

export interface WhatsappContactListDetail {
  id: string;
  name: string;
  contactCount: number;
  visibility: WhatsappListVisibility;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  fieldSchema: WhatsappListFieldSchema;
}

export interface WhatsappContactListMember {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  customFields: Record<string, string>;
  createdAt: string;
}

export interface WhatsappContactListMembersPage {
  items: WhatsappContactListMember[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateWhatsappListMemberInput {
  phone: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  customFields?: Record<string, string>;
}

export interface WhatsappListMembersQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface WhatsappListAppendImportInput {
  fieldMapping: WhatsappListFieldMapping;
}

export interface WhatsappListFieldMapping {
  phone: string;
  additionalFields: Array<{
    key: string;
    sourceColumn: string;
    secondarySourceColumn?: string;
  }>;
}

export interface WhatsappListAppendResult {
  list: import('@/lib/whatsapp/lists/types').WhatsappContactList;
  importedCount: number;
  skippedCount: number;
  importedPhones: string[];
}

export interface WhatsappListAppendFromProspectsInput {
  prospectIds: string[];
}
