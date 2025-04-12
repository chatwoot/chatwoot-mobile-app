/**
 * Appium Starter Script
 * 
 * This script starts an Appium server with the necessary drivers for iOS and Android testing.
 * Run with: node e2e/start-appium.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Appium server for Chatwoot mobile app testing...');

// Specify Appium server arguments
const args = [
  '--address', '127.0.0.1',
  '--port', '4723',
  '--log-level', 'info',
  '--log-timestamp',
  '--base-path', '/wd/hub'
];

// Launch the Appium server as a child process
const appiumServer = spawn('npx', ['appium', ...args], {
  stdio: 'inherit',
  shell: true
});

// Handle server exit
appiumServer.on('exit', (code, signal) => {
  if (code) {
    console.log(`Appium server exited with code ${code}`);
  } else if (signal) {
    console.log(`Appium server was killed with signal ${signal}`);
  } else {
    console.log('Appium server stopped');
  }
});

// Handle CTRL+C to gracefully stop the server
process.on('SIGINT', () => {
  console.log('Stopping Appium server...');
  appiumServer.kill('SIGINT');
  process.exit(0);
});

console.log('Appium server started. Press Ctrl+C to stop.');