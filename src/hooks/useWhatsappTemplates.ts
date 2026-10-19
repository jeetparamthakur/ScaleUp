'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { whatsappTemplateService } from '@/lib/api';
import type {
  CreateWhatsappTemplateInput,
  ListWhatsappTemplatesOptions,
  UpdateWhatsappTemplateInput,
} from '@/lib/api';

export function useWhatsappTemplate(id: string | null) {
  return useApiQuery(
    `whatsappTemplate.${id ?? 'none'}`,
    () => whatsappTemplateService.getById(id!),
    { enabled: Boolean(id) },
  );
}

export function useWhatsappTemplates(options?: ListWhatsappTemplatesOptions) {
  const queryKey = options?.type
    ? `whatsappTemplates.${options.type}${options.includeInactive ? '.all' : ''}`
    : 'whatsappTemplates.all';

  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery(queryKey, () => whatsappTemplateService.getAll(options));

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation(whatsappTemplateService.create);

  const {
    mutate: updateMutate,
    isLoading: isUpdating,
    error: updateError,
  } = useApiMutation(
    ({ id, input }: { id: string; input: UpdateWhatsappTemplateInput }) =>
      whatsappTemplateService.update(id, input),
  );

  const {
    mutate: deleteMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = useApiMutation(whatsappTemplateService.delete);

  const createTemplate = useCallback(
    async (input: CreateWhatsappTemplateInput) => {
      const result = await createMutate(input);
      await refetch();
      return result;
    },
    [createMutate, refetch],
  );

  const updateTemplate = useCallback(
    async (id: string, input: UpdateWhatsappTemplateInput) => {
      const result = await updateMutate({ id, input });
      await refetch();
      return result;
    },
    [updateMutate, refetch],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      await deleteMutate(id);
      await refetch();
    },
    [deleteMutate, refetch],
  );

  return {
    templates: data ?? [],
    isLoading,
    error: fetchError ?? createError ?? updateError ?? deleteError,
    refetch,
    createTemplate,
    isCreating,
    updateTemplate,
    isUpdating,
    deleteTemplate,
    isDeleting,
  };
}
