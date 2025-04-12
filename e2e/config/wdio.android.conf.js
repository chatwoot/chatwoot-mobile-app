require('dotenv').config();

exports.config = {
  hostname: 'localhost',
  port: 4723,
  path: '/wd/hub',
  specs: ['../android/specs/**/*.test.js'],
  framework: 'mocha',
  capabilities: [{
    platformName: 'Android',
    'appium:platformVersion': '12.0', // Change this to your Android version
    'appium:deviceName': 'Android Emulator', // Change this to your device name
    'appium:automationName': 'UiAutomator2',
    'appium:app': '/path/to/your/app.apk', // Will need to be updated with actual app path after build
    'appium:appPackage': 'com.chatwoot.app',
    'appium:appActivity': '.MainActivity',
  }],
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
};