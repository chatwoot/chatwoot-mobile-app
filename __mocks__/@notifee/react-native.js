// Self-contained Notifee mock.
//
// Notifee's official jest mock (@notifee/react-native/jest-mock) ships as
// untransformed ES modules, which this project's Jest config does not transform,
// so requiring it throws "Cannot use import statement outside a module". We mock
// only the surface the app uses (see src/utils/pushUtils.ts).
const notifee = {
  createChannel: jest.fn(() => Promise.resolve('default')),
  cancelAllNotifications: jest.fn(() => Promise.resolve()),
  setBadgeCount: jest.fn(() => Promise.resolve()),
  getBadgeCount: jest.fn(() => Promise.resolve(0)),
  displayNotification: jest.fn(() => Promise.resolve()),
};

module.exports = {
  __esModule: true,
  default: notifee,
  AndroidImportance: { NONE: 0, MIN: 1, LOW: 2, DEFAULT: 3, HIGH: 4 },
};
