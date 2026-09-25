import { Message, MessageCall } from '@/types';
import { transformMessage } from '../camelCaseKeys';
import { formatCallDuration, getVoiceCallDisplay } from '../voiceCallUtils';

// Captured from GET /api/v1/accounts/1/conversations/37/messages on a WhatsApp Cloud inbox
const completedInboundPayload = {
  id: 1869,
  content: 'WhatsApp Call',
  content_type: 'voice_call',
  message_type: 0,
  content_attributes: {
    data: {
      call_id: 1,
      call_sid:
        'wacid.IhggMDAxNzlFN0MzNTk0RkMyQUFCNUQ5QjVFQ0UyQkIxRDQcGAsxNTU1MTkzNzY2NRUCABUgAA==',
      call_source: 'whatsapp',
      call_direction: 'inbound',
      status: 'completed',
      accepted_by: { id: 1, name: 'Sam Taylor' },
      duration_seconds: 7,
    },
  },
  call: {
    id: 1,
    provider_call_id:
      'wacid.IhggMDAxNzlFN0MzNTk0RkMyQUFCNUQ5QjVFQ0UyQkIxRDQcGAsxNTU1MTkzNzY2NRUCABUgAA==',
    provider: 'whatsapp',
    direction: 'incoming',
    status: 'completed',
    duration_seconds: 7,
    end_reason: 'agent_hangup',
    conference_sid: null,
    accepted_by_agent_id: 1,
    accepted_by_agent_name: 'Sam Taylor',
    started_at: 1789594515,
    ended_at: 1789594522,
    from_number: '+919447559855',
    to_number: '+15551937665',
    recording_url: null,
    transcript: null,
  },
  attachments: [
    {
      id: 33,
      message_id: 1869,
      file_type: 'audio',
      account_id: 1,
      extension: 'ogg',
      content_type: 'audio/opus',
      data_url:
        'https://devi-dev.chatwoot.dev/rails/active_storage/blobs/redirect/abc/call-recording.ogg',
      thumb_url: '',
      file_size: 51769,
    },
  ],
  created_at: 1789594505,
};

const buildMessage = (overrides: Partial<Message> = {}, call: Partial<MessageCall> = {}) => {
  const base = transformMessage(completedInboundPayload);
  return { ...base, ...overrides, call: { ...base.call, ...call } } as Message;
};

describe('formatCallDuration', () => {
  it.each([
    [7, '00:07'],
    [65, '01:05'],
    [3661, '01:01:01'],
    [0, '00:00'],
  ])('formats %s seconds as %s', (seconds, expected) => {
    expect(formatCallDuration(seconds)).toBe(expected);
  });

  it.each([null, undefined, -1, Number.NaN])('returns an empty string for %s', value => {
    expect(formatCallDuration(value as number)).toBe('');
  });
});

