/** OpenWA contact id for the connected account's own WhatsApp profile picture. */
export function whatsappSenderSelfChatId(
  phone: string | null | undefined,
): string | null {
  if (!phone?.trim()) {
    return null;
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) {
    return null;
  }
  return `${digits}@c.us`;
}
