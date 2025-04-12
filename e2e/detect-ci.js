/**
 * CI Environment Detector
 * 
 * This script checks if the test is running in a CI environment
 * and returns appropriate configuration for test runners.
 */

function isRunningInCI() {
  return !!process.env.CI;
}

function getTestConfig() {
  const inCI = isRunningInCI();
  
  // Default configuration
  const config = {
    inCI,
    // In CI environments, we'll use Safari/Chrome for web testing
    // instead of trying to build the app
    useWebApp: inCI || false,
    waitTimeMultiplier: inCI ? 2 : 1, // Increase wait times in CI
  };
  
  return config;
}

module.exports = {
  isRunningInCI,
  getTestConfig
};