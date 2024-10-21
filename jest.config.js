module.exports = {
  preset: 'react-native',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
