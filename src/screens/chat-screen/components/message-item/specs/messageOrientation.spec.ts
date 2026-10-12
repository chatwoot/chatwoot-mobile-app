import { MESSAGE_TYPES, ORIENTATION } from '@/constants';
import { getMessageOrientation, shouldShowSenderAvatar } from '../messageOrientation';

describe('getMessageOrientation', () => {
  it('puts contact messages on the left', () => {
    expect(getMessageOrientation(MESSAGE_TYPES.INCOMING)).toBe(ORIENTATION.LEFT);
  });

  it('puts every message from the business side on the right, whoever sent it', () => {
    expect(getMessageOrientation(MESSAGE_TYPES.OUTGOING)).toBe(ORIENTATION.RIGHT);
    expect(getMessageOrientation(MESSAGE_TYPES.TEMPLATE)).toBe(ORIENTATION.RIGHT);
  });

  it('keeps activity messages centred', () => {
    expect(getMessageOrientation(MESSAGE_TYPES.ACTIVITY)).toBe(ORIENTATION.CENTER);
  });
});

describe('shouldShowSenderAvatar', () => {
  it('shows an avatar for the contact and for other senders on the business side', () => {
    expect(shouldShowSenderAvatar(MESSAGE_TYPES.INCOMING, false)).toBe(true);
    expect(shouldShowSenderAvatar(MESSAGE_TYPES.OUTGOING, false)).toBe(true);
    expect(shouldShowSenderAvatar(MESSAGE_TYPES.TEMPLATE, false)).toBe(true);
  });

  it('shows none for the signed-in agent or for activity messages', () => {
    expect(shouldShowSenderAvatar(MESSAGE_TYPES.OUTGOING, true)).toBe(false);
    expect(shouldShowSenderAvatar(MESSAGE_TYPES.ACTIVITY, false)).toBe(false);
  });
});