describe('getVoiceCallDisplay', () => {
  it('describes a completed inbound call answered by an agent', () => {
    const display = getVoiceCallDisplay(buildMessage());

    expect(display).toMatchObject({
      status: 'completed',
      isOutbound: false,
      isFailed: false,
      isLive: false,
      labelKey: 'CONVERSATION.VOICE_CALL.CALL_ENDED',
      subtextKey: 'CONVERSATION.VOICE_CALL.HANDLED_BY',
      subtextParams: { agentName: 'Sam Taylor' },
      duration: '00:07',
      transcript: null,
    });
    expect(display.recording).toEqual({
      dataUrl:
        'https://devi-dev.chatwoot.dev/rails/active_storage/blobs/redirect/abc/call-recording.ogg',
      contentType: 'audio/opus',
      extension: 'ogg',
    });
  });

  it('prefers the audio attachment over call.recordingUrl and falls back to recordingUrl', () => {
    const withUrl = buildMessage({ attachments: [] }, { recordingUrl: 'https://x/rec.wav' });
    expect(getVoiceCallDisplay(withUrl).recording).toEqual({
      dataUrl: 'https://x/rec.wav',
      extension: 'wav',
    });
    expect(getVoiceCallDisplay(buildMessage({ attachments: [] })).recording).toBeNull();
  });

  it('labels an outbound completed call by the agent who dialed', () => {
    const display = getVoiceCallDisplay(
      buildMessage({ messageType: 1 }, { direction: 'outgoing' }),
    );
    expect(display.isOutbound).toBe(true);
    expect(display.labelKey).toBe('CONVERSATION.VOICE_CALL.CALL_ENDED');
    expect(display.subtextKey).toBe('CONVERSATION.VOICE_CALL.HANDLED_BY');
  });

  it('shows a ringing inbound call as incoming and not answered yet', () => {
    const display = getVoiceCallDisplay(
      buildMessage({}, { status: 'ringing', acceptedByAgentName: null, durationSeconds: null }),
    );
    expect(display).toMatchObject({
      isLive: true,
      labelKey: 'CONVERSATION.VOICE_CALL.INCOMING_CALL',
      subtextKey: 'CONVERSATION.VOICE_CALL.NOT_ANSWERED_YET',
      duration: '',
    });
  });

  it('shows a ringing outbound call as calling until someone handles it', () => {
    const ringing = buildMessage(
      { messageType: 1 },
      { status: 'ringing', direction: 'outgoing', acceptedByAgentName: null },
    );
    expect(getVoiceCallDisplay(ringing)).toMatchObject({
      labelKey: 'CONVERSATION.VOICE_CALL.OUTGOING_CALL',
      subtextKey: 'CONVERSATION.VOICE_CALL.CALLING',
    });

    const handled = buildMessage({ messageType: 1 }, { status: 'ringing', direction: 'outgoing' });
    expect(getVoiceCallDisplay(handled).subtextKey).toBe('CONVERSATION.VOICE_CALL.HANDLED_BY');
  });

  it('shows an in-progress call with its handler', () => {
    const display = getVoiceCallDisplay(buildMessage({}, { status: 'in-progress' }));
    expect(display).toMatchObject({
      isLive: true,
      labelKey: 'CONVERSATION.VOICE_CALL.CALL_IN_PROGRESS',
      subtextKey: 'CONVERSATION.VOICE_CALL.HANDLED_BY',
    });
  });

  it.each(['no-answer', 'failed', 'rejected'])(
    'treats an inbound %s call as missed with no agent picking up',
    status => {
      const display = getVoiceCallDisplay(
        buildMessage({}, { status: status as MessageCall['status'], acceptedByAgentName: null }),
      );
      expect(display).toMatchObject({
        isFailed: true,
        labelKey: 'CONVERSATION.VOICE_CALL.MISSED_CALL',
        subtextKey: 'CONVERSATION.VOICE_CALL.MISSED_CALL_INBOUND_SUBTEXT',
      });
    },
  );

  it('attributes a declined inbound call to the agent who declined it', () => {
    const display = getVoiceCallDisplay(
      buildMessage({}, { status: 'rejected', endReason: 'agent_rejected' }),
    );
    expect(display.subtextKey).toBe('CONVERSATION.VOICE_CALL.MISSED_CALL_DECLINED_BY');
    expect(display.subtextParams).toEqual({ agentName: 'Sam Taylor' });
  });

  it('treats an outbound no-answer call as the contact not picking up', () => {
    const display = getVoiceCallDisplay(
      buildMessage({ messageType: 1 }, { status: 'no-answer', direction: 'outgoing' }),
    );
    expect(display).toMatchObject({
      labelKey: 'CONVERSATION.VOICE_CALL.NO_ANSWER_OUTBOUND_LABEL',
      subtextKey: 'CONVERSATION.VOICE_CALL.NO_ANSWER_OUTBOUND_SUBTEXT',
    });
  });

  it('falls back to content_attributes.data when the call object is missing', () => {
    const message = buildMessage();
    delete (message as Partial<Message>).call;
    const display = getVoiceCallDisplay(message);
    expect(display).toMatchObject({
      status: 'completed',
      isOutbound: false,
      labelKey: 'CONVERSATION.VOICE_CALL.CALL_ENDED',
      subtextParams: { agentName: 'Sam Taylor' },
      duration: '00:07',
    });
  });

  it('falls back to message orientation when no direction is present', () => {
    const message = buildMessage({ messageType: 1 });
    delete (message as Partial<Message>).call;
    delete message.contentAttributes?.data?.callDirection;
    expect(getVoiceCallDisplay(message).isOutbound).toBe(true);
  });
});
