import reducer, {
  addCall,
  clearActiveCall,
  dismissCall,
  handleCallStatusChanged,
  markCallDismissed,
  markLocalCall,
  clearLocalCall,
  markSystemUiFailed,
  removeCall,
  setCallActive,
  setMinimised,
  setPlacingCall,
  setSystemUuid,
  setAudioRoute,
  setSpeakerOn,
  keepOnlyLocalCall,
} from '../callSlice';
import type { CallState } from '../callTypes';

const initial = (): CallState => reducer(undefined, { type: 'INIT' });

const ringing = (callSid: string, extra = {}) => ({
  callSid,
  callId: 1,
  provider: 'whatsapp' as const,
  conversationId: 37,
  inboxId: 7,
  callDirection: 'inbound' as const,
  ...extra,
});

describe('callSlice', () => {
  it('starts empty', () => {
    expect(initial()).toEqual({
      calls: [],
      dismissedCallSids: [],
      localCallSid: null,
      isJoining: false,
      isMuted: false,
      isOnHold: false,
      audioRoute: { current: 'earpiece', available: ['earpiece', 'speaker'], names: {} },
      isMinimised: false,
      placingCall: null,
    });
  });

  it('follows the audio route the platform reports, keeping the last one when unknown', () => {
    let state = reducer(
      initial(),
      setAudioRoute({
        current: 'bluetooth',
        available: ['earpiece', 'speaker', 'bluetooth'],
        names: { bluetooth: 'AirPods' },
      }),
    );
    expect(state.audioRoute.current).toBe('bluetooth');
    state = reducer(
      state,
      setAudioRoute({ current: 'unknown', available: ['earpiece', 'speaker', 'bluetooth'] }),
    );
    expect(state.audioRoute).toEqual({
      current: 'bluetooth',
      available: ['earpiece', 'speaker', 'bluetooth'],
      names: { bluetooth: 'AirPods' },
    });
  });

  it('turns the speaker off to a headset when one is on offer, else the earpiece', () => {
    let state = reducer(initial(), setSpeakerOn(true));
    expect(state.audioRoute.current).toBe('speaker');
    expect(reducer(state, setSpeakerOn(false)).audioRoute.current).toBe('earpiece');
    state = reducer(
      state,
      setAudioRoute({ current: 'speaker', available: ['earpiece', 'speaker', 'wired'] }),
    );
    expect(reducer(state, setSpeakerOn(false)).audioRoute.current).toBe('wired');
  });

  it('adds new calls to the front so the newest rings first', () => {
    let state = reducer(initial(), addCall(ringing('a')));
    state = reducer(state, addCall(ringing('b')));
    expect(state.calls.map(call => call.callSid)).toEqual(['b', 'a']);
    expect(state.calls[0].isActive).toBe(false);
    expect(typeof state.calls[0].addedAt).toBe('number');
  });

  it('merges a repeat by callSid, keeping the earlier caller snapshot and active flag', () => {
    let state = reducer(
      initial(),
      addCall(ringing('a', { caller: { name: 'Devi' }, isActive: true })),
    );
    state = reducer(state, addCall(ringing('a', { sdpOffer: 'v=0' })));
    expect(state.calls).toHaveLength(1);
    expect(state.calls[0]).toMatchObject({
      caller: { name: 'Devi' },
      sdpOffer: 'v=0',
      isActive: true,
    });
  });

  it('refuses to add a call that was dismissed', () => {
    let state = reducer(initial(), markCallDismissed('a'));
    state = reducer(state, addCall(ringing('a')));
    expect(state.calls).toEqual([]);
  });

  it('dismisses locally and remembers the sid', () => {
    let state = reducer(initial(), addCall(ringing('a')));
    state = reducer(state, dismissCall('a'));
    expect(state.calls).toEqual([]);
    expect(state.dismissedCallSids).toEqual(['a']);
  });

  it('removes on terminal status only', () => {
    let state = reducer(initial(), addCall(ringing('a')));
    state = reducer(state, handleCallStatusChanged({ callSid: 'a', status: 'in-progress' }));
    expect(state.calls).toHaveLength(1);
    state = reducer(state, handleCallStatusChanged({ callSid: 'a', status: 'completed' }));
    expect(state.calls).toEqual([]);
    expect(state.dismissedCallSids).toEqual(['a']);
  });

  it('marks one call active and clears it', () => {
    let state = reducer(initial(), addCall(ringing('a')));
    state = reducer(state, addCall(ringing('b')));
    state = reducer(state, setCallActive('a'));
    expect(state.calls.find(call => call.callSid === 'a')?.isActive).toBe(true);
    expect(state.calls.find(call => call.callSid === 'b')?.isActive).toBe(false);
    state = reducer(state, clearActiveCall());
    expect(state.calls.map(call => call.callSid)).toEqual(['b']);
  });

  it('keeps only the local call across an account switch, recording the account it belongs to', () => {
    let state = reducer(initial(), addCall(ringing('a')));
    state = reducer(state, addCall(ringing('b')));
    state = reducer(state, addCall(ringing('c', { accountId: 9 })));
    state = reducer(state, markLocalCall('a'));
    state = reducer(state, setCallActive('c'));

    state = reducer(state, keepOnlyLocalCall(4));

    expect(state.calls.map(call => [call.callSid, call.accountId])).toEqual([
      ['c', 9],
      ['a', 4],
    ]);
  });

  it('removes by sid', () => {
    let state = reducer(initial(), addCall(ringing('a')));
    state = reducer(state, removeCall('a'));
    expect(state.calls).toEqual([]);
  });

  it('drops the placeholder once the outbound call has its id', () => {
    let state = reducer(initial(), setPlacingCall({ conversationId: 37, provider: 'whatsapp' }));
    expect(state.placingCall?.conversationId).toBe(37);
    state = reducer(state, addCall(ringing('a', { callDirection: 'outbound' })));
    expect(state.placingCall).toBeNull();
  });

  it('reopens the call screen when a new call arrives', () => {
    let state = reducer(initial(), addCall(ringing('a')));
    state = reducer(state, setMinimised(true));
    state = reducer(state, addCall(ringing('b')));
    expect(state.isMinimised).toBe(false);
  });

  it('reopens the call screen when a call goes active', () => {
    let state = reducer(initial(), addCall(ringing('a')));
    state = reducer(state, setMinimised(true));
    expect(state.isMinimised).toBe(true);
    state = reducer(state, setCallActive('a', 1000));
    expect(state.isMinimised).toBe(false);
  });

  it('tracks the locally owned call', () => {
    let state = reducer(initial(), markLocalCall('a'));
    expect(state.localCallSid).toBe('a');
    state = reducer(state, clearLocalCall('b'));
    expect(state.localCallSid).toBe('a');
    state = reducer(state, clearLocalCall('a'));
    expect(state.localCallSid).toBeNull();
  });

  it('records the system call id and a failed system ring, surviving a repeat add', () => {
    let state = reducer(initial(), addCall(ringing('a')));
    state = reducer(state, setSystemUuid({ callSid: 'a', systemUuid: 'uuid-a' }));
    state = reducer(state, markSystemUiFailed('b'));
    expect(state.calls[0].systemUuid).toBe('uuid-a');
    expect(state.calls[0].systemUiFailed).toBeUndefined();
    state = reducer(state, addCall(ringing('a', { caller: { name: 'Devi' } })));
    expect(state.calls[0].systemUuid).toBe('uuid-a');
    state = reducer(state, markSystemUiFailed('a'));
    expect(state.calls[0].systemUiFailed).toBe(true);
  });
});
