import type { Message } from '@/types';
import { transformMessage } from '../camelCaseKeys';
import {
  callsHiddenByConversationUpdate,
  extractCallData,
  routeVoiceCallCreated,
  routeVoiceCallUpdated,
  shouldRingInbound,
  shouldShowCall,
} from '../voiceCallRouting';

const AGENT_ID = 1;
const OTHER_AGENT_ID = 2;

// Shape of a ringing voice_call message as delivered over ActionCable
const ringingPayload = (overrides: Record<string, unknown> = {}) => ({
  id: 1900,
  content: 'WhatsApp Call',
  content_type: 'voice_call',
  message_type: 0,
  conversation_id: 37,
  inbox_id: 7,
  sender_id: 55,
  sender: { id: 55, name: 'Devi', phone_number: '+919447559855', thumbnail: '', type: 'contact' },
  conversation: { id: 37, inbox_id: 7, meta: { assignee: null } },
  call: {
    id: 9,
    provider_call_id: 'wacid.ring',
    provider: 'whatsapp',
    direction: 'incoming',
    status: 'ringing',
    accepted_by_agent_id: null,
    accepted_by_agent_name: null,
  },
  ...overrides,
});

const message = (overrides: Record<string, unknown> = {}) =>
  transformMessage(ringingPayload(overrides)) as Message;

const context = (overrides: Partial<Parameters<typeof routeVoiceCallCreated>[1]> = {}) => ({
  currentUserId: AGENT_ID,
  currentUserAvailability: 'online',
  dismissedCallSids: [],
  ...overrides,
});

describe('extractCallData', () => {
  it('reads the call, conversation and caller from a message', () => {
    expect(extractCallData(message())).toEqual({
      callSid: 'wacid.ring',
      callId: 9,
      provider: 'whatsapp',
      status: 'ringing',
      callDirection: 'inbound',
      conversationId: 37,
      inboxId: 7,
      assigneeId: null,
      senderId: 55,
      caller: { name: 'Devi', phone: '+919447559855', avatar: '' },
    });
  });

  it('maps outgoing to outbound and drops the caller snapshot for agent-sent messages', () => {
    const data = extractCallData(
      message({
        message_type: 1,
        sender_id: AGENT_ID,
        sender: { id: AGENT_ID, name: 'Sam', type: 'user' },
        call: { ...ringingPayload().call, direction: 'outgoing' },
      }),
    );
    expect(data.callDirection).toBe('outbound');
    expect(data.caller).toBeNull();
    expect(data.senderId).toBe(AGENT_ID);
  });
});

describe('shouldShowCall and shouldRingInbound', () => {
  it('shows unassigned inbound calls to everyone', () => {
    expect(
      shouldShowCall({ callDirection: 'inbound', assigneeId: null, currentUserId: AGENT_ID }),
    ).toBe(true);
  });

  it('hides inbound calls assigned to another agent', () => {
    expect(
      shouldShowCall({
        callDirection: 'inbound',
        assigneeId: OTHER_AGENT_ID,
        currentUserId: AGENT_ID,
      }),
    ).toBe(false);
  });

  it('shows outbound calls only to the agent who placed them', () => {
    expect(
      shouldShowCall({
        callDirection: 'outbound',
        senderId: AGENT_ID,
        assigneeId: OTHER_AGENT_ID,
        currentUserId: AGENT_ID,
      }),
    ).toBe(true);
    expect(
      shouldShowCall({
        callDirection: 'outbound',
        senderId: OTHER_AGENT_ID,
        assigneeId: null,
        currentUserId: AGENT_ID,
      }),
    ).toBe(false);
  });

  it('rings inbound only for online agents and outbound regardless', () => {
    expect(shouldRingInbound('inbound', 'online')).toBe(true);
    expect(shouldRingInbound('inbound', 'busy')).toBe(false);
    expect(shouldRingInbound('inbound', 'offline')).toBe(false);
    expect(shouldRingInbound('outbound', 'offline')).toBe(true);
  });
});

