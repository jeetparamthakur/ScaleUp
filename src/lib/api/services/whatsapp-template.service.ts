import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateWhatsappTemplateInput,
  ListWhatsappTemplatesOptions,
  UpdateWhatsappTemplateInput,
  WhatsappTemplate,
} from '../types/whatsapp-template.types';

function buildListQuery(options?: ListWhatsappTemplatesOptions): string {
  const params = new URLSearchParams();

  if (options?.type) {
    params.set('type', options.type);
  }

  if (options?.includeInactive) {
    params.set('includeInactive', 'true');
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export const whatsappTemplateService = {
  getAll(options?: ListWhatsappTemplatesOptions) {
    return apiClient.get<WhatsappTemplate[]>(
      `${ENDPOINTS.whatsappTemplates.list}${buildListQuery(options)}`,
    );
  },

  getById(id: string) {
    return apiClient.get<WhatsappTemplate>(ENDPOINTS.whatsappTemplates.byId(id));
  },

  create(input: CreateWhatsappTemplateInput) {
    return apiClient.post<WhatsappTemplate>(
      ENDPOINTS.whatsappTemplates.list,
      input,
    );
  },

  update(id: string, input: UpdateWhatsappTemplateInput) {
    return apiClient.patch<WhatsappTemplate>(
      ENDPOINTS.whatsappTemplates.byId(id),
      input,
    );
  },

  delete(id: string) {
    return apiClient.delete<void>(ENDPOINTS.whatsappTemplates.byId(id));
  },
};
