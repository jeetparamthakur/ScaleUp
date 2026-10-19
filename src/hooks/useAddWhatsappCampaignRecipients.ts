'use client';

import { useCallback, useMemo } from 'react';
import { useApiMutation } from '@/hooks/api';
import {
  invalidateQueriesByPrefix,
  invalidateQuery,
} from '@/hooks/api/query-cache';
import { whatsappCampaignsService } from '@/lib/api/services/whatsapp-campaigns.service';
import type { AddWhatsappCampaignRecipientsInput } from '@/lib/whatsapp/campaigns/types';
import { useNotify } from '@/hooks/useNotify';

export function useAddWhatsappCampaignRecipients(options?: {
  onSuccess?: () => void | Promise<void>;
}) {
  const { notifyError, notifySuccess } = useNotify();
  const onSuccess = options?.onSuccess;

  const { mutate, isLoading } = useApiMutation(
    (input: { campaignId: string; payload: AddWhatsappCampaignRecipientsInput }) =>
      whatsappCampaignsService.addRecipients(input.campaignId, input.payload),
  );

  const addRecipients = useCallback(
    async (campaignId: string, payload: AddWhatsappCampaignRecipientsInput) => {
      try {
        const result = await mutate({ campaignId, payload });
        const skippedParts: string[] = [];

        if (result.skippedDuplicateCount > 0) {
          skippedParts.push(
            `${result.skippedDuplicateCount} already on campaign`,
          );
        }

        if (result.skippedInvalidCount > 0) {
          skippedParts.push(`${result.skippedInvalidCount} invalid`);
        }

        const suffix =
          skippedParts.length > 0 ? ` (${skippedParts.join(', ')})` : '';

        notifySuccess(`Added ${result.addedCount} contact(s)${suffix}`);
        invalidateQuery(`whatsapp.campaigns.${campaignId}`);
        invalidateQueriesByPrefix('whatsapp.campaigns.recipients');
        invalidateQueriesByPrefix('whatsapp.campaigns.addableMembers');

        if (onSuccess) {
          await onSuccess();
        }

        return result;
      } catch {
        notifyError('Failed to add contacts to campaign');
        throw new Error('Failed to add recipients');
      }
    },
    [mutate, notifyError, notifySuccess, onSuccess],
  );

  return useMemo(
    () => ({
      addRecipients,
      isAdding: isLoading,
    }),
    [addRecipients, isLoading],
  );
}
