/**
 * Appium Environment Check
 * 
 * This script checks the Appium environment and available devices/simulators
 * Run with: node e2e/check-environment.js
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

// Check iOS simulators
const checkIOSSimulators = () => {
  console.log('\n--- Checking iOS Simulators ---');
  
  const simulators = runCommand('xcrun simctl list devices available -j');
  if (simulators.success) {
    try {
      const simulatorData = JSON.parse(simulators.output);
      const availableSimulators = [];
      
      // Process simulator data
      Object.entries(simulatorData.devices).forEach(([runtimeName, devices]) => {
        // Extract iOS version from runtime name (e.g., "com.apple.CoreSimulator.SimRuntime.iOS-18-2")
        const iosVersion = runtimeName.match(/iOS-(\d+)-(\d+)/);
        if (iosVersion) {
          const version = `${iosVersion[1]}.${iosVersion[2]}`;
          
          devices.forEach(device => {
            if (device.isAvailable) {
              availableSimulators.push({
                name: device.name,
                udid: device.udid,
                version,
                runtime: runtimeName
              });
            }
          });
        }
      });
      
      if (availableSimulators.length > 0) {
        console.log(`✅ Found ${availableSimulators.length} available iOS simulators:`);
        availableSimulators.forEach(sim => {
          console.log(`  - ${sim.name} (iOS ${sim.version}) [${sim.udid}]`);
        });
        
        // Save simulator info to a file for the tests to use
        const simulatorDataPath = path.join(__dirname, 'simulators.json');
        writeFileSync(simulatorDataPath, JSON.stringify(availableSimulators, null, 2));
        console.log(`Simulator data saved to ${simulatorDataPath}`);
      } else {
        console.log('❌ No available iOS simulators found');
      }
    } catch (error) {
      console.log('❌ Error parsing simulator data:', error.message);
    }
  } else {
    console.log('❌ Could not list iOS simulators');
    console.log(simulators.output);
  }
};

// Check installed apps on simulators
const checkInstalledApps = () => {
  console.log('\n--- Checking Installed Apps on iOS Simulator ---');
  
  try {
    // Try to read simulators.json
    const simulatorsPath = path.join(__dirname, 'simulators.json');
    if (!existsSync(simulatorsPath)) {
      console.log('❌ No simulator data found. Run checkIOSSimulators first.');
      return;
    }
    
    const simulators = require(simulatorsPath);
    if (simulators.length === 0) {
      console.log('❌ No simulators found in data file.');
      return;
    }
    
    // Use the first simulator to check installed apps
    const simulator = simulators[0];
    console.log(`Checking apps on ${simulator.name} (iOS ${simulator.version})...`);
    
    const appsCmd = runCommand(`xcrun simctl listapps ${simulator.udid}`);
    if (appsCmd.success) {
      console.log('Installed apps:');
      console.log(appsCmd.output);
      
      // Special check for Chatwoot app
      if (appsCmd.output.includes('com.chatwoot.app')) {
        console.log('✅ Chatwoot app is installed with bundle ID: com.chatwoot.app');
      } else {
        console.log('❌ Chatwoot app not found with bundle ID: com.chatwoot.app');
        console.log('Searching for similar apps...');
        
        if (appsCmd.output.toLowerCase().includes('chatwoot')) {
          console.log('Found an app with "chatwoot" in the name or bundle ID.');
          // Extract and print the actual bundle ID
          const lines = appsCmd.output.split('\n');
          lines.forEach(line => {
            if (line.toLowerCase().includes('chatwoot')) {
              console.log(line);
            }
          });
        } else {
          console.log('No apps found with "chatwoot" in the name or bundle ID.');
        }
      }
    } else {
      console.log('❌ Could not list installed apps');
      console.log(appsCmd.output);
    }
  } catch (error) {
    console.log('❌ Error checking installed apps:', error.message);
  }
};

// Check Android devices
const checkAndroidDevices = () => {
  console.log('\n--- Checking Android Devices ---');
  
  const devices = runCommand('adb devices -l');
  if (devices.success) {
    console.log('Android devices:');
    console.log(devices.output);
    
    // Check if any devices are connected
    if (devices.output.includes('device product:')) {
      console.log('✅ Android device(s) connected');
      
      // Get packages on the first connected device
      const packagesCmd = runCommand('adb shell pm list packages | grep -i chatwoot');
      if (packagesCmd.success && packagesCmd.output.trim()) {
        console.log('Found Chatwoot packages:');
        console.log(packagesCmd.output);
      } else {
        console.log('❌ No Chatwoot packages found on device');
      }
    } else {
      console.log('❌ No Android devices connected');
    }
  } else {
    console.log('❌ Could not list Android devices');
    console.log(devices.output);
  }
};

// Main function
const main = async () => {
  console.log('Starting Appium environment check...');
  
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
    
    checkIOSSimulators();
    checkInstalledApps();
    checkAndroidDevices();
    
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