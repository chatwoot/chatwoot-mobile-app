import { combineReducers, configureStore } from '@reduxjs/toolkit';

import callReducer, { addCall, markLocalCall, setPlacingCall } from '@/store/call/callSlice';
import { setStore } from '@/store/storeAccessor';

import { switchAccount } from '../accountUtils';
import { showToast } from '../toastUtils';

jest.mock('../toastUtils', () => ({ showToast: jest.fn() }));
jest.mock('@/store/auth/authActions', () => ({
  authActions: { setActiveAccount: jest.fn(() => ({ type: 'auth/setActiveAccount' })) },
}));

const build = () => {
  const store = configureStore({
    reducer: combineReducers({
      calls: callReducer,
      auth: (state = { user: { id: 1, account_id: 1, accounts: [] } }) => state,
    }),
  });
  setStore(store);
  return store;
};

describe('switchAccount during a call', () => {
  beforeEach(() => jest.clearAllMocks());

  it('switches when no call is on this device', () => {
    const store = build();
    expect(switchAccount(store.dispatch, 2)).toBe(true);
    expect(showToast).not.toHaveBeenCalled();
  });

  it('refuses to leave the account of a call being placed', () => {
    const store = build();
    store.dispatch(setPlacingCall({ conversationId: 3, provider: 'whatsapp', accountId: 1 }));

    expect(switchAccount(store.dispatch, 2)).toBe(false);
    expect(showToast).toHaveBeenCalledTimes(1);
  });

  it('refuses to leave the account of a call this device placed and is ringing out', () => {
    const store = build();
    store.dispatch(
      addCall({ callSid: 'out', provider: 'whatsapp', callDirection: 'outbound', accountId: 1 }),
    );
    store.dispatch(markLocalCall('out'));

    expect(switchAccount(store.dispatch, 2)).toBe(false);
  });

  it("switches to the call's own account", () => {
    const store = build();
    store.dispatch(
      addCall({ callSid: 'other', provider: 'whatsapp', callDirection: 'inbound', accountId: 2 }),
    );
    store.dispatch(markLocalCall('other'));

    expect(switchAccount(store.dispatch, 2)).toBe(true);
  });
});
