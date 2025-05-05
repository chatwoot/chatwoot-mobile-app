/**
 * CI Environment Check for Appium
 * 
 * This script is a modified version of check-environment.js designed to run in CI environments
 * where physical devices or emulators may not be available.
 */

const { execSync } = require('child_process');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

// Function to run a command and return the output
const runCommand = (command) => {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error.message };
  }
};

// Check Appium installation
const checkAppium = () => {
  console.log('\n--- Checking Appium Installation ---');
  
  const appiumVersion = runCommand('npx appium --version');
  if (appiumVersion.success) {
    console.log(`✅ Appium is installed: ${appiumVersion.output.trim()}`);
  } else {
    console.log('❌ Appium is not properly installed');
    console.log(appiumVersion.output);
    return false;
  }
  
  // List installed Appium drivers
  const drivers = runCommand('npx appium driver list --installed');
  if (drivers.success) {
    console.log('Installed drivers:');
    console.log(drivers.output);
  } else {
    console.log('❌ Could not list Appium drivers');
    console.log(drivers.output);
  }
  
  return true;
};

// Run Appium doctor
const runAppiumDoctor = () => {
  console.log('\n--- Running Appium Doctor ---');
  
  // General Appium checks
  const doctorOutput = runCommand('npx appium doctor');
  console.log('General Appium environment check:');
  console.log(doctorOutput.output);
  
  // XCUITest-specific checks
  const xcuitestOutput = runCommand('npx appium driver doctor xcuitest');
  console.log('\nXCUITest driver check:');
  console.log(xcuitestOutput.output);
  
  // UiAutomator2-specific checks
  const uiautomator2Output = runCommand('npx appium driver doctor uiautomator2');
  console.log('\nUiAutomator2 driver check:');
  console.log(uiautomator2Output.output);
};

// Mock iOS simulator data for CI
const createMockIOSSimulator = () => {
  console.log('\n--- Creating Mock iOS Simulator Data for CI ---');
  
  // Create a mock simulator data file
  const simulators = [
    {
      name: 'iPhone 15',
      udid: 'mock-ios-simulator',
      version: '18.2',
      runtime: 'iOS'
    }
  ];
  
  // Save simulator info to a file for the tests to use
  const simulatorDataPath = path.join(__dirname, 'simulators.json');
  writeFileSync(simulatorDataPath, JSON.stringify(simulators, null, 2));
  console.log(`Mock simulator data saved to ${simulatorDataPath}`);
};

// Check environment variables
const checkEnvironmentVariables = () => {
  console.log('\n--- Checking E2E Test Environment Variables ---');
  
  const requiredVars = [
    'TEST_USER_EMAIL',
    'TEST_USER_PASSWORD',
    'EXPO_PUBLIC_CHATWOOT_BASE_URL'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`❌ ${varName} is not set`);
      allPresent = false;
    }
  });
  
  if (allPresent) {
    console.log('All required environment variables are set');
  } else {
    console.log('Warning: Some required environment variables are missing');
  }
  
  return allPresent;
};

// Main function
const main = async () => {
  console.log('Starting CI Appium environment check...');
  
  // Create a report file
  const reportPath = path.join(__dirname, 'environment-report.txt');
  const originalConsoleLog = console.log;
  const logs = [];
  
  // Override console.log to capture output
  console.log = (...args) => {
    originalConsoleLog(...args);
    logs.push(args.join(' '));
  };
  
  try {
    const appiumInstalled = checkAppium();
    
    if (appiumInstalled) {
      runAppiumDoctor();
    }
    
    // Create mock simulator data for CI environment
    createMockIOSSimulator();
    
    // Check environment variables
    checkEnvironmentVariables();
    
    // Save the report
    writeFileSync(reportPath, logs.join('\n'));
    originalConsoleLog(`\nEnvironment report saved to ${reportPath}`);
    
  } catch (error) {
    originalConsoleLog(`Error during environment check: ${error.message}`);
  } finally {
    // Restore console.log
    console.log = originalConsoleLog;
  }
};

// Run the main function
main().catch(console.error);