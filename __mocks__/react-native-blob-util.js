// The native module is absent in Jest; importing the real package throws while
// constructing its event emitter. Specs that exercise it define their own mock.
const fetch = jest.fn(() => Promise.reject(new Error('react-native-blob-util is mocked')));

module.exports = {
  __esModule: true,
  default: {
    config: jest.fn(() => ({ fetch })),
    fetch,
    wrap: jest.fn(path => `ReactNativeBlobUtil-file://${path}`),
    fs: {
      dirs: { CacheDir: '/cache' },
      exists: jest.fn(() => Promise.resolve(false)),
      ls: jest.fn(() => Promise.resolve([])),
      mv: jest.fn(() => Promise.resolve()),
      stat: jest.fn(() => Promise.resolve({ size: 0 })),
      unlink: jest.fn(() => Promise.resolve()),
    },
  },
};
