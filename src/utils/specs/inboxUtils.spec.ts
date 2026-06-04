import { Inbox } from '@/types/Inbox';
import {
  getVoiceCallProvider,
  isTwilioVoiceInbox,
  isVoiceCallEnabled,
  VOICE_CALL_PROVIDERS,
} from '@/utils/inboxUtils';

describe('isTwilioVoiceInbox', () => {
  it('returns true for voice-enabled Twilio phone inboxes', () => {
    expect(
      isTwilioVoiceInbox({
        id: 1,
        name: 'Support',
        channelType: 'Channel::TwilioSms',
        voiceEnabled: true,
      } as Inbox),
    ).toBe(true);
  });

  it('returns false for Twilio inboxes without voice enabled', () => {
    expect(
      isTwilioVoiceInbox({
        id: 1,
        name: 'SMS only',
        channelType: 'Channel::TwilioSms',
        voiceEnabled: false,
      } as Inbox),
    ).toBe(false);
  });

  it('returns false for Twilio WhatsApp inboxes', () => {
    expect(
      isTwilioVoiceInbox({
        id: 4,
        name: 'WhatsApp support',
        channelType: 'Channel::TwilioSms',
        medium: 'whatsapp',
        voiceEnabled: true,
      } as Inbox),
    ).toBe(false);
  });
});

describe('getVoiceCallProvider', () => {
  it('returns twilio for voice-enabled Twilio phone inboxes', () => {
    expect(
      getVoiceCallProvider({
        id: 1,
        name: 'Phone support',
        channelType: 'Channel::TwilioSms',
        medium: 'sms',
        voiceEnabled: true,
      } as Inbox),
    ).toBe(VOICE_CALL_PROVIDERS.TWILIO);
  });

  it('returns whatsapp for voice-enabled WhatsApp Cloud inboxes', () => {
    expect(
      getVoiceCallProvider({
        id: 2,
        name: 'WhatsApp support',
        channelType: 'Channel::Whatsapp',
        provider: 'whatsapp_cloud',
        voiceEnabled: true,
      } as Inbox),
    ).toBe(VOICE_CALL_PROVIDERS.WHATSAPP);
  });

  it('returns null for API phone-style inboxes without server voice support', () => {
    expect(
      getVoiceCallProvider({
        id: 3,
        name: 'Vendor phone',
        channelType: 'Channel::Api',
        webhookUrl: 'https://example.com/webhook',
      } as Inbox),
    ).toBeNull();
  });
});

describe('isVoiceCallEnabled', () => {
  it('returns true when a supported voice provider is enabled', () => {
    expect(
      isVoiceCallEnabled({
        id: 1,
        name: 'WhatsApp support',
        channelType: 'Channel::Whatsapp',
        voiceEnabled: true,
      } as Inbox),
    ).toBe(true);
  });

  it('returns false when a supported voice provider is not enabled', () => {
    expect(
      isVoiceCallEnabled({
        id: 1,
        name: 'WhatsApp support',
        channelType: 'Channel::Whatsapp',
        voiceEnabled: false,
      } as Inbox),
    ).toBe(false);
  });
});
