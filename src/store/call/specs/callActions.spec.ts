import { combineReducers, configureStore } from '@reduxjs/toolkit';
import conversationReducer from '@/store/conversation/conversationSlice';

import type { AppDispatch } from '@/store';

import callReducer, { addCall, markLocalCall, setCallActive, setPlacingCall } from '../callSlice';
import { callActions } from '../callActions';
import { CallService } from '../callService';
import { callEngine } from '@/services/voice/callEngine';
import { holdEarlyAccept, holdEarlyAnswer } from '../earlyOutboundEvents';

jest.mock('../callService', () => ({
  CallService: {
    startContactCall: jest.fn(),
    initiateWhatsappCall: jest.fn(),
    rejectWhatsappCall: jest.fn(),
    terminateWhatsappCall: jest.fn(),
    leaveConference: jest.fn(),
    getConferenceToken: jest.fn(),
    joinConference: jest.fn(),
    getRingingCalls: jest.fn(),
  },
}));

const authReducer = (state = { user: { id: 1, account_id: 1, accounts: [] } }) => state;

const buildStore = () =>
  configureStore({
    reducer: combineReducers({
      calls: callReducer,
      auth: authReducer,
      conversations: conversationReducer,
    }),
  });

type Store = ReturnType<typeof buildStore>;
// The thunks are typed against the app's RootState; this store only carries the slices they read
const run = (store: Store) => store.dispatch as unknown as AppDispatch;

const startTwilio = (store: Store) =>
  run(store)(
    callActions.startOutboundCall({
      provider: 'twilio',
      conversationId: 37,
      inboxId: 3,
      contactId: 55,
    }),
  ).unwrap();

