/**
 * Appium Server Check
 * 
 * A simple script to check if Appium server is running and what capabilities it supports.
 * Run with: node e2e/check-appium.js
 */

const wdio = require('webdriverio');

// Try to get Appium server status
const checkAppium = async () => {
  console.log('Checking Appium server status...');
  
  try {
    // Create a simple connection to get server status
    const browser = await wdio.remote({
      protocol: 'http',
      hostname: 'localhost',
      port: 4723,
      path: '/wd/hub',
      connectionRetryTimeout: 10000,
      connectionRetryCount: 2,
      logLevel: 'info',
      capabilities: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2'
      }
    });
    
    // Get server status and capabilities
    console.log('Successfully connected to Appium server!');
    
    try {
      const status = await browser.status();
      console.log('Appium server status:', JSON.stringify(status, null, 2));
    } catch (e) {
      console.error('Could not get server status:', e.message);
    }
    
    await browser.deleteSession();
    
  } catch (error) {
    console.error('Error connecting to Appium server:', error.message);
    
    // Try with different path
    try {
      console.log('Trying with root path...');
      
      const browser = await wdio.remote({
        protocol: 'http',
        hostname: 'localhost',
        port: 4723,
        path: '/',
        connectionRetryTimeout: 10000,
        connectionRetryCount: 2,
        logLevel: 'info',
        capabilities: {
          platformName: 'Android',
          'appium:automationName': 'UiAutomator2'
        }
      });
      
      console.log('Successfully connected to Appium server with /wd/hub path!');
      await browser.deleteSession();
    } catch (e) {
      console.error('Failed to connect to Appium with /wd/hub path:', e.message);
    }
  }
};

// Run the check
checkAppium().catch(console.error);