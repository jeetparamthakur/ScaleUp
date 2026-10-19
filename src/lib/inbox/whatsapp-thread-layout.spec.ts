import {
  bubbleGroupPosition,
  buildWhatsappThreadRows,
  formatThreadDayLabel,
} from '@/lib/inbox/whatsapp-thread-layout';
import type { WhatsappMessage } from '@/lib/inbox/whatsapp-types';

function message(
  partial: Partial<WhatsappMessage> & Pick<WhatsappMessage, 'id' | 'fromMe' | 'sentAt'>,
): WhatsappMessage {
  return {
    body: partial.body ?? 'hi',
    messageType: partial.messageType ?? 'text',
    conversationId: partial.conversationId ?? 'c1',
    ...partial,
  };
}

describe('buildWhatsappThreadRows', () => {
  it('groups consecutive messages from the same side on the same day', () => {
    const rows = buildWhatsappThreadRows([
      message({ id: '1', fromMe: false, sentAt: '2026-10-09T10:00:00.000Z' }),
      message({ id: '2', fromMe: false, sentAt: '2026-10-09T10:01:00.000Z' }),
      message({ id: '3', fromMe: true, sentAt: '2026-10-09T10:02:00.000Z' }),
    ]);

    expect(rows.filter((row) => row.kind === 'day')).toHaveLength(1);
    const clusters = rows.filter((row) => row.kind === 'cluster');
    expect(clusters).toHaveLength(2);
    expect(clusters[0].messages).toHaveLength(2);
    expect(clusters[1].messages).toHaveLength(1);
  });
});

describe('bubbleGroupPosition', () => {
  it('marks middle of a three-message cluster', () => {
    expect(bubbleGroupPosition(1, 3)).toBe('middle');
    expect(bubbleGroupPosition(0, 3)).toBe('first');
    expect(bubbleGroupPosition(2, 3)).toBe('last');
  });
});

describe('formatThreadDayLabel', () => {
  it('returns Yesterday for prior calendar day', () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    expect(formatThreadDayLabel(yesterday.toISOString())).toBe('Yesterday');
  });
});
