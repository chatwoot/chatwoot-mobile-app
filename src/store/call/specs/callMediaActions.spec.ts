import { combineReducers, configureStore } from '@reduxjs/toolkit';

import type { AppDispatch } from '@/store';
import { callEngine } from '@/services/voice/callEngine';

import callReducer, { addCall, setCallActive, markLocalCall } from '../callSlice';
import { callActions } from '../callActions';
import { CallService } from '../callService';

jest.mock('../callService', () => ({
  CallService: {
    getWhatsappCall: jest.fn(),
    acceptWhatsappCall: jest.fn(),
    terminateWhatsappCall: jest.fn(),
    leaveConference: jest.fn(),
  },
}));

const authReducer = (state = { user: { id: 1, account_id: 1, accounts: [] } }) => state;
const buildStore = () =>
  configureStore({ reducer: combineReducers({ calls: callReducer, auth: authReducer }) });
type Store = ReturnType<typeof buildStore>;
const run = (store: Store) => store.dispatch as unknown as AppDispatch;

const ringingWhatsapp = {
  callSid: 'wacid.1',
  callId: 5,
  provider: 'whatsapp' as const,
  callDirection: 'inbound' as const,
  conversationId: 37,
  inboxId: 7,
  sdpOffer: 'v=0 offer',
  iceServers: [{ urls: 'stun:stun.example' }],
};

const httpError = (status: number, error?: string) =>
  Object.assign(new Error('request failed'), { response: { status, data: { error } } });

describe('callActions.joinCall', () => {
  let createAnswer: jest.SpyInstance;
  let hangup: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    createAnswer = jest.spyOn(callEngine.whatsapp, 'createAnswer').mockResolvedValue('v=0 answer');
    hangup = jest.spyOn(callEngine.whatsapp, 'hangup').mockResolvedValue(undefined);
  });

  afterEach(() => {
    createAnswer.mockRestore();
    hangup.mockRestore();
  });

  it('answers with a gathered SDP and marks the call active on this device', async () => {
    (CallService.acceptWhatsappCall as jest.Mock).mockResolvedValue({
      id: 5,
      status: 'in-progress',
    });
    const store = buildStore();
    store.dispatch(addCall(ringingWhatsapp));

    const result = await run(store)(callActions.joinCall('wacid.1')).unwrap();

    expect(result).toEqual({ status: 'joined' });
    expect(createAnswer).toHaveBeenCalledWith('v=0 offer', [{ urls: 'stun:stun.example' }]);
    expect(CallService.acceptWhatsappCall).toHaveBeenCalledWith(5, 'v=0 answer', 1);
    const state = store.getState().calls;
    expect(state.localCallSid).toBe('wacid.1');
    expect(state.calls[0].isActive).toBe(true);
    expect(typeof state.calls[0].activeSince).toBe('number');
    expect(state.isJoining).toBe(false);
  });

  it('fetches the offer when the ring arrived without one', async () => {
    (CallService.getWhatsappCall as jest.Mock).mockResolvedValue({
      sdp_offer: 'v=0 fetched',
      ice_servers: [{ urls: 'turn:turn.example', username: 'u', credential: 'c' }],
    });
    (CallService.acceptWhatsappCall as jest.Mock).mockResolvedValue({});
    const store = buildStore();
    store.dispatch(addCall({ ...ringingWhatsapp, sdpOffer: undefined, iceServers: undefined }));

    await run(store)(callActions.joinCall('wacid.1')).unwrap();

    expect(CallService.getWhatsappCall).toHaveBeenCalledWith(5, 1);
    expect(createAnswer).toHaveBeenCalledWith('v=0 fetched', [
      { urls: 'turn:turn.example', username: 'u', credential: 'c' },
    ]);
  });

  it('reports answered elsewhere on a 409, releases the mic and drops the call', async () => {
    (CallService.acceptWhatsappCall as jest.Mock).mockRejectedValue(
      httpError(409, 'Sam is already handling the call.'),
    );
    const store = buildStore();
    store.dispatch(addCall(ringingWhatsapp));

    const result = await run(store)(callActions.joinCall('wacid.1')).unwrap();

    expect(result).toEqual({ status: 'answered_elsewhere' });
    expect(hangup).toHaveBeenCalled();
    expect(store.getState().calls.calls).toEqual([]);
    expect(store.getState().calls.localCallSid).toBeNull();
  });

  it('reports already ended when the 409 says the call ended', async () => {
    (CallService.acceptWhatsappCall as jest.Mock).mockRejectedValue(
      httpError(409, 'Call already ended'),
    );
    const store = buildStore();
    store.dispatch(addCall(ringingWhatsapp));

    expect(await run(store)(callActions.joinCall('wacid.1')).unwrap()).toEqual({
      status: 'already_ended',
    });
  });

  it('cleans up and rethrows on any other failure', async () => {
    (CallService.acceptWhatsappCall as jest.Mock).mockRejectedValue(httpError(500));
    const store = buildStore();
    store.dispatch(addCall(ringingWhatsapp));

    await expect(run(store)(callActions.joinCall('wacid.1')).unwrap()).rejects.toBeTruthy();

    expect(hangup).toHaveBeenCalled();
    expect(store.getState().calls.localCallSid).toBeNull();
    expect(store.getState().calls.isJoining).toBe(false);
    expect(store.getState().calls.calls[0].isActive).toBe(false);
  });
  it('ends the call this device is on before answering another', async () => {
    (CallService.acceptWhatsappCall as jest.Mock).mockResolvedValue({
      id: 6,
      status: 'in-progress',
    });
    (CallService.terminateWhatsappCall as jest.Mock).mockResolvedValue({
      id: 5,
      status: 'completed',
    });
    const store = buildStore();
    store.dispatch(addCall(ringingWhatsapp));
    store.dispatch(markLocalCall('wacid.1'));
    store.dispatch(setCallActive('wacid.1'));
    store.dispatch(addCall({ ...ringingWhatsapp, callSid: 'wacid.2', callId: 6 }));

    await run(store)(callActions.joinCall('wacid.2')).unwrap();

    expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(5, undefined);
    const terminated = (CallService.terminateWhatsappCall as jest.Mock).mock.invocationCallOrder[0];
    const accepted = (CallService.acceptWhatsappCall as jest.Mock).mock.invocationCallOrder[0];
    expect(terminated).toBeLessThan(accepted);
    const state = store.getState().calls;
    expect(state.localCallSid).toBe('wacid.2');
    expect(state.calls.find(call => call.isActive)?.callSid).toBe('wacid.2');
  });
});

