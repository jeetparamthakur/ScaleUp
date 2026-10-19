import { formatWhatsappConversationTitle } from '@/lib/inbox/format-whatsapp-conversation-title';

describe('formatWhatsappConversationTitle', () => {
  it('formats phone jids like WhatsApp', () => {
    expect(
      formatWhatsappConversationTitle(
        '919632037640@c.us',
        '919632037640@c.us',
        false,
      ),
    ).toBe('+91 96320 37640');
  });

  it('uses server-resolved title as-is', () => {
    expect(
      formatWhatsappConversationTitle('+91 96320 37640', '108383550087287@lid', false),
    ).toBe('+91 96320 37640');
  });
});
