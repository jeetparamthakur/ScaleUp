import type { WhatsappSenderConnectionStatus } from '@/lib/whatsapp/connections/types';

const SETUP_IN_PROGRESS_STATUSES: WhatsappSenderConnectionStatus[] = [
  'created',
  'initializing',
  'qr_ready',
  'authenticating',
];

export type WhatsappSenderResumeAction = 'continue' | 'reconnect';

export function getWhatsappSenderResumeAction(
  status: WhatsappSenderConnectionStatus,
  phone: string | null,
): WhatsappSenderResumeAction {
  if (status === 'disconnected') {
    return 'reconnect';
  }
  if (status === 'failed' || status === 'action_required') {
    return 'reconnect';
  }
  if (phone && !SETUP_IN_PROGRESS_STATUSES.includes(status)) {
    return 'reconnect';
  }
  return 'continue';
}

export function getWhatsappSenderResumeActionLabel(
  action: WhatsappSenderResumeAction,
): 'Continue' | 'Reconnect' {
  return action === 'reconnect' ? 'Reconnect' : 'Continue';
}
