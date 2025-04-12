#!/usr/bin/env node

/**
 * Test runner with timeout
 * 
 * This script runs a test file and kills it after a specified timeout
 * Usage: node run-with-timeout.js <timeout-in-seconds> <test-file-path>
 */

const { spawn } = require('child_process');
const path = require('path');

// Get timeout and file from arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node run-with-timeout.js <timeout-in-seconds> <test-file-path>');
  process.exit(1);
}

const timeoutSeconds = parseInt(args[0], 10);
const testFile = args[1];
const testArgs = args.slice(2); // Any additional arguments

console.log(`Running test ${testFile} with ${timeoutSeconds}s timeout`);

// Spawn the test process
const testProcess = spawn('node', [testFile, ...testArgs], {
  stdio: 'inherit',
  shell: true
});

// Set timeout
const timeoutId = setTimeout(() => {
  console.error(`\n\nTest execution timed out after ${timeoutSeconds} seconds!`);
  testProcess.kill('SIGTERM');
  
  // Force kill after 5 more seconds if it doesn't exit cleanly
  setTimeout(() => {
    console.error('Force killing test process...');
    testProcess.kill('SIGKILL');
    process.exit(1);
  }, 5000);
}, timeoutSeconds * 1000);

// Handle process exit
testProcess.on('exit', (code, signal) => {
  clearTimeout(timeoutId);
  
  if (signal) {
    console.log(`Test was terminated with signal ${signal}`);
    process.exit(1);
  } else {
    console.log(`Test exited with code ${code}`);
    process.exit(code);
  }
});

// Handle unexpected errors
testProcess.on('error', (err) => {
  clearTimeout(timeoutId);
  console.error('Failed to start test process:', err);
  process.exit(1);
}); 