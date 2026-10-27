import { callFromPush } from '../callNotifications';

describe('callFromPush', () => {
  it('reads the ringing call a push describes', () => {
    expect(
      callFromPush({
        type: 'voice_call.incoming',
        call_id: 'wacid.1',
        id: '42',
        provider: 'whatsapp',
        conversation_id: '57',
        inbox_id: '7',
        account_id: '3',
        caller: JSON.stringify({ name: 'Test Customer', phone: '+15555550142', avatar: null }),
      }),
    ).toEqual({
      callSid: 'wacid.1',
      callId: 42,
      provider: 'whatsapp',
      conversationId: 57,
      inboxId: 7,
      accountId: 3,
      callDirection: 'inbound',
      caller: { name: 'Test Customer', phone: '+15555550142', avatar: undefined },
    });
  });

  it('keeps the call when the caller cannot be read', () => {
    expect(callFromPush({ call_id: 'CA1', provider: 'twilio', caller: '{' })?.caller).toBeNull();
  });

  it('needs a call id', () => {
    expect(callFromPush({ provider: 'twilio' })).toBeNull();
  });
});
