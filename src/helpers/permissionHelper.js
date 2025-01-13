import * as Sentry from '@sentry/react-native';

export const getCurrentAccount = ({ accounts = [] } = {}, accountId = null) => {
  return accounts.find(account => Number(account.id) === Number(accountId));
};

export const getUserPermissions = (user, accountId) => {
  try {
    const currentAccount = getCurrentAccount(user, accountId) || {};
    return currentAccount.permissions || [];
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        user,
        accountId,
        functionName: 'getUserPermissions',
      },
    });
    return [];
  }
};
