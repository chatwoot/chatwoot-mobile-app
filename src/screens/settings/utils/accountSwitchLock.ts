type AccountSwitchLock = {
  current: boolean;
};

export const acquireAccountSwitchLock = (lock: AccountSwitchLock) => {
  if (lock.current) return false;

  lock.current = true;
  return true;
};

export const releaseAccountSwitchLock = (lock: AccountSwitchLock) => {
  lock.current = false;
};
