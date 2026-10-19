export type WhatsappConnectionStatus =
  | 'created'
  | 'initializing'
  | 'qr_ready'
  | 'authenticating'
  | 'ready'
  | 'disconnected'
  | 'action_required'
  | 'failed';

export interface WhatsappConnection {
  id: string;
  status: WhatsappConnectionStatus;
  phone: string | null;
  pushName: string | null;
  lastBackfillAt: string | null;
  lastError: string | null;
  openWaAvailable: boolean;
}

export interface WhatsappInboxSender {
  id: string;
  displayName: string | null;
  status: WhatsappConnectionStatus;
  phone: string | null;
  pushName: string | null;
  lastBackfillAt: string | null;
  lastError: string | null;
}

export interface WhatsappQrState {
  status: WhatsappConnectionStatus;
  qrCode: string | null;
  phone: string | null;
  pushName: string | null;
}

export interface WhatsappConversation {
  id: string;
  chatId: string;
  title: string;
  isGroup: boolean;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface WhatsappMessageMediaMetadata {
  filename?: string;
  mimetype?: string;
  sizeBytes?: number;
  omitted?: boolean;
}

export interface WhatsappMessage {
  id: string;
  externalId: string;
  fromMe: boolean;
  body: string | null;
  messageType: string;
  mediaMetadata?: WhatsappMessageMediaMetadata | Record<string, unknown> | null;
  sentAt: string;
}

export interface PaginatedWhatsappConversations {
  items: WhatsappConversation[];
  total: number;
}

export interface PaginatedWhatsappMessages {
  items: WhatsappMessage[];
  total: number;
}

export interface PlatformOpenWaSettings {
  configured: boolean;
  enabled: boolean;
  baseUrl: string;
  updatedAt: string;
}
