type AccountSwitchTransaction = {
  updateRemoteAccount: () => Promise<unknown>;
  commitLocalAccount: () => void;
  onSuccess: () => void;
  onFailure: () => void;
};

export const runAccountSwitchTransaction = async ({
  updateRemoteAccount,
  commitLocalAccount,
  onSuccess,
  onFailure,
}: AccountSwitchTransaction) => {
  try {
    await updateRemoteAccount();
    commitLocalAccount();
    onSuccess();
    return true;
  } catch {
    onFailure();
    return false;
  }
};
