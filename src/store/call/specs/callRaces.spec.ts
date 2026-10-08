import { configureStore } from '@reduxjs/toolkit';
import { MediaStream, mediaDevices, RTCPeerConnection } from 'react-native-webrtc';

import { closeSession, trackJoin } from '@/services/voice/pendingJoins';
import { callEngine } from '@/services/voice/callEngine';
import { webrtcEngine } from '@/services/voice/webrtcEngine';

import reducer, { addCall, markCallDismissed } from '../callSlice';
import { callActions } from '../callActions';
import { selectFullScreenCall, selectIsSpeakerOn } from '../callSelectors';
import { CallService } from '../callService';

jest.mock('react-native-incall-manager', () => ({
  default: { setForceSpeakerphoneOn: jest.fn(), start: jest.fn(), stop: jest.fn() },
}));

jest.mock('../callService', () => ({
  CallService: {
    initiateWhatsappCall: jest.fn(),
    getWhatsappCall: jest.fn(async () => ({ sdp_offer: 'v=0 offer' })),
    acceptWhatsappCall: jest.fn(async () => ({})),
    terminateWhatsappCall: jest.fn(async () => ({})),
    getRingingCalls: jest.fn(),
  },
}));

const build = (availability = 'online') =>
  configureStore({
    reducer: {
      calls: reducer,
      auth: (
        state = {
          user: { id: 1, account_id: 1, accounts: [{ id: 1, availability }] },
        },
      ) => state,
    },
  });
type TestStore = ReturnType<typeof build>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dispatch = (store: TestStore, action: any) => (store.dispatch as any)(action);
const start = (store: TestStore) =>
  dispatch(
    store,
    callActions.startOutboundCall({ provider: 'whatsapp', conversationId: 37, inboxId: 7 }),
  ).unwrap();
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const lastStream = async () => {
  const { results } = (mediaDevices.getUserMedia as jest.Mock).mock;
  return results[results.length - 1].value;
};

afterEach(async () => {
  await webrtcEngine.hangup();
  jest.restoreAllMocks();
});

describe('call media races', () => {
  it('starts the next call unmuted after a muted call ends while ringing out', async () => {
    const store = build();
    (CallService.initiateWhatsappCall as jest.Mock)
      .mockResolvedValueOnce({ status: 'calling', call_id: 'first', id: 1 })
      .mockResolvedValueOnce({ status: 'calling', call_id: 'second', id: 2 });
    await start(store);
    await dispatch(store, callActions.toggleMute());
    await dispatch(store, callActions.rejectIncomingCall('first'));
    await start(store);
    const stream = await lastStream();
    expect(store.getState().calls.isMuted).toBe(false);
    expect(stream.getAudioTracks()[0].enabled).toBe(true);
  });

  it('keeps a newer call’s media when a cancelled offer fails late', async () => {
    const store = build();
    let failOld!: (error: Error) => void;
    jest.spyOn(RTCPeerConnection.prototype, 'createOffer').mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          failOld = reject;
        }),
    );
    const old = start(store).catch((error: unknown) => error);
    await flush();
    await dispatch(store, callActions.cancelPlacingCall());
    (CallService.initiateWhatsappCall as jest.Mock).mockResolvedValueOnce({
      status: 'calling',
      call_id: 'newer',
      id: 3,
    });
    await start(store);
    const newerStream = await lastStream();
    failOld(new Error('Peer connection is closed'));
    await old;
    expect(store.getState().calls.localCallSid).toBe('newer');
    expect(newerStream.getTracks()[0].stop).not.toHaveBeenCalled();
  });

  it('keeps a newer call’s media when a cancelled offer resolves late', async () => {
    const store = build();
    let finishOld!: (sdp: string) => void;
    jest.spyOn(webrtcEngine, 'createOffer').mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finishOld = resolve;
        }),
    );
    const old = start(store);
    await flush();
    await dispatch(store, callActions.cancelPlacingCall());
    (CallService.initiateWhatsappCall as jest.Mock).mockResolvedValueOnce({
      status: 'calling',
      call_id: 'newest',
      id: 4,
    });
    await start(store);
    const newerStream = await lastStream();
    finishOld('v=0 old');
    await old;
    expect(store.getState().calls.localCallSid).toBe('newest');
    expect(newerStream.getTracks()[0].stop).not.toHaveBeenCalled();
  });
});