describe('routeVoiceCallCreated', () => {
  it('adds a ringing inbound call for an online agent', () => {
    const decision = routeVoiceCallCreated(message(), context());
    expect(decision).toEqual({
      action: 'add',
      call: {
        callSid: 'wacid.ring',
        callId: 9,
        provider: 'whatsapp',
        conversationId: 37,
        inboxId: 7,
        callDirection: 'inbound',
        senderId: 55,
        caller: { name: 'Devi', phone: '+919447559855', avatar: '' },
      },
    });
  });

  it.each([
    ['not a call message', message({ content_type: 'text' }), context()],
    [
      'already terminal',
      message({ call: { ...ringingPayload().call, status: 'completed' } }),
      context(),
    ],
    ['dismissed earlier', message(), context({ dismissedCallSids: ['wacid.ring'] })],
    ['agent is busy', message(), context({ currentUserAvailability: 'busy' })],
    [
      'assigned to someone else',
      message({ conversation: { id: 37, meta: { assignee: { id: OTHER_AGENT_ID } } } }),
      context(),
    ],
    [
      'outbound placed by someone else',
      message({
        message_type: 1,
        sender_id: OTHER_AGENT_ID,
        call: { ...ringingPayload().call, direction: 'outgoing' },
      }),
      context(),
    ],
  ])('ignores a call that is %s', (_case, msg, ctx) => {
    expect(routeVoiceCallCreated(msg, ctx)).toEqual({ action: 'ignore' });
  });

  it('adds an outbound call for the agent who placed it even when they are offline', () => {
    const decision = routeVoiceCallCreated(
      message({
        message_type: 1,
        sender_id: AGENT_ID,
        sender: { id: AGENT_ID, name: 'Sam', type: 'user' },
        call: { ...ringingPayload().call, direction: 'outgoing' },
      }),
      context({ currentUserAvailability: 'offline', localCallSid: 'wacid.ring' }),
    );
    expect(decision.action).toBe('add');
  });

  it('ignores an outbound call the same agent placed from another device', () => {
    const outbound = message({
      message_type: 1,
      sender_id: AGENT_ID,
      sender: { id: AGENT_ID, name: 'Sam', type: 'user' },
      call: { ...ringingPayload().call, direction: 'outgoing' },
    });
    expect(routeVoiceCallCreated(outbound, context({ localCallSid: null })).action).toBe('ignore');
    expect(routeVoiceCallUpdated(outbound, context({ localCallSid: 'other' })).action).toBe(
      'remove',
    );
  });
});

describe('routeVoiceCallUpdated', () => {
  it('removes a call the agent may no longer see', () => {
    const decision = routeVoiceCallUpdated(
      message({ conversation: { id: 37, meta: { assignee: { id: OTHER_AGENT_ID } } } }),
      context(),
    );
    expect(decision).toEqual({ action: 'remove', callSid: 'wacid.ring' });
  });

  it('keeps the call this device is on when its conversation moves to another agent', () => {
    const decision = routeVoiceCallUpdated(
      message({ conversation: { id: 37, meta: { assignee: { id: OTHER_AGENT_ID } } } }),
      context({ localCallSid: 'wacid.ring' }),
    );
    expect(decision).toEqual({ action: 'ignore' });
  });

  it('re-adds a still ringing call and ignores terminal updates', () => {
    expect(routeVoiceCallUpdated(message(), context()).action).toBe('add');
    expect(
      routeVoiceCallUpdated(
        message({ call: { ...ringingPayload().call, status: 'no-answer' } }),
        context(),
      ),
    ).toEqual({ action: 'ignore' });
  });
});

describe('callsHiddenByConversationUpdate', () => {
  const calls = [
    { callSid: 'in-1', conversationId: 37, callDirection: 'inbound' as const },
    {
      callSid: 'out-1',
      conversationId: 37,
      callDirection: 'outbound' as const,
      senderId: AGENT_ID,
    },
    { callSid: 'in-2', conversationId: 40, callDirection: 'inbound' as const },
  ];

  it('hides inbound calls of a conversation reassigned to another agent, keeps outbound', () => {
    const hidden = callsHiddenByConversationUpdate(
      { id: 37, meta: { assignee: { id: OTHER_AGENT_ID } } } as never,
      calls,
      AGENT_ID,
    );
    expect(hidden).toEqual(['in-1']);
  });

  it('keeps the call this device is on', () => {
    const hidden = callsHiddenByConversationUpdate(
      { id: 37, meta: { assignee: { id: OTHER_AGENT_ID } } } as never,
      calls,
      AGENT_ID,
      'in-1',
    );
    expect(hidden).toEqual([]);
  });

  it('hides nothing when the conversation is assigned to me or unassigned', () => {
    expect(
      callsHiddenByConversationUpdate(
        { id: 37, meta: { assignee: { id: AGENT_ID } } } as never,
        calls,
        AGENT_ID,
      ),
    ).toEqual([]);
    expect(
      callsHiddenByConversationUpdate(
        { id: 37, meta: { assignee: null } } as never,
        calls,
        AGENT_ID,
      ),
    ).toEqual([]);
  });
});
