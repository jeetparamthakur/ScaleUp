export type WhatsappCampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'completed'
  | 'stopped';

export interface WhatsappCampaignProgress {
  pending: number;
  sent: number;
  failed: number;
  replied: number;
  skipped: number;
}

export interface WhatsappCampaignDetail {
  id: string;
  name: string;
  messageBody: string;
  contactListId: string;
  status: WhatsappCampaignStatus;
  launchAt: string | null;
  timezone: string | null;
  transport: 'openwa' | 'meta';
  senderConnectionIds: string[];
  dailyBatchSize: number;
  sendIntervalSeconds: number | null;
  sendingWindowStartMinutes: number | null;
  sendingWindowEndMinutes: number | null;
  distributeRecipientsEqually: boolean;
  progress: WhatsappCampaignProgress;
  createdAt: string;
}

export type WhatsappCampaignRecipientStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'skipped'
  | 'replied';

export interface WhatsappCampaignRecipient {
  id: string;
  phoneE164: string;
  status: WhatsappCampaignRecipientStatus;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  sentAt: string | null;
  repliedAt: string | null;
  replyBody: string | null;
  lastError: string | null;
  createdAt: string;
}

export interface WhatsappCampaignReply {
  recipientId: string;
  phoneE164: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  sentAt: string | null;
  repliedAt: string;
  replyBody: string | null;
}

export interface PaginatedWhatsappCampaignRecipients {
  items: WhatsappCampaignRecipient[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedWhatsappCampaignReplies {
  items: WhatsappCampaignReply[];
  total: number;
  page: number;
  limit: number;
}

export interface WhatsappCampaignRecipientsQuery {
  search?: string;
  status?: WhatsappCampaignRecipientStatus;
  page?: number;
  limit?: number;
}

export interface WhatsappCampaignRepliesQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface WhatsappCampaignAddableMember {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
}

export interface PaginatedWhatsappCampaignAddableMembers {
  items: WhatsappCampaignAddableMember[];
  total: number;
  page: number;
  limit: number;
}

export interface WhatsappCampaignAddableMembersQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AddWhatsappCampaignManualContactInput {
  phone: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export interface AddWhatsappCampaignRecipientsInput {
  manual?: AddWhatsappCampaignManualContactInput[];
  listMemberIds?: string[];
  prospectIds?: string[];
}

export interface AddWhatsappCampaignRecipientsResult {
  addedCount: number;
  skippedDuplicateCount: number;
  skippedInvalidCount: number;
  items: WhatsappCampaignRecipient[];
}
