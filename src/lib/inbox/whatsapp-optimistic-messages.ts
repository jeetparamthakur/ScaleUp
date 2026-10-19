import type { WhatsappMessage } from '@/lib/inbox/whatsapp-types';

export const WHATSAPP_PENDING_MESSAGE_ID_PREFIX = 'pending-';

export function createPendingWhatsappMessageId(): string {
  return `${WHATSAPP_PENDING_MESSAGE_ID_PREFIX}${crypto.randomUUID()}`;
}

export function isPendingWhatsappMessageId(id: string): boolean {
  return id.startsWith(WHATSAPP_PENDING_MESSAGE_ID_PREFIX);
}

export function messageTypeFromUploadFile(file: File): string {
  const type = file.type.toLowerCase();
  if (type.startsWith('image/')) {
    return 'image';
  }
  if (type.startsWith('video/')) {
    return 'video';
  }
  if (type.startsWith('audio/')) {
    return 'audio';
  }
  return 'document';
}

export function buildPendingTextMessage(
  id: string,
  text: string,
): WhatsappMessage {
  return {
    id,
    externalId: id,
    fromMe: true,
    body: text,
    messageType: 'text',
    sentAt: new Date().toISOString(),
  };
}

export function buildPendingAttachmentMessage(
  id: string,
  file: File,
  caption?: string,
): WhatsappMessage {
  const messageType = messageTypeFromUploadFile(file);
  return {
    id,
    externalId: id,
    fromMe: true,
    body: caption?.trim() || null,
    messageType,
    mediaMetadata: {
      filename: file.name,
      mimetype: file.type || 'application/octet-stream',
      sizeBytes: file.size,
    },
    sentAt: new Date().toISOString(),
  };
}

function messagesLikelyMatch(
  pending: WhatsappMessage,
  server: WhatsappMessage,
): boolean {
  if (!server.fromMe) {
    return false;
  }
  const pendingAt = new Date(pending.sentAt).getTime();
  const serverAt = new Date(server.sentAt).getTime();
  if (Math.abs(serverAt - pendingAt) > 120_000) {
    return false;
  }
  if (pending.messageType === 'text') {
    return (server.body?.trim() ?? '') === (pending.body?.trim() ?? '');
  }
  if (pending.messageType !== server.messageType) {
    return false;
  }
  const pendingCaption = pending.body?.trim() ?? '';
  const serverCaption = server.body?.trim() ?? '';
  return pendingCaption === serverCaption;
}

export function mergeWhatsappMessagesWithOptimistic(
  serverMessages: WhatsappMessage[],
  optimisticMessages: WhatsappMessage[],
): WhatsappMessage[] {
  const byId = new Map<string, WhatsappMessage>();
  for (const message of serverMessages) {
    byId.set(message.id, message);
  }
  for (const pending of optimisticMessages) {
    const matched = serverMessages.some((server) =>
      messagesLikelyMatch(pending, server),
    );
    if (!matched && !byId.has(pending.id)) {
      byId.set(pending.id, pending);
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );
}

export function pruneOptimisticWhatsappMessages(
  optimisticMessages: WhatsappMessage[],
  serverMessages: WhatsappMessage[],
): WhatsappMessage[] {
  return optimisticMessages.filter(
    (pending) =>
      !serverMessages.some((server) => messagesLikelyMatch(pending, server)),
  );
}
