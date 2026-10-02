const expoPreset = require('jest-expo/jest-preset');

module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: expoPreset.transformIgnorePatterns.map(pattern =>
    pattern.replace('(?!(.pnpm|', '(?!(.pnpm|@kesha-antonov/react-native-action-cable|'),
  ),
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
