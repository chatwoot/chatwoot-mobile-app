module.exports = {
  dependencies: {
    'ffmpeg-kit-react-native': {
      platforms: {
        android: null, // 👈 prevents Android autolinking
      },
    },
    // Notifee autolinking is REQUIRED for notifications to work
    // Do NOT disable it
  },
};
