module.exports = function (api) {
  api.cache(true);

  const isDev = process.env.NODE_ENV !== 'production';

  const presetOptions = isDev
    ? { jsxImportSource: '@welldone-software/why-did-you-render' }
    : {};

  return {
    presets: [['babel-preset-expo', presetOptions]],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
          },
        },
      ],
      // Performance: Remove console logs in production
      ...(!isDev ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] : []),
      // Reanimated plugin must be last
      'react-native-reanimated/plugin',
    ],
  };
};
