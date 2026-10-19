import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  WhatsappSenderConnection,
  WhatsappSenderQrState,
} from '@/lib/whatsapp/connections/types';

export const whatsappSenderConnectionsService = {
  getAvailability() {
    return apiClient.get<{ available: boolean }>(ENDPOINTS.whatsapp.availability);
  },

  listConnections() {
    return apiClient.get<WhatsappSenderConnection[]>(ENDPOINTS.whatsapp.connections);
  },

  createConnection(input?: { displayName?: string }) {
    return apiClient.post<WhatsappSenderConnection>(
      ENDPOINTS.whatsapp.connections,
      input ?? {},
    );
  },

  getConnection(connectionId: string) {
    return apiClient.get<WhatsappSenderConnection>(
      ENDPOINTS.whatsapp.connectionById(connectionId),
    );
  },

  startConnection(connectionId: string) {
    return apiClient.post<WhatsappSenderConnection>(
      ENDPOINTS.whatsapp.connectionStart(connectionId),
    );
  },

  getQr(connectionId: string) {
    return apiClient.get<WhatsappSenderQrState>(
      ENDPOINTS.whatsapp.connectionQr(connectionId),
    );
  },

  disconnect(connectionId: string) {
    return apiClient.post<{ deleted: true }>(
      ENDPOINTS.whatsapp.connectionDisconnect(connectionId),
    );
  },

  updateConnection(
    connectionId: string,
    input: { displayName?: string; dailySendLimit?: number | null },
  ) {
    return apiClient.patch<WhatsappSenderConnection>(
      ENDPOINTS.whatsapp.connectionById(connectionId),
      input,
    );
  },
};
