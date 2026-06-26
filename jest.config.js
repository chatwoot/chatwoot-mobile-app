module.exports = {
  preset: 'react-native',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo/virtual/(.*)$': '<rootDir>/__mocks__/expo-virtual-$1.js',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.claude/worktrees/',
  ],
};
