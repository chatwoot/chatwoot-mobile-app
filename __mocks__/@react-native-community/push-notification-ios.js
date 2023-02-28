jest.mock('@react-native-community/push-notification-ios', () => {
  return {
    setApplicationIconBadgeNumber: jest.fn(() => Promise.resolve()),
    removeAllDeliveredNotifications: jest.fn(() => Promise.resolve()),
  };
});
