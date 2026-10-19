import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  AddWhatsappCampaignRecipientsInput,
  AddWhatsappCampaignRecipientsResult,
  PaginatedWhatsappCampaignAddableMembers,
  PaginatedWhatsappCampaignRecipients,
  PaginatedWhatsappCampaignReplies,
  WhatsappCampaignAddableMembersQuery,
  WhatsappCampaignDetail,
  WhatsappCampaignRecipientsQuery,
  WhatsappCampaignRepliesQuery,
} from '@/lib/whatsapp/campaigns/types';

export interface CreateWhatsappCampaignStepInput {
  stepOrder: number;
  body: string;
  delayDays: number;
  delayMode?: 'relative' | 'absolute';
  scheduledDate?: string;
}

export interface CreateWhatsappCampaignInput {
  name: string;
  steps: CreateWhatsappCampaignStepInput[];
  contactListId: string;
  senderConnectionIds: string[];
  launchAt?: string;
  timezone?: string;
  dailyBatchSize: number;
  sendIntervalSeconds?: number | null;
  sendingWindowStartMinutes?: number;
  sendingWindowEndMinutes?: number;
  distributeRecipientsEqually?: boolean;
}

export const whatsappCampaignsService = {
  list() {
    return apiClient.get<WhatsappCampaignDetail[]>(ENDPOINTS.whatsappCampaigns.list);
  },

  get(campaignId: string) {
    return apiClient.get<WhatsappCampaignDetail>(
      ENDPOINTS.whatsappCampaigns.byId(campaignId),
    );
  },

  create(input: CreateWhatsappCampaignInput) {
    return apiClient.post<WhatsappCampaignDetail>(
      ENDPOINTS.whatsappCampaigns.list,
      input,
    );
  },

  schedule(campaignId: string) {
    return apiClient.post<WhatsappCampaignDetail>(
      ENDPOINTS.whatsappCampaigns.schedule(campaignId),
    );
  },

  listAddableMembers(
    campaignId: string,
    query: WhatsappCampaignAddableMembersQuery,
  ) {
    const params = new URLSearchParams();
    if (query.search) {
      params.set('search', query.search);
    }
    if (query.page) {
      params.set('page', String(query.page));
    }
    if (query.limit) {
      params.set('limit', String(query.limit));
    }
    const suffix = params.size > 0 ? `?${params.toString()}` : '';
    return apiClient.get<PaginatedWhatsappCampaignAddableMembers>(
      `${ENDPOINTS.whatsappCampaigns.addableListMembers(campaignId)}${suffix}`,
    );
  },

  addRecipients(campaignId: string, input: AddWhatsappCampaignRecipientsInput) {
    return apiClient.post<AddWhatsappCampaignRecipientsResult>(
      ENDPOINTS.whatsappCampaigns.recipients(campaignId),
      input,
    );
  },

  listRecipients(campaignId: string, query: WhatsappCampaignRecipientsQuery) {
    const params = new URLSearchParams();
    if (query.search) {
      params.set('search', query.search);
    }
    if (query.status) {
      params.set('status', query.status);
    }
    if (query.page) {
      params.set('page', String(query.page));
    }
    if (query.limit) {
      params.set('limit', String(query.limit));
    }
    const suffix = params.size > 0 ? `?${params.toString()}` : '';
    return apiClient.get<PaginatedWhatsappCampaignRecipients>(
      `${ENDPOINTS.whatsappCampaigns.recipients(campaignId)}${suffix}`,
    );
  },

  listReplies(campaignId: string, query: WhatsappCampaignRepliesQuery) {
    const params = new URLSearchParams();
    if (query.search) {
      params.set('search', query.search);
    }
    if (query.page) {
      params.set('page', String(query.page));
    }
    if (query.limit) {
      params.set('limit', String(query.limit));
    }
    const suffix = params.size > 0 ? `?${params.toString()}` : '';
    return apiClient.get<PaginatedWhatsappCampaignReplies>(
      `${ENDPOINTS.whatsappCampaigns.replies(campaignId)}${suffix}`,
    );
  },
};
