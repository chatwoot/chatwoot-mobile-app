module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    'no-console': 2,
    'react/prop-types': 2,
    'prettier/prettier': 'off',
    radix: 'off',
  },
  overrides: [
    {
      files: ['e2e/*.e2e.js'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
