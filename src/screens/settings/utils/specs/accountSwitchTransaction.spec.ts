import { runAccountSwitchTransaction } from '../accountSwitchTransaction';

describe('runAccountSwitchTransaction', () => {
  it('commits local state only after the remote account switch succeeds', async () => {
    const calls: string[] = [];

    const result = await runAccountSwitchTransaction({
      updateRemoteAccount: async () => {
        calls.push('remote');
      },
      commitLocalAccount: () => calls.push('local'),
      onSuccess: () => calls.push('success'),
      onFailure: () => calls.push('failure'),
    });

    expect(result).toBe(true);
    expect(calls).toEqual(['remote', 'local', 'success']);
  });

  it('preserves local state when the remote account switch fails', async () => {
    const commitLocalAccount = jest.fn();
    const onSuccess = jest.fn();
    const onFailure = jest.fn();

    const result = await runAccountSwitchTransaction({
      updateRemoteAccount: async () => {
        throw new Error('request failed');
      },
      commitLocalAccount,
      onSuccess,
      onFailure,
    });

    expect(result).toBe(false);
    expect(commitLocalAccount).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledTimes(1);
  });
});