describe('callActions.endCall and controls', () => {
  let hangup: jest.SpyInstance;
  let setMuted: jest.SpyInstance;
  let setSpeaker: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    hangup = jest.spyOn(callEngine.whatsapp, 'hangup').mockResolvedValue(undefined);
    setMuted = jest.spyOn(callEngine, 'setMuted').mockResolvedValue(undefined);
    setSpeaker = jest.spyOn(callEngine, 'setSpeaker').mockResolvedValue(undefined);
  });

  afterEach(() => {
    hangup.mockRestore();
    setMuted.mockRestore();
    setSpeaker.mockRestore();
  });

  const activeStore = () => {
    const store = buildStore();
    store.dispatch(addCall(ringingWhatsapp));
    store.dispatch(markLocalCall('wacid.1'));
    store.dispatch(setCallActive('wacid.1'));
    return store;
  };

  it('terminates the provider call, releases the mic and clears state', async () => {
    (CallService.terminateWhatsappCall as jest.Mock).mockResolvedValue({});
    const store = activeStore();
    await run(store)(callActions.toggleMute()).unwrap();

    await run(store)(callActions.endCall()).unwrap();

    expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(5, undefined);
    expect(hangup).toHaveBeenCalled();
    const state = store.getState().calls;
    expect(state.calls).toEqual([]);
    expect(state.localCallSid).toBeNull();
    expect(state.isMuted).toBe(false);
    expect(state.dismissedCallSids).toContain('wacid.1');
  });

  it('still releases the mic and clears state when the terminate request fails', async () => {
    (CallService.terminateWhatsappCall as jest.Mock).mockRejectedValue(httpError(500));
    const store = activeStore();

    await expect(run(store)(callActions.endCall()).unwrap()).rejects.toBeTruthy();

    expect(hangup).toHaveBeenCalled();
    expect(store.getState().calls.calls).toEqual([]);
  });

  it('toggles mute and speaker through the engine', async () => {
    const store = activeStore();

    expect(await run(store)(callActions.toggleMute()).unwrap()).toBe(true);
    expect(setMuted).toHaveBeenLastCalledWith(true);
    expect(await run(store)(callActions.toggleMute()).unwrap()).toBe(false);
    expect(setMuted).toHaveBeenLastCalledWith(false);

    expect(await run(store)(callActions.toggleSpeaker()).unwrap()).toBe(true);
    expect(setSpeaker).toHaveBeenLastCalledWith(true);
    expect(store.getState().calls.audioRoute.current).toBe('speaker');
  });
});
