import { getVoiceCallDisplay } from '../voiceCallCardUtils';
import { Message, MessageType } from '@/types';

const baseMessage: Message = {
  id: 1,
  attachments: [],
  content: 'Voice call',
  contentAttributes: null,
  contentType: 'voice_call',
  conversationId: 1,
  createdAt: 1,
  echoId: null,
  inboxId: 1,
  messageType: MessageType.outgoing,
  private: false,
  sender: null,
  sourceId: null,
  status: 'sent',
  call: null,
  lastNonActivityMessage: null,
  conversation: null,
  senderId: 1,
};

describe('getVoiceCallDisplay', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses patched content attributes over stale call status for ended outbound calls', () => {
    const message: Message = {
      ...baseMessage,
      call: {
        status: 'ringing',
        direction: 'outgoing',
      },
      contentAttributes: {
        contentType: 'voice_call',
        data: {
          status: 'completed',
          durationSeconds: 15,
          callDirection: 'outbound',
        },
      } as Message['contentAttributes'],
    };

    expect(getVoiceCallDisplay(message)).toMatchObject({
      titleKey: 'VOICE_CALL.CALL_ENDED',
      detailKeys: ['VOICE_CALL.YOU_CALLED'],
      duration: '0:15',
    });
  });

  it('labels completed inbound calls as answered', () => {
    const message: Message = {
      ...baseMessage,
      messageType: MessageType.incoming,
      call: {
        status: 'completed',
        direction: 'incoming',
        durationSeconds: 37,
      },
    };

    expect(getVoiceCallDisplay(message)).toMatchObject({
      titleKey: 'VOICE_CALL.CALL_ENDED',
      detailKeys: ['VOICE_CALL.YOU_ANSWERED'],
      duration: '0:37',
    });
  });

  it('does not let stale ringing content attributes override a terminal call status', () => {
    const message: Message = {
      ...baseMessage,
      messageType: MessageType.incoming,
      call: {
        status: 'no_answer',
        direction: 'incoming',
      },
      contentAttributes: {
        contentType: 'voice_call',
        data: {
          status: 'ringing',
          callDirection: 'inbound',
        },
      } as Message['contentAttributes'],
    };

    expect(getVoiceCallDisplay(message)).toMatchObject({
      titleKey: 'VOICE_CALL.MISSED_CALL',
    });
  });

  it('treats stale ringing calls as missed when the provider never sends a terminal update', () => {
    const message: Message = {
      ...baseMessage,
      messageType: MessageType.incoming,
      createdAt: 1,
      call: {
        status: 'ringing',
        direction: 'incoming',
      },
    };

    expect(getVoiceCallDisplay(message)).toMatchObject({
      titleKey: 'VOICE_CALL.MISSED_CALL',
    });
  });
});
