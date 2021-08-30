import PostHog from 'posthog-react-native';
import Config from 'react-native-config';

const POST_HOG_API_KEY = Config.POSTHOG_API_KEY;
const POST_HOG_API_HOST = Config.POSTHOG_API_HOST;
export const checkAnalyticsEnabled = () => {
  if (!__DEV__ && POST_HOG_API_KEY && POST_HOG_API_HOST) {
    return true;
  }
  return false;
};
const IS_ANALYTICS_ENABLED = checkAnalyticsEnabled();

export const initAnalytics = async () => {
  if (IS_ANALYTICS_ENABLED) {
    await PostHog.setup(POST_HOG_API_KEY, {
      // PostHog API host
      host: POST_HOG_API_HOST,
      // Record certain application events automatically! (off/false by default)
      captureApplicationLifecycleEvents: true,

      // Capture deep links as part of the screen call. (off by default)
      captureDeepLinks: true,

      // Record screen views automatically! (off/false by default)
      recordScreenViews: true,

      // Max delay before flushing the queue (30 seconds)
      flushInterval: 30,

      // Maximum number of events to keep in queue before flushing (20)
      flushAt: 20,

      // Used only for Android
      android: {
        // Enable or disable collection of ANDROID_ID (true)
        collectDeviceId: true,
      },

      // Used only for iOS
      iOS: {
        // Automatically capture in-app purchases from the App Store
        captureInAppPurchases: false,

        // Capture push notifications
        capturePushNotifications: true,

        // The maximum number of items to queue before starting to drop old ones.
        maxQueueSize: 1000,

        // Record bluetooth information.
        shouldUseBluetooth: false,

        // Use location services. Will ask for permissions.
        shouldUseLocationServices: false,
      },
    });
  }
};

export const identifyUser = ({ userId, email, name, installationUrl = '' }) => {
  if (IS_ANALYTICS_ENABLED) {
    PostHog.identify(userId.toString(), {
      email,
      name,
      installationUrl,
    });
  }
};

export const captureEvent = ({ eventName, properties = {} }) => {
  if (IS_ANALYTICS_ENABLED) {
    PostHog.capture(eventName, properties);
  }
};

export const resetAnalytics = () => {
  if (IS_ANALYTICS_ENABLED) {
    PostHog.reset();
  }
};

export const captureScreen = ({ screenName }) => {
  if (IS_ANALYTICS_ENABLED) {
    PostHog.screen(screenName);
  }
};
