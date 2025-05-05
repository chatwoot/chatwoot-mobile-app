require('dotenv').config();

exports.config = {
  hostname: 'localhost',
  port: 4723,
  path: '/wd/hub',
  specs: ['../ios/specs/**/*.test.js'],
  framework: 'mocha',
  capabilities: [{
    platformName: 'iOS',
    'appium:platformVersion': '17.0', // Using the latest iOS simulator version
    'appium:deviceName': 'iPhone 15', // Using iPhone 15 simulator
    'appium:automationName': 'XCUITest',
    'appium:bundleId': 'com.chatwoot.app', // App bundle ID
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 60000
  }],
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  logLevel: 'info'
};