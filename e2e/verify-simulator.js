/**
 * Verify Simulator Connection
 * 
 * A simple script to check if we can connect to the iOS simulator.
 * Run with: node e2e/verify-simulator.js
 */

const wdio = require('webdriverio');

const checkSimulator = async () => {
  console.log('Attempting to connect to iOS simulator...');
  
  // Simple capabilities just to launch Safari
  const capabilities = {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': 'iPhone 15',
    'appium:platformVersion': '18.2',
    'appium:browserName': 'Safari'
  };
  
  try {
    const driver = await wdio.remote({
      protocol: 'http',
      hostname: 'localhost',
      port: 4723,
      path: '/wd/hub',
      capabilities,
      logLevel: 'info',
      connectionRetryTimeout: 90000,
      connectionRetryCount: 3
    });
    
    console.log('Successfully connected to simulator!');
    
    // Navigate to a website
    await driver.navigateTo('https://appium.io');
    console.log('Navigated to Appium.io');
    
    // Get the page title
    const title = await driver.getTitle();
    console.log('Page title:', title);
    
    // Take a screenshot
    await driver.saveScreenshot('./e2e/screenshots/safari-test.png');
    console.log('Screenshot saved');
    
    // Close the session
    await driver.deleteSession();
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Error connecting to simulator:', error.message);
  }
};

// Run the check
checkSimulator().catch(console.error);