describe('callActions.startOutboundCall', () => {
  beforeEach(() => jest.clearAllMocks());

  it("dials a Twilio contact and joins the conference as this device's outbound call", async () => {
    (CallService.startContactCall as jest.Mock).mockResolvedValue({
      conversation_id: 37,
      inbox_id: 3,
      call_sid: 'CA123',
      conference_sid: 'conf_1',
    });
    (CallService.getConferenceToken as jest.Mock).mockResolvedValue({ token: 'jwt' });
    (CallService.joinConference as jest.Mock).mockResolvedValue({ conference_sid: 'conf_1' });
    const connect = jest.spyOn(callEngine.twilio, 'connect').mockResolvedValue(undefined);
    const store = buildStore();

    const result = await startTwilio(store);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result).toEqual({ status: 'calling', callSid: 'CA123' });
    expect(CallService.startContactCall).toHaveBeenCalledWith({
      contactId: 55,
      inboxId: 3,
      conversationId: 37,
      accountId: 1,
    });
    expect(connect).toHaveBeenCalledWith('jwt', {
      To: 'conf_1',
      is_agent: 'true',
      conversation_id: '37',
      call_sid: 'CA123',
    });
    expect(store.getState().calls.localCallSid).toBe('CA123');
    expect(store.getState().calls.calls[0]).toMatchObject({
      callSid: 'CA123',
      provider: 'twilio',
      callDirection: 'outbound',
      senderId: 1,
      isActive: true,
    });
    connect.mockRestore();
  });

  it('reports answered elsewhere when the Twilio conference join is refused', async () => {
    (CallService.getConferenceToken as jest.Mock).mockResolvedValue({ token: 'jwt' });
    (CallService.joinConference as jest.Mock).mockRejectedValue(
      Object.assign(new Error('conflict'), { response: { status: 409, data: {} } }),
    );
    const connect = jest.spyOn(callEngine.twilio, 'connect').mockResolvedValue(undefined);
    const store = buildStore();
    store.dispatch(
      addCall({
        callSid: 'CA9',
        provider: 'twilio',
        callDirection: 'inbound',
        inboxId: 3,
        conversationId: 37,
      }),
    );

    const result = await run(store)(callActions.joinCall('CA9')).unwrap();

    expect(result).toEqual({ status: 'answered_elsewhere' });
    expect(connect).not.toHaveBeenCalled();
    expect(store.getState().calls.calls).toEqual([]);
    expect(store.getState().calls.localCallSid).toBeNull();
    connect.mockRestore();
  });

  it('leaves the conference the server accepted when the Twilio token request fails', async () => {
    (CallService.getConferenceToken as jest.Mock).mockRejectedValue(new Error('token failed'));
    (CallService.joinConference as jest.Mock).mockResolvedValue({ conference_sid: 'conf_1' });
    (CallService.leaveConference as jest.Mock).mockResolvedValue({ status: 'ok' });
    const store = buildStore();
    store.dispatch(
      addCall({
        callSid: 'CA10',
        provider: 'twilio',
        callDirection: 'inbound',
        inboxId: 3,
        conversationId: 37,
        accountId: 2,
      }),
    );

    await expect(run(store)(callActions.joinCall('CA10')).unwrap()).rejects.toMatchObject({
      message: 'token failed',
    });
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(CallService.leaveConference).toHaveBeenCalledWith({
      inboxId: 3,
      conversationId: 37,
      callSid: 'CA10',
      accountId: 2,
    });
    expect(store.getState().calls.localCallSid).toBeNull();
  });

  it('refuses to place a call while another call is ringing or active', async () => {
    const store = buildStore();
    store.dispatch(addCall({ callSid: 'ringing', callDirection: 'inbound' }));
    expect(await startTwilio(store)).toEqual({ status: 'locked' });

    store.dispatch(setCallActive('ringing'));
    expect(await startTwilio(store)).toEqual({ status: 'locked' });
    expect(CallService.startContactCall).not.toHaveBeenCalled();
  });

  it('surfaces the permission outcome for a WhatsApp contact who has not opted in', async () => {
    const createOffer = jest
      .spyOn(callEngine.whatsapp, 'createOffer')
      .mockResolvedValue('v=0 offer');
    (CallService.initiateWhatsappCall as jest.Mock).mockResolvedValue({
      status: 'permission_requested',
      conversation_id: 37,
    });
    const store = buildStore();

    const result = await run(store)(
      callActions.startOutboundCall({ provider: 'whatsapp', conversationId: 37, inboxId: 7 }),
    ).unwrap();

    expect(result).toEqual({ status: 'permission_requested' });
    expect(store.getState().calls.calls).toEqual([]);
    createOffer.mockRestore();
  });

  it('applies an answer that arrived before the call was placed', async () => {
    const createOffer = jest
      .spyOn(callEngine.whatsapp, 'createOffer')
      .mockResolvedValue('v=0 offer');
    const applyAnswer = jest.spyOn(callEngine.whatsapp, 'applyAnswer').mockResolvedValue(undefined);
    (CallService.initiateWhatsappCall as jest.Mock).mockImplementation(async () => {
      holdEarlyAnswer('wacid.early', 'v=0 answer');
      holdEarlyAccept('wacid.early');
      return {
        status: 'calling',
        call_id: 'wacid.early',
        id: 14,
        message_id: 901,
        conversation_id: 37,
        recording_enabled: true,
        provider: 'whatsapp',
      };
    });
    const store = buildStore();

    await run(store)(
      callActions.startOutboundCall({ provider: 'whatsapp', conversationId: 37, inboxId: 7 }),
    ).unwrap();

    expect(applyAnswer).toHaveBeenCalledWith('v=0 answer');
    const call = store.getState().calls.calls.find(entry => entry.callSid === 'wacid.early');
    expect(call?.isActive).toBe(true);
    createOffer.mockRestore();
    applyAnswer.mockRestore();
  });

  it('tracks a WhatsApp call once the offer is accepted', async () => {
    const createOffer = jest
      .spyOn(callEngine.whatsapp, 'createOffer')
      .mockResolvedValue('v=0 offer');
    (CallService.initiateWhatsappCall as jest.Mock).mockResolvedValue({
      status: 'calling',
      call_id: 'wacid.out',
      id: 12,
      message_id: 900,
      conversation_id: 37,
      recording_enabled: true,
      provider: 'whatsapp',
    });
    const store = buildStore();

    const result = await run(store)(
      callActions.startOutboundCall({ provider: 'whatsapp', conversationId: 37, inboxId: 7 }),
    ).unwrap();

    expect(result).toEqual({ status: 'calling', callSid: 'wacid.out' });
    expect(store.getState().calls.calls[0]).toMatchObject({
      callSid: 'wacid.out',
      callId: 12,
      provider: 'whatsapp',
      callDirection: 'outbound',
    });
    createOffer.mockRestore();
  });

  it('tears down a WhatsApp call the agent ended while it was still being placed', async () => {
    const store = buildStore();
    let resolveOffer: (offer: string) => void = () => {};
    const createOffer = jest
      .spyOn(callEngine.whatsapp, 'createOffer')
      .mockImplementation(() => new Promise(resolve => (resolveOffer = resolve)));
    const hangup = jest.spyOn(callEngine.whatsapp, 'hangup').mockResolvedValue(undefined);

    const placing = run(store)(
      callActions.startOutboundCall({ provider: 'whatsapp', conversationId: 37, inboxId: 7 }),
    ).unwrap();
    expect(store.getState().calls.placingCall).toMatchObject({ conversationId: 37 });

    await run(store)(callActions.cancelPlacingCall());
    expect(store.getState().calls.placingCall).toBeNull();
    resolveOffer('v=0 offer');

    expect(await placing).toEqual({ status: 'cancelled' });
    expect(CallService.initiateWhatsappCall).not.toHaveBeenCalled();
    expect(store.getState().calls.calls).toHaveLength(0);
    createOffer.mockRestore();
    hangup.mockRestore();
  });

  it('terminates a WhatsApp call the provider created after the agent had already ended it', async () => {
    const store = buildStore();
    const createOffer = jest
      .spyOn(callEngine.whatsapp, 'createOffer')
      .mockResolvedValue('v=0 offer');
    const hangup = jest.spyOn(callEngine.whatsapp, 'hangup').mockResolvedValue(undefined);
    let resolveInitiate: (value: unknown) => void = () => {};
    (CallService.initiateWhatsappCall as jest.Mock).mockImplementation(
      () => new Promise(resolve => (resolveInitiate = resolve)),
    );
    (CallService.terminateWhatsappCall as jest.Mock).mockResolvedValue({});

    const placing = run(store)(
      callActions.startOutboundCall({ provider: 'whatsapp', conversationId: 37, inboxId: 7 }),
    ).unwrap();
    await new Promise(resolve => setTimeout(resolve, 0));
    await run(store)(callActions.cancelPlacingCall());
    resolveInitiate({ status: 'calling', call_id: 'wacid.late', id: 13, conversation_id: 37 });

    expect(await placing).toEqual({ status: 'cancelled' });
    expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(13, 1);
    expect(store.getState().calls.calls).toHaveLength(0);
    createOffer.mockRestore();
    hangup.mockRestore();
  });

  it("leaves a newer call alone when a cancelled call's response arrives late", async () => {
    const store = buildStore();
    const createOffer = jest
      .spyOn(callEngine.whatsapp, 'createOffer')
      .mockResolvedValue('v=0 offer');
    let resolveInitiate: (value: unknown) => void = () => {};
    (CallService.initiateWhatsappCall as jest.Mock).mockImplementation(
      () => new Promise(resolve => (resolveInitiate = resolve)),
    );
    (CallService.terminateWhatsappCall as jest.Mock).mockResolvedValue({});

    const placing = run(store)(
      callActions.startOutboundCall({ provider: 'whatsapp', conversationId: 37, inboxId: 7 }),
    ).unwrap();
    await new Promise(resolve => setTimeout(resolve, 0));
    await run(store)(callActions.cancelPlacingCall());
    store.dispatch(markLocalCall('wacid.newer'));
    resolveInitiate({ status: 'calling', call_id: 'wacid.late', id: 13, conversation_id: 37 });

    expect(await placing).toEqual({ status: 'cancelled' });
    expect(store.getState().calls.localCallSid).toBe('wacid.newer');
    createOffer.mockRestore();
  });
});

