import { acquireAccountSwitchLock, releaseAccountSwitchLock } from '../accountSwitchLock';

describe('accountSwitchLock', () => {
  it('allows only one account switch until the lock is released', () => {
    const lock = { current: false };

    expect(acquireAccountSwitchLock(lock)).toBe(true);
    expect(acquireAccountSwitchLock(lock)).toBe(false);

    releaseAccountSwitchLock(lock);

    expect(acquireAccountSwitchLock(lock)).toBe(true);
  });
});
