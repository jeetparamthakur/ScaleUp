const JID_SUFFIX_PATTERN =
  /@(c\.us|lid|g\.us|s\.whatsapp\.net|broadcast)$/i;

export function looksLikeWhatsappJid(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed.includes('@')) {
    return false;
  }
  return JID_SUFFIX_PATTERN.test(trimmed) || trimmed.includes('@');
}

export function formatWhatsappPhoneDigits(digits: string): string {
  const normalized = digits.replace(/\D/g, '');
  if (!normalized) {
    return '';
  }
  if (normalized.length < 8) {
    return normalized;
  }
  if (normalized.length === 10) {
    return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
  }
  if (normalized.length >= 11) {
    const localLen = 10;
    const country = normalized.slice(0, normalized.length - localLen);
    const local = normalized.slice(-localLen);
    return `+${country} ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return `+${normalized}`;
}

function formatWhatsappChatIdForDisplay(chatId: string, isGroup: boolean): string {
  const trimmed = chatId.trim();
  if (!trimmed) {
    return isGroup ? 'Group' : '';
  }
  if (isGroup) {
    return 'Group';
  }

  const atIndex = trimmed.indexOf('@');
  const local = atIndex >= 0 ? trimmed.slice(0, atIndex) : trimmed;
  const suffix = atIndex >= 0 ? trimmed.slice(atIndex + 1).toLowerCase() : '';
  const digits = local.replace(/\D/g, '');

  if (suffix === 'c.us' || suffix === 's.whatsapp.net') {
    return formatWhatsappPhoneDigits(digits);
  }
  if (suffix === 'lid') {
    if (digits.length >= 8 && digits.length <= 13) {
      return formatWhatsappPhoneDigits(digits);
    }
    return '';
  }
  if (digits.length >= 8 && digits.length <= 15) {
    return formatWhatsappPhoneDigits(digits);
  }
  return '';
}

/** Display title from API (already resolved server-side when possible). */
export function formatWhatsappConversationTitle(
  title: string,
  chatId: string,
  isGroup: boolean,
): string {
  const trimmedTitle = title.trim();
  if (trimmedTitle && !looksLikeWhatsappJid(trimmedTitle)) {
    return trimmedTitle;
  }
  const fromChatId = formatWhatsappChatIdForDisplay(chatId, isGroup);
  if (fromChatId) {
    return fromChatId;
  }
  if (trimmedTitle && looksLikeWhatsappJid(trimmedTitle)) {
    const fromTitle = formatWhatsappChatIdForDisplay(trimmedTitle, isGroup);
    if (fromTitle) {
      return fromTitle;
    }
  }
  return trimmedTitle;
}