describe('callActions.startOutboundCall while another call is being placed', () => {
  it('refuses a second call', async () => {
    const store = buildStore();
    store.dispatch(setPlacingCall({ conversationId: 37, inboxId: 7, provider: 'whatsapp' }));

    const result = await run(store)(
      callActions.startOutboundCall({ provider: 'whatsapp', conversationId: 40, inboxId: 7 }),
    ).unwrap();

    expect(result).toEqual({ status: 'locked' });
  });
});

describe('callActions.endLocalCalls', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ends an outbound call that is still ringing out', async () => {
    (CallService.terminateWhatsappCall as jest.Mock).mockResolvedValue({});
    const store = buildStore();
    store.dispatch(markLocalCall('wacid.out'));
    store.dispatch(
      addCall({
        callSid: 'wacid.out',
        callId: 21,
        provider: 'whatsapp',
        callDirection: 'outbound',
      }),
    );

    await run(store)(callActions.endLocalCalls());

    expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(21, undefined);
    expect(store.getState().calls.calls).toEqual([]);
  });

  it('gives up a call still being placed', async () => {
    const store = buildStore();
    store.dispatch(setPlacingCall({ conversationId: 37, inboxId: 7, provider: 'whatsapp' }));

    await run(store)(callActions.endLocalCalls());

    expect(store.getState().calls.placingCall).toBeNull();
  });
});

