module.exports = {
  dependencies: {
    'ffmpeg-kit-react-native': {
      platforms: {
        android: null, // 👈 prevents Android autolinking
        ios: null, // 👈 prevents iOS autolinking (v6.0 xcframework files are not available)
      },
    },
    // Notifee autolinking is REQUIRED for notifications to work
    // Do NOT disable it
  },
};
