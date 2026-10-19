import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateWhatsappContactListInput,
  WhatsappListImportInput,
  WhatsappListImportPreview,
  WhatsappListImportResult,
  WhatsappListProspectImportInput,
  WhatsappListProspectImportResult,
  WhatsappContactList,
} from '@/lib/whatsapp/lists/types';
import type {
  CreateWhatsappListMemberInput,
  WhatsappContactListDetail,
  WhatsappContactListMember,
  WhatsappContactListMembersPage,
  WhatsappListAppendFromProspectsInput,
  WhatsappListAppendImportInput,
  WhatsappListAppendResult,
  WhatsappListMembersQuery,
} from '@/lib/whatsapp/lists/detail-types';

function buildImportFormData(
  file: File,
  payload?: WhatsappListImportInput | WhatsappListAppendImportInput,
): FormData {
  const formData = new FormData();
  formData.append('file', file);

  if (payload) {
    formData.append('payload', JSON.stringify(payload));
  }

  return formData;
}

function buildMembersQuery(query: WhatsappListMembersQuery = {}): string {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set('search', query.search.trim());
  }

  if (query.page) {
    params.set('page', String(query.page));
  }

  if (query.pageSize) {
    params.set('pageSize', String(query.pageSize));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const whatsappContactListsService = {
  getAll() {
    return apiClient.get<WhatsappContactList[]>(
      ENDPOINTS.whatsappContactLists.list,
    );
  },

  create(input: CreateWhatsappContactListInput) {
    return apiClient.post<WhatsappContactList>(
      ENDPOINTS.whatsappContactLists.list,
      input,
    );
  },

  getById(id: string) {
    return apiClient.get<WhatsappContactListDetail>(
      ENDPOINTS.whatsappContactLists.byId(id),
    );
  },

  delete(id: string) {
    return apiClient.delete<{ deleted: true }>(
      ENDPOINTS.whatsappContactLists.byId(id),
    );
  },

  getMembers(id: string, query?: WhatsappListMembersQuery) {
    return apiClient.get<WhatsappContactListMembersPage>(
      `${ENDPOINTS.whatsappContactLists.members(id)}${buildMembersQuery(query)}`,
    );
  },

  addMember(id: string, input: CreateWhatsappListMemberInput) {
    return apiClient.post<WhatsappContactListMember>(
      ENDPOINTS.whatsappContactLists.members(id),
      input,
    );
  },

  removeMember(listId: string, memberId: string) {
    return apiClient.delete<{ removed: boolean }>(
      ENDPOINTS.whatsappContactLists.memberById(listId, memberId),
    );
  },

  previewImport(file: File) {
    return apiClient.postFormData<WhatsappListImportPreview>(
      ENDPOINTS.whatsappContactLists.importPreview,
      buildImportFormData(file),
    );
  },

  previewAppendImport(id: string, file: File) {
    return apiClient.postFormData<WhatsappListImportPreview>(
      ENDPOINTS.whatsappContactLists.appendImportPreview(id),
      buildImportFormData(file),
    );
  },

  importList(file: File, input: WhatsappListImportInput) {
    return apiClient.postFormData<WhatsappListImportResult>(
      ENDPOINTS.whatsappContactLists.import,
      buildImportFormData(file, input),
    );
  },

  appendImport(id: string, file: File, input: WhatsappListAppendImportInput) {
    return apiClient.postFormData<WhatsappListAppendResult>(
      ENDPOINTS.whatsappContactLists.appendImport(id),
      buildImportFormData(file, input),
    );
  },

  importFromProspects(input: WhatsappListProspectImportInput) {
    return apiClient.post<WhatsappListProspectImportResult>(
      ENDPOINTS.whatsappContactLists.importFromProspects,
      input,
    );
  },

  appendFromProspects(
    id: string,
    input: WhatsappListAppendFromProspectsInput,
  ) {
    return apiClient.post<WhatsappListAppendResult>(
      ENDPOINTS.whatsappContactLists.appendFromProspects(id),
      input,
    );
  },

  downloadPdf(id: string, filename: string) {
    return apiClient.download(
      ENDPOINTS.whatsappContactLists.exportPdf(id),
      filename,
    );
  },
};
