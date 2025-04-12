require('dotenv').config();

// Load environment variables
const getCredentials = () => {
  return {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'testpassword',
    baseUrl: process.env.EXPO_PUBLIC_CHATWOOT_BASE_URL || 'https://app.chatwoot.com',
  };
};

// Login helper
const login = async (driver) => {
  try {
    const { email, password, baseUrl } = getCredentials();
    
    console.log('Starting login process...');
    
    // Wait for app to load
    await driver.pause(10000);
    
    // Using multiple selector strategies to find elements
    console.log('Looking for Installation URL input field...');
    
    // Check if we need to set the base URL first
    try {
      // Try with accessibility ID
      const urlFields = await driver.$$('*//XCUIElementTypeTextField');
      
      if (urlFields.length > 0) {
        console.log(`Found ${urlFields.length} text fields`);
        // Most likely the first text field is the URL input
        await urlFields[0].setValue(baseUrl);
        
        // Try to find continue button
        const buttons = await driver.$$('*//XCUIElementTypeButton');
        if (buttons.length > 0) {
          console.log('Found a button, clicking it...');
          await buttons[0].click();
          await driver.pause(5000);
        }
      }
    } catch (error) {
      console.log('Could not set URL, might already be set:', error.message);
    }
    
    console.log('Attempting to find email and password fields...');
    
    // Try to find email field using multiple strategies
    try {
      const textFields = await driver.$$('*//XCUIElementTypeTextField');
      
      if (textFields.length > 0) {
        console.log(`Found ${textFields.length} text fields for credentials`);
        // Assuming the first text field is the email
        await textFields[0].setValue(email);
        await driver.pause(1000);
        
        // Find password field
        const secureFields = await driver.$$('*//XCUIElementTypeSecureTextField');
        if (secureFields.length > 0) {
          await secureFields[0].setValue(password);
          await driver.pause(1000);
          
          // Find login button (usually the first button after entering credentials)
          const loginButtons = await driver.$$('*//XCUIElementTypeButton');
          for (let i = 0; i < loginButtons.length; i++) {
            const buttonText = await loginButtons[i].getText();
            console.log(`Button ${i} text: ${buttonText}`);
            if (buttonText.toLowerCase().includes('login') || 
                buttonText.toLowerCase().includes('sign in') ||
                i === loginButtons.length - 1) { // Last button is usually submit
              await loginButtons[i].click();
              break;
            }
          }
        }
      }
    } catch (error) {
      console.log('Error during login process:', error.message);
    }
    
    // Wait for loading to finish
    await driver.pause(10000);
    console.log('Login process completed');
  } catch (error) {
    console.error('Login failed with error:', error);
  }
};

// Check if login was successful
const isLoggedIn = async (driver) => {
  try {
    console.log('Checking if login was successful...');
    await driver.pause(5000);
    
    // Try different ways to detect successful login
    const elements = await driver.$$('*//XCUIElementTypeTabBar/*');
    if (elements.length > 0) {
      console.log(`Found ${elements.length} tab bar items, login successful`);
      return true;
    }
    
    // Look for any indication of inbox or conversation screens
    const possibleLabels = ['inbox', 'conversations', 'settings', 'chat'];
    const allTexts = await driver.$$('*//XCUIElementTypeStaticText');
    
    for (const element of allTexts) {
      try {
        const text = await element.getText();
        console.log(`Found text: ${text}`);
        if (possibleLabels.some(label => text.toLowerCase().includes(label))) {
          return true;
        }
      } catch (e) {
        // Ignore error getting text
      }
    }
    
    console.log('Could not confirm successful login');
    return false;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

module.exports = {
  getCredentials,
  login,
  isLoggedIn,
};