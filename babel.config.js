module.exports = function (api) {
  api.cache(true);

  const isDev = process.env.NODE_ENV !== 'production';

  const presetOptions = isDev
    ? { jsxImportSource: '@welldone-software/why-did-you-render' }
    : {};

  const plugins = [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@': './src',
        },
      },
    ],
  ];

  // Strip console.log in production for performance and App Store compliance
  if (!isDev) {
    plugins.push(['transform-remove-console', { exclude: ['error', 'warn'] }]);
  }

  // Reanimated plugin must be last
  plugins.push('react-native-reanimated/plugin');

  return {
    presets: [['babel-preset-expo', presetOptions]],
    plugins,
  };
};
