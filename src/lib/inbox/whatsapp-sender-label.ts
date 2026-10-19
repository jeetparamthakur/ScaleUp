import type { WhatsappInboxSender } from '@/lib/inbox/whatsapp-types';

function formatPhone(phone: string | null): string {
  if (!phone) {
    return '—';
  }
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? `+${digits}` : phone;
}

export function whatsappInboxSenderLabel(sender: WhatsappInboxSender): string {
  if (sender.displayName?.trim()) {
    return sender.displayName.trim();
  }
  if (sender.pushName?.trim()) {
    return sender.pushName.trim();
  }
  if (sender.phone) {
    return formatPhone(sender.phone);
  }
  return 'WhatsApp number';
}
