import { splitDailyBatchEqually } from '@/lib/email/campaigns/mailbox-capacity';
import type { WhatsappSenderConnection } from '@/lib/whatsapp/connections/types';

export function computeWhatsappSendersDailyCapacity(
  senders: WhatsappSenderConnection[],
): number | null {
  const withLimit = senders.filter((sender) => sender.dailySendLimit != null);
  if (withLimit.length === 0) {
    return null;
  }

  return withLimit.reduce(
    (sum, sender) => sum + (sender.dailySendLimit ?? 0),
    0,
  );
}

export function isWhatsappDailyBatchWithinSenderLimits(
  dailyBatchSize: number,
  senders: WhatsappSenderConnection[],
): boolean {
  const combined = computeWhatsappSendersDailyCapacity(senders);
  if (combined == null) {
    return true;
  }
  return dailyBatchSize <= combined;
}

export function getSuggestedWhatsappDailyBatchSize(
  senders: WhatsappSenderConnection[],
  preferred = 50,
): number {
  const combined = computeWhatsappSendersDailyCapacity(senders);
  if (combined == null) {
    return preferred;
  }
  return Math.min(preferred, combined);
}

export function buildWhatsappDailyLimitHelperText(
  dailyBatchSize: number,
  combinedSenderLimit: number | null,
): string {
  if (combinedSenderLimit == null) {
    return 'Maximum messages this campaign may send per day.';
  }

  if (dailyBatchSize > combinedSenderLimit) {
    return `Exceeds combined sender limits (${combinedSenderLimit.toLocaleString()}/day).`;
  }

  return `Selected senders allow up to ${combinedSenderLimit.toLocaleString()} messages per day combined.`;
}

export function estimateContactsPerSender(
  contactCount: number,
  senderCount: number,
): number[] {
  if (senderCount <= 0 || contactCount <= 0) {
    return [];
  }

  return splitDailyBatchEqually(contactCount, senderCount);
}
