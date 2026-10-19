export type WhatsappSenderConnectionStatus =
  | 'created'
  | 'initializing'
  | 'qr_ready'
  | 'authenticating'
  | 'ready'
  | 'disconnected'
  | 'action_required'
  | 'failed';

export interface WhatsappSenderConnection {
  id: string;
  displayName: string | null;
  status: WhatsappSenderConnectionStatus;
  phone: string | null;
  pushName: string | null;
  lastError: string | null;
  openWaAvailable: boolean;
  createdAt: string;
  dailySendLimit: number | null;
  sendsTodayCount: number;
  remainingDailyCapacity: number | null;
}

export interface WhatsappSenderQrState {
  status: WhatsappSenderConnectionStatus;
  qrCode: string | null;
  phone: string | null;
  pushName: string | null;
}
