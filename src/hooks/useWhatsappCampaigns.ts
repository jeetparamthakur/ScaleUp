'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { invalidateQuery } from '@/hooks/api/query-cache';
import {
  whatsappCampaignsService,
  type CreateWhatsappCampaignInput,
} from '@/lib/api/services/whatsapp-campaigns.service';
import type {
  WhatsappCampaignAddableMembersQuery,
  WhatsappCampaignDetail,
  WhatsappCampaignRecipientsQuery,
  WhatsappCampaignRepliesQuery,
} from '@/lib/whatsapp/campaigns/types';

const LIST_KEY = 'whatsapp.campaigns';

export function useWhatsappCampaigns() {
  return useApiQuery(LIST_KEY, () => whatsappCampaignsService.list(), {
    refetchIntervalMs: 15000,
  });
}

export function useWhatsappCampaign(campaignId: string | null) {
  const enabled = Boolean(campaignId);
  return useApiQuery(
    `whatsapp.campaigns.${campaignId ?? 'none'}`,
    () => whatsappCampaignsService.get(campaignId!),
    { enabled, refetchIntervalMs: 10000 },
  );
}

export function useCreateWhatsappCampaign() {
  const { mutate, isLoading, error, reset } = useApiMutation<
    CreateWhatsappCampaignInput,
    WhatsappCampaignDetail
  >(async (input) => whatsappCampaignsService.create(input));

  const createCampaign = useCallback(
    async (input: CreateWhatsappCampaignInput) => {
      const result = await mutate(input);
      invalidateQuery(LIST_KEY);
      return result;
    },
    [mutate],
  );

  return { createCampaign, isCreating: isLoading, error, reset };
}

export function useScheduleWhatsappCampaign() {
  const { mutate, isLoading, error, reset } = useApiMutation<
    string,
    WhatsappCampaignDetail
  >(async (campaignId) => whatsappCampaignsService.schedule(campaignId));

  const scheduleCampaign = useCallback(
    async (campaignId: string) => {
      const result = await mutate(campaignId);
      invalidateQuery(LIST_KEY);
      invalidateQuery(`whatsapp.campaigns.${campaignId}`);
      return result;
    },
    [mutate],
  );

  return { scheduleCampaign, isScheduling: isLoading, error, reset };
}

export function useWhatsappCampaignAddableMembers(
  campaignId: string | null,
  query: WhatsappCampaignAddableMembersQuery,
  options?: { enabled?: boolean },
) {
  const enabled = Boolean(campaignId) && (options?.enabled ?? true);
  const queryKey = [
    'whatsapp.campaigns.addableMembers',
    campaignId ?? 'none',
    query.search ?? '',
    query.page ?? 1,
    query.limit ?? 25,
  ].join('.');

  return useApiQuery(
    queryKey,
    () => whatsappCampaignsService.listAddableMembers(campaignId!, query),
    { enabled },
  );
}

export function useWhatsappCampaignRecipients(
  campaignId: string | null,
  query: WhatsappCampaignRecipientsQuery,
) {
  const enabled = Boolean(campaignId);
  const queryKey = [
    'whatsapp.campaigns.recipients',
    campaignId ?? 'none',
    query.search ?? '',
    query.status ?? '',
    query.page ?? 1,
    query.limit ?? 25,
  ].join('.');

  return useApiQuery(
    queryKey,
    () => whatsappCampaignsService.listRecipients(campaignId!, query),
    { enabled, refetchIntervalMs: 10000 },
  );
}

export function useWhatsappCampaignReplies(
  campaignId: string | null,
  query: WhatsappCampaignRepliesQuery,
) {
  const enabled = Boolean(campaignId);
  const queryKey = [
    'whatsapp.campaigns.replies',
    campaignId ?? 'none',
    query.search ?? '',
    query.page ?? 1,
    query.limit ?? 25,
  ].join('.');

  return useApiQuery(
    queryKey,
    () => whatsappCampaignsService.listReplies(campaignId!, query),
    { enabled, refetchIntervalMs: 10000 },
  );
}
