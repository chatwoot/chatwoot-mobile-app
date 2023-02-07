jest.mock('@react-native-firebase/messaging', () => () => {
  return {
    getToken: jest.fn(() => Promise.resolve('fd79y-tiw4t-9ygv2-4fiw4-yghqw-4t79f')),
  };
});