describe('media opening', () => {
  const deferStream = () => {
    let release!: () => void;
    (mediaDevices.getUserMedia as jest.Mock).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          release = () => resolve(new MediaStream());
        }),
    );
    return () => release();
  };

  it('applies a mute made while the microphone is still opening', async () => {
    const store = build();
    (CallService.initiateWhatsappCall as jest.Mock).mockResolvedValueOnce({
      status: 'calling',
      call_id: 'muted-early',
      id: 5,
    });
    const releaseStream = deferStream();
    const placing = start(store);
    await flush();
    await dispatch(store, callActions.toggleMute());
    releaseStream();
    await placing;
    const stream = await lastStream();
    expect(store.getState().calls.isMuted).toBe(true);
    expect(stream.getAudioTracks()[0].enabled).toBe(false);
  });

  it('keeps a mute made while an answered call connects', async () => {
    const store = build();
    store.dispatch(
      addCall({ callSid: 'in', callId: 6, provider: 'whatsapp', callDirection: 'inbound' }),
    );
    const releaseStream = deferStream();
    const joining = dispatch(store, callActions.joinCall('in')).unwrap();
    await flush();
    await dispatch(store, callActions.toggleMute());
    releaseStream();
    expect(await joining).toEqual({ status: 'joined' });
    const stream = await lastStream();
    expect(store.getState().calls.isMuted).toBe(true);
    expect(stream.getAudioTracks()[0].enabled).toBe(false);
  });

  it('ends a call whose join was still in flight when the session ended', async () => {
    const store = build();
    store.dispatch(
      addCall({ callSid: 'joining', callId: 7, provider: 'whatsapp', callDirection: 'inbound' }),
    );
    let accept!: () => void;
    (CallService.acceptWhatsappCall as jest.Mock).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          accept = () => resolve({});
        }),
    );
    const joining = trackJoin('joining', dispatch(store, callActions.joinCall('joining')).unwrap());
    await flush();
    const ending = dispatch(store, callActions.endLocalCalls());
    accept();
    await joining;
    await ending;
    const stream = await lastStream();
    expect(store.getState().calls.calls.some(call => call.isActive)).toBe(false);
    expect(stream.getTracks()[0].stop).toHaveBeenCalled();
  });

  it('starts no join while the session’s calls are being ended', async () => {
    const store = build();
    store.dispatch(
      addCall({ callSid: 'late', callId: 8, provider: 'whatsapp', callDirection: 'inbound' }),
    );
    let result: unknown;
    await closeSession(async () => {
      result = await dispatch(store, callActions.joinCall('late')).unwrap();
    });
    expect(result).toEqual({ status: 'already_ended' });
    expect(CallService.acceptWhatsappCall).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: 8 }),
    );
  });

  it('keeps a speaker choice made while an answered call connects', async () => {
    const store = build();
    const setSpeaker = jest.spyOn(callEngine, 'setSpeaker').mockResolvedValue(undefined);
    store.dispatch(
      addCall({ callSid: 'loud', callId: 9, provider: 'whatsapp', callDirection: 'inbound' }),
    );
    const releaseStream = deferStream();
    const joining = dispatch(store, callActions.joinCall('loud')).unwrap();
    await flush();
    await dispatch(store, callActions.toggleSpeaker());
    releaseStream();
    await joining;
    expect(selectIsSpeakerOn(store.getState() as never)).toBe(true);
    expect(setSpeaker).toHaveBeenLastCalledWith(true);
  });

  it('releases the media of a call that ended before its placement returned', async () => {
    const store = build();
    (CallService.initiateWhatsappCall as jest.Mock).mockImplementationOnce(async () => {
      store.dispatch(markCallDismissed('early-end'));
      return { status: 'calling', call_id: 'early-end', id: 20 };
    });
    expect(await start(store)).toEqual({ status: 'cancelled' });
    const stream = await lastStream();
    expect(store.getState().calls.localCallSid).toBeNull();
    expect(stream.getTracks()[0].stop).toHaveBeenCalled();
  });

  describe('an answer whose response was lost', () => {
    const answerLost = async (acceptedBy: number) => {
      const store = build();
      store.dispatch(
        addCall({ callSid: 'lost', callId: 21, provider: 'whatsapp', callDirection: 'inbound' }),
      );
      (CallService.acceptWhatsappCall as jest.Mock).mockRejectedValueOnce(
        new Error('Network Error'),
      );
      (CallService.getWhatsappCall as jest.Mock).mockResolvedValue({
        sdp_offer: 'v=0 offer',
        accepted_by_agent_id: acceptedBy,
      });
      (CallService.terminateWhatsappCall as jest.Mock).mockClear();
      await dispatch(store, callActions.joinCall('lost'))
        .unwrap()
        .catch(() => {});
      (CallService.getWhatsappCall as jest.Mock).mockResolvedValue({ sdp_offer: 'v=0 offer' });
    };

    it('ends the call when the server recorded this agent as answering', async () => {
      await answerLost(1);
      expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(21, 1);
    });

    it("leaves another agent's call alone", async () => {
      await answerLost(99);
      expect(CallService.terminateWhatsappCall).not.toHaveBeenCalled();
    });
  });

  it('releases a microphone that opens after its session was abandoned', async () => {
    const releaseStream = deferStream();
    const offer = webrtcEngine.createOffer().catch((error: unknown) => error);
    await flush();
    webrtcEngine.abandonOpening();
    releaseStream();
    expect(await offer).toBeInstanceOf(Error);
    const stream = await lastStream();
    expect(stream.getTracks()[0].stop).toHaveBeenCalled();
  });
});

describe('syncRingingCalls', () => {
  const ringing = (direction: 'inbound' | 'outbound') => ({
    id: 10,
    call_id: `${direction}-call`,
    provider: 'whatsapp',
    status: 'ringing',
    direction,
    created_at: Date.now() / 1000,
    conversation: { id: 100, display_id: 37 },
    inbox: { id: 7, name: 'Sales' },
    contact: null,
  });

  it('leaves out an outbound call placed on another device', async () => {
    const store = build();
    (CallService.getRingingCalls as jest.Mock).mockResolvedValue([ringing('outbound')]);
    await dispatch(store, callActions.syncRingingCalls());
    expect(selectFullScreenCall(store.getState() as never)).toBeNull();
  });

  it('surfaces an inbound ring to an online agent only', async () => {
    (CallService.getRingingCalls as jest.Mock).mockResolvedValue([ringing('inbound')]);
    const online = build();
    await dispatch(online, callActions.syncRingingCalls());
    expect(online.getState().calls.calls.map(call => call.callSid)).toEqual(['inbound-call']);

    const busy = build('busy');
    await dispatch(busy, callActions.syncRingingCalls());
    expect(busy.getState().calls.calls).toHaveLength(0);
  });
});
