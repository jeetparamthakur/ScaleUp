import { apiClient } from '../client';
import type {
  PaginatedWhatsappConversations,
  PaginatedWhatsappMessages,
  PlatformOpenWaSettings,
  WhatsappConnection,
  WhatsappInboxSender,
  WhatsappMessage,
  WhatsappQrState,
} from '@/lib/inbox/whatsapp-types';

/** WhatsApp module hub inbox (senders, chats, send). */
const WHATSAPP_INBOX_BASE = '/whatsapp/inbox';

/** Settings → Connect inbox (legacy per-user connection). */
const INBOX_CONNECT_BASE = '/inbox/whatsapp';

export const whatsappInboxService = {
  getAvailability() {
    return apiClient.get<{ available: boolean }>(
      `${INBOX_CONNECT_BASE}/availability`,
    );
  },

  getModuleInboxAvailability() {
    return apiClient.get<{ available: boolean }>(
      `${WHATSAPP_INBOX_BASE}/availability`,
    );
  },

  getConnection() {
    return apiClient.get<WhatsappConnection>(`${INBOX_CONNECT_BASE}/connection`);
  },

  startConnect() {
    return apiClient.post<WhatsappConnection>(
      `${INBOX_CONNECT_BASE}/connection/start`,
    );
  },

  getQr() {
    return apiClient.get<WhatsappQrState>(`${INBOX_CONNECT_BASE}/connection/qr`);
  },

  disconnect() {
    return apiClient.post<WhatsappConnection>(
      `${INBOX_CONNECT_BASE}/connection/disconnect`,
    );
  },

  listSenders() {
    return apiClient.get<WhatsappInboxSender[]>(`${WHATSAPP_INBOX_BASE}/senders`);
  },

  syncSender(senderConnectionId: string, conversationId?: string | null) {
    const body =
      conversationId?.trim()
        ? { conversationId: conversationId.trim() }
        : {};
    return apiClient.post<void>(
      `${WHATSAPP_INBOX_BASE}/senders/${senderConnectionId}/sync`,
      body,
    );
  },

  getProfilePictures(senderConnectionId: string, chatIds: string[]) {
    const unique = [...new Set(chatIds.map((id) => id.trim()).filter(Boolean))];
    if (unique.length === 0) {
      return Promise.resolve({ pictures: {} as Record<string, string | null> });
    }
    const params = new URLSearchParams({
      senderConnectionId,
      ids: unique.slice(0, 50).join(','),
    });
    return apiClient.get<{ pictures: Record<string, string | null> }>(
      `${WHATSAPP_INBOX_BASE}/profile-pictures?${params.toString()}`,
    );
  },

  listConversations(senderConnectionId: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      senderConnectionId,
      limit: String(limit),
      offset: String(offset),
    });
    return apiClient.get<PaginatedWhatsappConversations>(
      `${WHATSAPP_INBOX_BASE}/conversations?${params.toString()}`,
    );
  },

  messageMediaPath(conversationId: string, messageId: string) {
    return `${WHATSAPP_INBOX_BASE}/conversations/${conversationId}/messages/${messageId}/media`;
  },

  fetchMessageMedia(conversationId: string, messageId: string) {
    return apiClient.fetchBlob(this.messageMediaPath(conversationId, messageId));
  },

  prefetchConversationMedia(conversationId: string) {
    return apiClient.post<void>(
      `${WHATSAPP_INBOX_BASE}/conversations/${conversationId}/prefetch-media`,
    );
  },

  listMessages(conversationId: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    return apiClient.get<PaginatedWhatsappMessages>(
      `${WHATSAPP_INBOX_BASE}/conversations/${conversationId}/messages?${params.toString()}`,
    );
  },

  sendMessage(conversationId: string, text: string) {
    return apiClient.post<WhatsappMessage>(
      `${WHATSAPP_INBOX_BASE}/conversations/${conversationId}/messages`,
      { text },
    );
  },

  sendAttachment(conversationId: string, file: File, caption?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (caption?.trim()) {
      formData.append('caption', caption.trim());
    }
    return apiClient.postFormData<WhatsappMessage>(
      `${WHATSAPP_INBOX_BASE}/conversations/${conversationId}/attachments`,
      formData,
    );
  },
};

export const platformOpenWaService = {
  getSettings() {
    return apiClient.get<PlatformOpenWaSettings>('/platform/openwa');
  },

  updateSettings(input: {
    baseUrl?: string;
    apiKey?: string;
    enabled?: boolean;
  }) {
    return apiClient.put<PlatformOpenWaSettings>('/platform/openwa', input);
  },

  testConnection() {
    return apiClient.get<{ ok: true }>('/platform/openwa/test');
  },
};
