const MetroConfig = require('@ui-kitten/metro-config');

// This will make your app load faster by processing theme during the build time,
// instead of doing this in runtime.
// https://akveo.github.io/react-native-ui-kitten/docs/guides/improving-performance

const evaConfig = {
  evaPackage: '@eva-design/eva',
  customMappingPath: './src/mapping.json',
};

module.exports = MetroConfig.create(evaConfig, {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
});
