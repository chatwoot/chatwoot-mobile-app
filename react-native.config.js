module.exports = {
  dependencies: {
    'ffmpeg-kit-react-native': {
      platforms: {
        android: null, // 👈 prevents Android autolinking
      },
    },
    // @notifee/react-native must autolink on Android so notifee.createChannel()
    // has a native module to call. The channel is what makes the app appear in
    // Do Not Disturb exceptions and per-app notification sound settings.
  },
};
