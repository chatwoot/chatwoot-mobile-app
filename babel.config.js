module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          components: './src/components',
          actions: './src/actions',
          constants: './src/constants',
          helpers: './src/helpers',
          i18n: './src/i18n',
          reducer: './src/reducer',
          screens: './src/screens',
        },
      },
    ],
  ],
};
