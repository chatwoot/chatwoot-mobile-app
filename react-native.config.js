module.exports = {
  dependencies: {
    'ffmpeg-kit-react-native': {
      platforms: {
        android: {}, // enable Android autolinking for ffmpeg-kit
      },
    },
    '@notifee/react-native': {
      platforms: {
        android: null, // 👈 prevents Android autolinking
      },
    },
  },
};
