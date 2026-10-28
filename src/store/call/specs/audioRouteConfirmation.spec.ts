import { combineReducers, configureStore } from '@reduxjs/toolkit';

import type { AppDispatch } from '@/store';
import { callEngine } from '@/services/voice/callEngine';
import { hasNativeAudioRouting } from '@/services/voice/chatwootCalls';

import callReducer, { addCall, markLocalCall, setAudioRoute, setCallActive } from '../callSlice';
import { callMediaActions } from '../callMediaActions';

jest.mock('@/services/voice/callEngine', () => ({
  callEngine: { setAudioRoute: jest.fn(async () => {}), setSpeaker: jest.fn(async () => {}) },
}));
jest.mock('@/services/voice/chatwootCalls', () => ({ hasNativeAudioRouting: jest.fn(() => true) }));

const buildStore = () => {
  const store = configureStore({
    reducer: combineReducers({
      calls: callReducer,
      auth: (state = { user: { id: 1, account_id: 1, accounts: [] } }) => state,
    }),
  });
  store.dispatch(addCall({ callSid: 'current', provider: 'whatsapp', callDirection: 'outbound' }));
  store.dispatch(markLocalCall('current'));
  store.dispatch(setCallActive('current'));
  store.dispatch(
    setAudioRoute({ current: 'earpiece', available: ['earpiece', 'speaker', 'bluetooth'] }),
  );
  return store;
};

beforeEach(() => {
  jest.clearAllMocks();
  (hasNativeAudioRouting as jest.Mock).mockReturnValue(true);
});

test('an accepted Telecom request does not select a headset that failed to connect', async () => {
  const store = buildStore();
  const dispatch = store.dispatch as AppDispatch;
  await dispatch(callMediaActions.selectAudioRoute('bluetooth')).unwrap();
  expect(callEngine.setAudioRoute).toHaveBeenCalledWith('bluetooth');
  expect(store.getState().calls.audioRoute.current).toBe('earpiece');

  store.dispatch(
    setAudioRoute({ current: 'bluetooth', available: ['earpiece', 'speaker', 'bluetooth'] }),
  );
  expect(store.getState().calls.audioRoute.current).toBe('bluetooth');
});

test('speaker waits for the platform route report', async () => {
  const store = buildStore();
  await (store.dispatch as AppDispatch)(callMediaActions.toggleSpeaker()).unwrap();
  expect(callEngine.setSpeaker).toHaveBeenCalledWith(true);
  expect(store.getState().calls.audioRoute.current).toBe('earpiece');
});

test('an audio report received during a request is not overwritten by the requested route', async () => {
  const store = buildStore();
  (callEngine.setAudioRoute as jest.Mock).mockImplementationOnce(async () => {
    store.dispatch(setAudioRoute({ current: 'speaker', available: ['earpiece', 'speaker'] }));
  });
  await (store.dispatch as AppDispatch)(callMediaActions.selectAudioRoute('bluetooth')).unwrap();
  expect(store.getState().calls.audioRoute.current).toBe('speaker');
});

test('the non-Telecom speaker control still updates its state', async () => {
  (hasNativeAudioRouting as jest.Mock).mockReturnValue(false);
  const store = buildStore();
  await (store.dispatch as AppDispatch)(callMediaActions.toggleSpeaker()).unwrap();
  expect(store.getState().calls.audioRoute.current).toBe('speaker');
});
