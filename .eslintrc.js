module.exports = {
  root: true,
  extends: '@react-native-community',
  plugins: ['detox'],
  rules: {
    'no-console': 2,
    'react/prop-types': 2,
    'prettier/prettier': 'off',
    radix: 'off',
  },
};
