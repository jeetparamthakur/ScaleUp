import type { WhatsappMessage } from '@/lib/inbox/whatsapp-types';

function readFilename(metadata: WhatsappMessage['mediaMetadata']): string | null {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }
  const filename = metadata.filename;
  return typeof filename === 'string' && filename.trim() ? filename.trim() : null;
}

function readMimetype(metadata: WhatsappMessage['mediaMetadata']): string | null {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }
  const mimetype = metadata.mimetype;
  return typeof mimetype === 'string' && mimetype.trim() ? mimetype.trim().toLowerCase() : null;
}

function readSizeBytes(metadata: WhatsappMessage['mediaMetadata']): number | null {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }
  const sizeBytes = metadata.sizeBytes;
  return typeof sizeBytes === 'number' && sizeBytes > 0 ? sizeBytes : null;
}

export function whatsappMessageIsSticker(message: WhatsappMessage): boolean {
  return (message.messageType?.toLowerCase() ?? '') === 'sticker';
}

export function whatsappMessageIsAudio(message: WhatsappMessage): boolean {
  const type = message.messageType?.toLowerCase() ?? 'text';
  const mimetype = readMimetype(message.mediaMetadata);
  return (
    type === 'audio' ||
    type === 'ptt' ||
    type === 'voice' ||
    Boolean(mimetype?.startsWith('audio/'))
  );
}

export function whatsappMessageIsDocument(message: WhatsappMessage): boolean {
  const type = message.messageType?.toLowerCase() ?? 'text';
  if (type === 'document') {
    return true;
  }
  if (
    whatsappMessageIsVisualMedia(message) ||
    whatsappMessageIsAudio(message) ||
    whatsappMessageIsSticker(message)
  ) {
    return false;
  }
  const mimetype = readMimetype(message.mediaMetadata);
  return Boolean(mimetype?.startsWith('application/'));
}

export function whatsappMessageMediaFilename(message: WhatsappMessage): string | null {
  return readFilename(message.mediaMetadata);
}

const MIMETYPE_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/3gpp': '3gp',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'application/pdf': 'pdf',
};

function extensionFromMimetype(mimetype: string | null): string {
  if (!mimetype) {
    return 'bin';
  }
  const base = mimetype.split(';')[0]?.trim().toLowerCase() ?? '';
  const mapped = MIMETYPE_EXTENSION[base];
  if (mapped) {
    return mapped;
  }
  const slash = base.indexOf('/');
  if (slash >= 0 && slash < base.length - 1) {
    const subtype = base.slice(slash + 1).replace(/[^a-z0-9.+-]/g, '');
    if (subtype && subtype !== 'octet-stream') {
      return subtype.includes('/') ? 'bin' : subtype;
    }
  }
  return 'bin';
}

function defaultBasenameForMessageType(type: string): string {
  switch (type) {
    case 'image':
    case 'sticker':
    case 'gif':
      return 'Photo';
    case 'video':
      return 'Video';
    case 'audio':
    case 'ptt':
    case 'voice':
      return 'Voice';
    case 'document':
      return 'Document';
    case 'unknown':
      return 'Attachment';
    default:
      return 'Attachment';
  }
}

/** Filename for download links when metadata has no explicit name. */
export function whatsappMessageDownloadFilename(message: WhatsappMessage): string {
  const fromMeta = readFilename(message.mediaMetadata);
  if (fromMeta) {
    return fromMeta;
  }
  const type = message.messageType?.toLowerCase() ?? 'text';
  const mimetype = readMimetype(message.mediaMetadata);
  const ext = extensionFromMimetype(mimetype);
  const base = defaultBasenameForMessageType(type);
  return `${base}.${ext}`;
}

export function whatsappMessageMediaSizeLabel(message: WhatsappMessage): string | null {
  const bytes = readSizeBytes(message.mediaMetadata);
  if (!bytes) {
    return null;
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10_240 ? 1 : 0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function whatsappMessagePreviewLabel(message: WhatsappMessage): string {
  const type = message.messageType?.toLowerCase() ?? 'text';
  const filename = readFilename(message.mediaMetadata);

  if (type === 'image' || type === 'sticker') {
    return message.body?.trim() || 'Photo';
  }
  if (type === 'video') {
    return message.body?.trim() || 'Video';
  }
  if (type === 'audio' || type === 'ptt' || type === 'voice') {
    return message.body?.trim() || 'Audio';
  }
  if (type === 'document' || filename) {
    return message.body?.trim() || filename || 'Document';
  }
  return message.body?.trim() || `(${message.messageType})`;
}

export function whatsappMessageIsMedia(message: WhatsappMessage): boolean {
  const type = message.messageType?.toLowerCase() ?? 'text';
  return type !== 'text' && type !== 'chat';
}

export function whatsappMessageIsVisualMedia(message: WhatsappMessage): boolean {
  const type = message.messageType?.toLowerCase() ?? 'text';
  const mimetype = readMimetype(message.mediaMetadata);
  if (type === 'video' || mimetype?.startsWith('video/')) {
    return true;
  }
  if (type === 'image' || type === 'sticker' || type === 'gif') {
    return true;
  }
  return Boolean(mimetype?.startsWith('image/'));
}

export function whatsappMessageVisualMediaKind(
  message: WhatsappMessage,
): 'image' | 'video' {
  const type = message.messageType?.toLowerCase() ?? 'text';
  const mimetype = readMimetype(message.mediaMetadata);
  if (type === 'video' || mimetype?.startsWith('video/')) {
    return 'video';
  }
  return 'image';
}

export function whatsappMessageAttachmentCanOpenInBrowser(
  message: WhatsappMessage,
): boolean {
  const mimetype = readMimetype(message.mediaMetadata);
  if (!mimetype) {
    const type = message.messageType?.toLowerCase() ?? '';
    return (
      type === 'image' ||
      type === 'video' ||
      type === 'sticker' ||
      type === 'gif' ||
      type === 'audio' ||
      type === 'ptt' ||
      type === 'voice'
    );
  }
  return (
    mimetype.startsWith('image/') ||
    mimetype.startsWith('video/') ||
    mimetype.startsWith('audio/') ||
    mimetype === 'application/pdf'
  );
}

export function whatsappMessageMediaCaption(message: WhatsappMessage): string | null {
  const body = message.body?.trim();
  if (!body || !whatsappMessageIsMedia(message)) {
    return null;
  }
  const placeholder = whatsappMessagePreviewLabel(message);
  if (body === placeholder) {
    return null;
  }
  return body;
}
