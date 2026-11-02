const RESULTS = {
  UNAVAILABLE: 'unavailable',
  DENIED: 'denied',
  LIMITED: 'limited',
  GRANTED: 'granted',
  BLOCKED: 'blocked',
};

const PERMISSIONS = {
  IOS: { MICROPHONE: 'ios.permission.MICROPHONE' },
  ANDROID: {
    RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
    BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
  },
};

module.exports = {
  RESULTS,
  PERMISSIONS,
  check: jest.fn().mockResolvedValue(RESULTS.GRANTED),
  request: jest.fn().mockResolvedValue(RESULTS.GRANTED),
  requestMultiple: jest.fn().mockResolvedValue({}),
  checkNotifications: jest.fn().mockResolvedValue({ status: RESULTS.GRANTED, settings: {} }),
  requestNotifications: jest.fn().mockResolvedValue({ status: RESULTS.GRANTED, settings: {} }),
  openSettings: jest.fn().mockResolvedValue(undefined),
};
