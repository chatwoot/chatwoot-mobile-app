import type { Inbox } from '@/types/Inbox';
import { buildContactCallOptions } from '../contactCallOptions';

const inbox = (overrides: Partial<Inbox>): Inbox => ({
  id: 1,
  avatarUrl: '',
  channelId: 1,
  name: 'Inbox',
  channelType: 'Channel::WebWidget',
  phoneNumber: '',
  medium: '',
  ...overrides,
});

const twilioVoice = inbox({
  id: 1,
  name: 'Support line',
  channelType: 'Channel::TwilioSms',
  medium: 'sms',
  voiceEnabled: true,
});
const whatsappCalling = inbox({
  id: 2,
  name: 'WhatsApp',
  channelType: 'Channel::Whatsapp',
  provider: 'whatsapp_cloud',
  voiceEnabled: true,
});
const whatsappWithoutCalling = inbox({ id: 3, channelType: 'Channel::Whatsapp' });
const website = inbox({ id: 4, channelType: 'Channel::WebWidget', voiceEnabled: true });

const describeOptions = (options: ReturnType<typeof buildContactCallOptions>) =>
  options.map(option =>
    option.type === 'dialer' ? 'dialer' : `${option.inbox.id}:${option.provider}`,
  );

describe('buildContactCallOptions', () => {
  it('offers only the dialer when no inbox can call', () => {
    expect(buildContactCallOptions([whatsappWithoutCalling, website])).toEqual([
      { type: 'dialer' },
    ]);
  });

  it('offers each inbox that can call, then the dialer', () => {
    const options = buildContactCallOptions([
      website,
      twilioVoice,
      whatsappWithoutCalling,
      whatsappCalling,
    ]);
    expect(describeOptions(options)).toEqual(['1:twilio', '2:whatsapp', 'dialer']);
  });

  it('puts the inbox of the conversation on screen first and continues in that conversation', () => {
    const options = buildContactCallOptions([twilioVoice, whatsappCalling], {
      id: 37,
      inboxId: 2,
    });
    expect(describeOptions(options)).toEqual(['2:whatsapp', '1:twilio', 'dialer']);
    expect(options[0]).toMatchObject({ type: 'inbox', conversationId: 37 });
    expect(options[1]).not.toHaveProperty('conversationId');
  });

  it('ignores a conversation in an inbox that cannot call', () => {
    const options = buildContactCallOptions([twilioVoice], { id: 37, inboxId: 4 });
    expect(describeOptions(options)).toEqual(['1:twilio', 'dialer']);
    expect(options[0]).not.toHaveProperty('conversationId');
  });

  describe('without a phone number', () => {
    it('offers only the WhatsApp conversation on screen', () => {
      const options = buildContactCallOptions(
        [twilioVoice, whatsappCalling],
        { id: 37, inboxId: 2 },
        false,
      );
      expect(describeOptions(options)).toEqual(['2:whatsapp']);
      expect(options[0]).toMatchObject({ type: 'inbox', conversationId: 37 });
    });

    it('offers nothing when the conversation on screen cannot be called by identity', () => {
      expect(
        buildContactCallOptions([twilioVoice, whatsappCalling], { id: 37, inboxId: 1 }, false),
      ).toEqual([]);
    });

    it('offers nothing without a conversation', () => {
      expect(buildContactCallOptions([twilioVoice, whatsappCalling], null, false)).toEqual([]);
    });
  });
});
