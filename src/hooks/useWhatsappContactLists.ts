'use client';

import { useCallback } from 'react';
import { whatsappContactListsService } from '@/lib/api/services/whatsapp-contact-lists.service';
import type {
  CreateWhatsappContactListInput,
  WhatsappListImportInput,
  WhatsappListProspectImportInput,
} from '@/lib/whatsapp/lists/types';
import type {
  CreateWhatsappListMemberInput,
  WhatsappListAppendFromProspectsInput,
  WhatsappListAppendImportInput,
  WhatsappListMembersQuery,
} from '@/lib/whatsapp/lists/detail-types';
import { useApiMutation, useApiQuery } from '@/hooks/api';

export function useWhatsappContactLists() {
  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useApiQuery('whatsapp-contact-lists.list', () =>
    whatsappContactListsService.getAll(),
  );

  const {
    mutate: importMutate,
    isLoading: isImporting,
    error: importError,
  } = useApiMutation(
    ({ file, input }: { file: File; input: WhatsappListImportInput }) =>
      whatsappContactListsService.importList(file, input),
  );

  const {
    mutate: createMutate,
    isLoading: isCreating,
    error: createError,
  } = useApiMutation((input: CreateWhatsappContactListInput) =>
    whatsappContactListsService.create(input),
  );

  const {
    mutate: importFromProspectsMutate,
    isLoading: isImportingFromProspects,
    error: importFromProspectsError,
  } = useApiMutation((input: WhatsappListProspectImportInput) =>
    whatsappContactListsService.importFromProspects(input),
  );

  const {
    mutate: deleteMutate,
    isLoading: isDeleting,
    error: deleteError,
  } = useApiMutation((id: string) => whatsappContactListsService.delete(id));

  const importList = useCallback(
    async (file: File, input: WhatsappListImportInput) => {
      const result = await importMutate({ file, input });
      await refetch();
      return result;
    },
    [importMutate, refetch],
  );

  const createList = useCallback(
    async (input: CreateWhatsappContactListInput) => {
      const result = await createMutate(input);
      await refetch();
      return result;
    },
    [createMutate, refetch],
  );

  const importFromProspects = useCallback(
    async (input: WhatsappListProspectImportInput) => {
      const result = await importFromProspectsMutate(input);
      await refetch();
      return result;
    },
    [importFromProspectsMutate, refetch],
  );

  const deleteList = useCallback(
    async (id: string) => {
      const result = await deleteMutate(id);
      await refetch();
      return result;
    },
    [deleteMutate, refetch],
  );

  return {
    lists: data ?? [],
    isLoading,
    isImporting,
    isImportingFromProspects,
    isCreating,
    isDeleting,
    error:
      fetchError ??
      importError ??
      importFromProspectsError ??
      createError ??
      deleteError,
    refetch,
    importList,
    importFromProspects,
    createList,
    deleteList,
  };
}

export function useWhatsappContactList(id: string) {
  return useApiQuery(
    `whatsapp-contact-lists.detail.${id}`,
    () => whatsappContactListsService.getById(id),
    { enabled: Boolean(id) },
  );
}

export function useWhatsappContactListMembers(
  id: string,
  query: WhatsappListMembersQuery,
) {
  const queryKey = [
    'whatsapp-contact-lists.members',
    id,
    query.search ?? '',
    query.page ?? 1,
    query.pageSize ?? 25,
  ].join('.');

  return useApiQuery(
    queryKey,
    () => whatsappContactListsService.getMembers(id, query),
    { enabled: Boolean(id) },
  );
}

export function useWhatsappContactListMutations(id: string) {
  const {
    mutate: addMemberMutate,
    isLoading: isAddingMember,
    error: addMemberError,
  } = useApiMutation((input: CreateWhatsappListMemberInput) =>
    whatsappContactListsService.addMember(id, input),
  );

  const {
    mutate: appendImportMutate,
    isLoading: isAppendingImport,
    error: appendImportError,
  } = useApiMutation(
    ({ file, input }: { file: File; input: WhatsappListAppendImportInput }) =>
      whatsappContactListsService.appendImport(id, file, input),
  );

  const {
    mutate: appendFromProspectsMutate,
    isLoading: isAppendingFromProspects,
    error: appendFromProspectsError,
  } = useApiMutation((input: WhatsappListAppendFromProspectsInput) =>
    whatsappContactListsService.appendFromProspects(id, input),
  );

  const {
    mutate: removeMemberMutate,
    isLoading: isRemovingMember,
    error: removeMemberError,
  } = useApiMutation((memberId: string) =>
    whatsappContactListsService.removeMember(id, memberId),
  );

  return {
    addMember: addMemberMutate,
    appendImport: appendImportMutate,
    appendFromProspects: appendFromProspectsMutate,
    removeMember: removeMemberMutate,
    isAddingMember,
    isAppendingImport,
    isAppendingFromProspects,
    isRemovingMember,
    error:
      addMemberError ??
      appendImportError ??
      appendFromProspectsError ??
      removeMemberError,
  };
}
