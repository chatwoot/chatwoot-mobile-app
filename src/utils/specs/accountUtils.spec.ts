import { getStore } from '@/store/storeAccessor';
import { resolveAccountAccess, resolveAccountSwitch } from '@/utils/accountUtils';

jest.mock('@/store/storeAccessor', () => ({
  getStore: jest.fn(),
}));

const mockGetStore = getStore as jest.MockedFunction<typeof getStore>;

const setActiveAccount = (accountId: number, accountIds: number[]) => {
  mockGetStore.mockReturnValue({
    getState: () => ({
      auth: {
        user: {
          account_id: accountId,
          accounts: accountIds.map(id => ({ id })),
        },
      },
    }),
  } as ReturnType<typeof getStore>);
};

describe('resolveAccountAccess', () => {
  it('allows navigation without a switch for the active account', () => {
    setActiveAccount(1, [1, 2]);

    expect(resolveAccountAccess(1)).toEqual({ hasAccess: true, accountId: null });
  });

  it('allows navigation and returns an accessible account to switch to', () => {
    setActiveAccount(1, [1, 2]);

    expect(resolveAccountAccess(2)).toEqual({ hasAccess: true, accountId: 2 });
  });

  it('rejects navigation to an inaccessible account', () => {
    setActiveAccount(1, [1, 2]);

    expect(resolveAccountAccess(3)).toEqual({ hasAccess: false, accountId: null });
  });
});

describe('resolveAccountSwitch call-screen compatibility', () => {
  it('returns only the target ID for an accessible different account', () => {
    setActiveAccount(1, [1, 2]);
    expect(resolveAccountSwitch(2)).toBe(2);
  });

  it('returns null for the current account, inaccessible accounts and absent targets', () => {
    setActiveAccount(1, [1, 2]);
    expect(resolveAccountSwitch(1)).toBeNull();
    expect(resolveAccountSwitch(3)).toBeNull();
    expect(resolveAccountSwitch()).toBeNull();
  });
});
