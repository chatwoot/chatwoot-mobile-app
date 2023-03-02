jest.mock('react-native-device-info', () => {
  return {
    getVersion: () => 4,
  };
});
