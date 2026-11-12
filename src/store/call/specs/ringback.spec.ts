import { configureStore } from '@reduxjs/toolkit';

import reducer, { addCall, markLocalCall, setCallActive } from '../callSlice';
import { selectIsRingingBack } from '../callSelectors';

const build = () => configureStore({ reducer: { calls: reducer } });

type Store = ReturnType<typeof build>;
const ringingBack = (store: Store) =>
  selectIsRingingBack(store.getState() as Parameters<typeof selectIsRingingBack>[0]);

const placed = (provider: 'whatsapp' | 'twilio', callSid = 'wacid.1') => ({
  callSid,
  callId: 1,
  provider,
  conversationId: 37,
  inboxId: 7,
  callDirection: 'outbound' as const,
});

describe('selectIsRingingBack', () => {
  it('rings back on a WhatsApp call this device placed until the contact answers', () => {
    const store = build();
    store.dispatch(addCall(placed('whatsapp')));
    store.dispatch(markLocalCall('wacid.1'));
    expect(ringingBack(store)).toBe(true);
    store.dispatch(setCallActive('wacid.1'));
    expect(ringingBack(store)).toBe(false);
  });

  it('leaves Twilio calls and calls placed elsewhere silent', () => {
    const store = build();
    store.dispatch(addCall(placed('twilio', 'CA1')));
    store.dispatch(markLocalCall('CA1'));
    expect(ringingBack(store)).toBe(false);
    store.dispatch(addCall(placed('whatsapp', 'wacid.2')));
    expect(ringingBack(store)).toBe(false);
  });
});
