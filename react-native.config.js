module.exports = {
  dependencies: {
    'react-native-audio-api': {
      platforms: {
        android: null, // Android plays Ogg/Opus and WebM natively; only iOS decodes.
      },
    },
    '@notifee/react-native': {
      platforms: {
        android: null, // 👈 prevents Android autolinking
      },
    },
  },
};
