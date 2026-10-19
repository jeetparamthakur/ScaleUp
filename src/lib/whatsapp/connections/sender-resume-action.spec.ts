import {
  getWhatsappSenderResumeAction,
  getWhatsappSenderResumeActionLabel,
} from '@/lib/whatsapp/connections/sender-resume-action';

describe('getWhatsappSenderResumeAction', () => {
  it('uses reconnect for disconnected senders', () => {
    expect(getWhatsappSenderResumeAction('disconnected', '+15551234567')).toBe(
      'reconnect',
    );
  });

  it('uses continue for in-progress setup without a linked phone', () => {
    expect(getWhatsappSenderResumeAction('qr_ready', null)).toBe('continue');
  });

  it('maps actions to button labels', () => {
    expect(getWhatsappSenderResumeActionLabel('reconnect')).toBe('Reconnect');
    expect(getWhatsappSenderResumeActionLabel('continue')).toBe('Continue');
  });
});
