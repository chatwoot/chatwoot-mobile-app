jest.mock('react-native-safari-view', () => {
  return {
    isAvailable: jest.fn(() => Promise.resolve(true)),
    show: jest.fn(() => Promise.resolve()),
    dismiss: jest.fn(() => Promise.resolve()),
  };
});
