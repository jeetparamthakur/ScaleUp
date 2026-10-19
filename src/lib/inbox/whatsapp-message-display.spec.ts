import {
  whatsappMessageAttachmentCanOpenInBrowser,
  whatsappMessageDownloadFilename,
  whatsappMessageIsAudio,
  whatsappMessageIsDocument,
  whatsappMessageIsSticker,
  whatsappMessageIsVisualMedia,
  whatsappMessageVisualMediaKind,
} from './whatsapp-message-display';
import type { WhatsappMessage } from './whatsapp-types';

function msg(partial: Partial<WhatsappMessage>): WhatsappMessage {
  return {
    id: '1',
    externalId: 'ext',
    fromMe: false,
    body: null,
    messageType: 'text',
    sentAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('whatsappMessageIsVisualMedia', () => {
  it('treats image and video types as visual', () => {
    expect(whatsappMessageIsVisualMedia(msg({ messageType: 'image' }))).toBe(true);
    expect(whatsappMessageIsVisualMedia(msg({ messageType: 'video' }))).toBe(true);
    expect(whatsappMessageIsVisualMedia(msg({ messageType: 'gif' }))).toBe(true);
  });

  it('treats gif mimetype on image rows as visual', () => {
    expect(
      whatsappMessageIsVisualMedia(
        msg({
          messageType: 'image',
          mediaMetadata: { mimetype: 'image/gif' },
        }),
      ),
    ).toBe(true);
  });

  it('ignores plain text', () => {
    expect(whatsappMessageIsVisualMedia(msg({ messageType: 'text' }))).toBe(false);
  });
});

describe('whatsappMessageIsSticker', () => {
  it('detects sticker type', () => {
    expect(whatsappMessageIsSticker(msg({ messageType: 'sticker' }))).toBe(true);
    expect(whatsappMessageIsSticker(msg({ messageType: 'image' }))).toBe(false);
  });
});

describe('whatsappMessageIsAudio', () => {
  it('detects audio and ptt', () => {
    expect(whatsappMessageIsAudio(msg({ messageType: 'ptt' }))).toBe(true);
    expect(whatsappMessageIsAudio(msg({ messageType: 'audio' }))).toBe(true);
  });
});

describe('whatsappMessageIsDocument', () => {
  it('detects document rows', () => {
    expect(
      whatsappMessageIsDocument(
        msg({ messageType: 'document', mediaMetadata: { mimetype: 'application/pdf' } }),
      ),
    ).toBe(true);
    expect(whatsappMessageIsDocument(msg({ messageType: 'image' }))).toBe(false);
  });
});

describe('whatsappMessageDownloadFilename', () => {
  it('uses metadata filename when present', () => {
    expect(
      whatsappMessageDownloadFilename(
        msg({
          messageType: 'image',
          mediaMetadata: { filename: 'scan.pdf' },
        }),
      ),
    ).toBe('scan.pdf');
  });

  it('derives names from type and mimetype', () => {
    expect(
      whatsappMessageDownloadFilename(
        msg({
          messageType: 'image',
          mediaMetadata: { mimetype: 'image/jpeg' },
        }),
      ),
    ).toBe('Photo.jpg');
    expect(
      whatsappMessageDownloadFilename(
        msg({
          messageType: 'video',
          mediaMetadata: { mimetype: 'video/mp4' },
        }),
      ),
    ).toBe('Video.mp4');
    expect(whatsappMessageDownloadFilename(msg({ messageType: 'ptt' }))).toBe(
      'Voice.bin',
    );
  });
});

describe('whatsappMessageAttachmentCanOpenInBrowser', () => {
  it('allows common preview types', () => {
    expect(
      whatsappMessageAttachmentCanOpenInBrowser(
        msg({ messageType: 'document', mediaMetadata: { mimetype: 'application/pdf' } }),
      ),
    ).toBe(true);
    expect(
      whatsappMessageAttachmentCanOpenInBrowser(
        msg({ messageType: 'image', mediaMetadata: { mimetype: 'image/png' } }),
      ),
    ).toBe(true);
  });
});

describe('whatsappMessageVisualMediaKind', () => {
  it('classifies video and image/gif', () => {
    expect(whatsappMessageVisualMediaKind(msg({ messageType: 'video' }))).toBe('video');
    expect(
      whatsappMessageVisualMediaKind(
        msg({ messageType: 'image', mediaMetadata: { mimetype: 'image/gif' } }),
      ),
    ).toBe('image');
  });
});