describe('callActions.rejectIncomingCall', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects an inbound WhatsApp call and dismisses it locally', async () => {
    (CallService.rejectWhatsappCall as jest.Mock).mockResolvedValue({ id: 5, status: 'rejected' });
    const store = buildStore();
    store.dispatch(
      addCall({ callSid: 'wa', callId: 5, provider: 'whatsapp', callDirection: 'inbound' }),
    );

    await run(store)(callActions.rejectIncomingCall('wa')).unwrap();

    expect(CallService.rejectWhatsappCall).toHaveBeenCalledWith(5, undefined);
    expect(store.getState().calls.calls).toEqual([]);
    expect(store.getState().calls.dismissedCallSids).toEqual(['wa']);
  });

  it('sends the decline to the account the call belongs to', async () => {
    (CallService.rejectWhatsappCall as jest.Mock).mockResolvedValue({ id: 5, status: 'rejected' });
    const store = buildStore();
    store.dispatch(
      addCall({
        callSid: 'wa',
        callId: 5,
        provider: 'whatsapp',
        callDirection: 'inbound',
        accountId: 9,
      }),
    );

    await run(store)(callActions.rejectIncomingCall('wa')).unwrap();

    expect(CallService.rejectWhatsappCall).toHaveBeenCalledWith(5, 9);
  });

  it('terminates an outbound WhatsApp call that is still ringing', async () => {
    (CallService.terminateWhatsappCall as jest.Mock).mockResolvedValue({
      id: 6,
      status: 'no_answer',
    });
    const store = buildStore();
    store.dispatch(
      addCall({ callSid: 'wa-out', callId: 6, provider: 'whatsapp', callDirection: 'outbound' }),
    );

    await run(store)(callActions.rejectIncomingCall('wa-out')).unwrap();

    expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(6, undefined);
    expect(CallService.rejectWhatsappCall).not.toHaveBeenCalled();
  });

  it('ends the conference for a Twilio call and still dismisses when the request fails', async () => {
    (CallService.leaveConference as jest.Mock).mockRejectedValue(new Error('boom'));
    const store = buildStore();
    store.dispatch(
      addCall({
        callSid: 'CA1',
        provider: 'twilio',
        callDirection: 'inbound',
        inboxId: 3,
        conversationId: 37,
      }),
    );

    await expect(run(store)(callActions.rejectIncomingCall('CA1')).unwrap()).rejects.toBeTruthy();

    expect(CallService.leaveConference).toHaveBeenCalledWith({
      inboxId: 3,
      conversationId: 37,
      callSid: 'CA1',
    });
    expect(store.getState().calls.calls).toEqual([]);
  });
});

describe('callActions.syncRingingCalls', () => {
  beforeEach(() => jest.clearAllMocks());

  it('surfaces the calls the server says are ringing, by conversation display id', async () => {
    (CallService.getRingingCalls as jest.Mock).mockResolvedValue([
      {
        id: 21,
        call_id: 'wacid.sync',
        provider: 'whatsapp',
        status: 'ringing',
        direction: 'inbound',
        created_at: 1_790_000_000,
        conversation: { id: 812345, display_id: 57 },
        inbox: { id: 7, name: 'Sales' },
        contact: { id: 3, name: 'Priya', phone_number: '+15555550142', avatar: null },
      },
    ]);
    const store = configureStore({
      reducer: combineReducers({
        calls: callReducer,
        auth: authReducer,
        conversations: conversationReducer,
      }),
      preloadedState: {
        auth: {
          ...buildStore().getState().auth,
          user: { id: 1, account_id: 1, accounts: [{ id: 1, availability: 'online' }] },
        },
      } as never,
    });

    const result = await run(store)(callActions.syncRingingCalls()).unwrap();

    const call = store.getState().calls.calls.find(entry => entry.callSid === 'wacid.sync');
    expect(call?.conversationId).toBe(57);
    expect(call?.caller?.name).toBe('Priya');
    expect(result).toEqual({ found: 1, ended: [] });
  });
});
