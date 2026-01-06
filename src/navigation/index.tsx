import React, { useCallback, useRef, useEffect } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { getStateFromPath } from '@react-navigation/native';

// Force mock KeyboardProvider for Expo Go compatibility
const KeyboardProvider: any = ({ children }: any) => <>{children}</>;

// Import expo notification service (official Expo approach)
import {
  initializeExpoNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '@/services/ExpoNotificationService';

// Import background handler's display function for foreground messages
import { displayBackgroundNotification, parsePayload } from '@/services/expoBackgroundHandler';

// NOTE: Background handler is now registered in App.tsx (entry point) for proper background notification handling

let messaging: any = null;

try {
  const messagingModule = require('@react-native-firebase/messaging');
  if (messagingModule && messagingModule.default) {
    messaging = messagingModule.default;
  }
} catch (e) {
  console.warn('@react-native-firebase/messaging not available:', e);
}

// Provide mock if not available
if (!messaging) {
  messaging = () => ({
    getInitialNotification: () => Promise.resolve(null),
    onNotificationOpenedApp: () => () => {},
  });
}

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { AppTabs } from './tabs/AppTabs';
import i18n from '@/i18n';
import { navigationRef } from '@/utils/navigationUtils';
import { findConversationLinkFromPush, findNotificationFromFCM } from '@/utils/pushUtils';
import { extractConversationIdFromUrl } from '@/utils/conversationUtils';
import { useAppSelector } from '@/hooks';
import { selectInstallationUrl, selectLocale } from '@/store/settings/settingsSelectors';
import { SSO_CALLBACK_URL } from '@/constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RefsProvider, ThemeProvider, useTheme } from '@/context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { transformNotification } from '@/utils/camelCaseKeys';
import { SsoUtils } from '@/utils/ssoUtils';
import { useAppDispatch } from '@/hooks';
import { CustomSplashScreen } from '@/components-next/common/splash/CustomSplashScreen';
import Inter40020 from '@/assets/fonts/Inter-400-20.ttf';
import Inter42020 from '@/assets/fonts/Inter-420-20.ttf';
import Inter50024 from '@/assets/fonts/Inter-500-24.ttf';
import Inter58024 from '@/assets/fonts/Inter-580-24.ttf';
import Inter60020 from '@/assets/fonts/Inter-600-20.ttf';


export const AppNavigationContainer = () => {
  const [fontsLoaded] = useFonts({
    'Inter-400-20': Inter40020,
    'Inter-420-20': Inter42020,
    'Inter-500-24': Inter50024,
    'Inter-580-24': Inter58024,
    'Inter-600-20': Inter60020,
  });

  const routeNameRef = useRef<string | undefined>(undefined);
  const dispatch = useAppDispatch();

  const installationUrl = useAppSelector(selectInstallationUrl);
  const locale = useAppSelector(selectLocale);

  // Initialize notification service and set up listeners (expo-notifications)
  useEffect(() => {
    // Initialize notification channels and permissions
    initializeExpoNotifications();

    // Set up foreground notification listener (for expo-notifications)
    const notificationListener = addNotificationReceivedListener(notification => {
      console.log('[Navigation] Notification received:', notification);
    });

    // Set up notification response listener (when user taps notification)
    const responseListener = addNotificationResponseListener(response => {
      console.log('[Navigation] Notification tapped:', response);
      const data = response.notification.request.content.data;
      // Handle notification tap - navigate to conversation
      if (data?.conversationId && installationUrl) {
        const conversationLink = `${installationUrl}/app/accounts/1/conversations/${data.conversationId}`;
        Linking.openURL(conversationLink);
      }
    });

    // CRITICAL: Set up Firebase foreground message listener
    // This displays notifications when FCM messages arrive while app is in foreground
    let unsubscribeFCM = () => {};
    if (messaging) {
      try {
        unsubscribeFCM = messaging().onMessage(async (remoteMessage: any) => {
          console.log('[Navigation] 🔔 FCM foreground message received:', JSON.stringify(remoteMessage));
          
          // Parse the payload and display notification
          const { title, body, data, channelId } = parsePayload(remoteMessage);
          console.log('[Navigation] Parsed:', { title, body, notificationType: data?.notificationType });
          
          // Display the notification using expo-notifications
          await displayBackgroundNotification(title, body, data, channelId);
        });
        console.log('[Navigation] ✅ FCM foreground listener registered');
      } catch (error) {
        console.error('[Navigation] ❌ Failed to setup FCM listener:', error);
      }
    }

    return () => {
      notificationListener.remove();
      responseListener.remove();
      unsubscribeFCM();
    };
  }, [installationUrl]);

  const linking = {
    prefixes: [installationUrl, SSO_CALLBACK_URL],
    config: {
      screens: {
        ChatScreen: {
          path: 'app/accounts/:accountId/conversations/:conversationId/:primaryActorId?/:primaryActorType?',
          parse: {
            conversationId: (conversationId: string) => parseInt(conversationId),
            primaryActorId: (primaryActorId: string) => parseInt(primaryActorId),
            primaryActorType: (primaryActorType: string) => decodeURIComponent(primaryActorType),
          },
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // getStateFromPath: App running, receives deep link - handles SSO callbacks and conversation navigation
    getStateFromPath: (path: string, config: any) => {
      // Handle SSO callback - App running, receives deep link
      if (path.includes(SSO_CALLBACK_URL) || path.includes('auth/saml')) {
        const ssoParams = SsoUtils.parseCallbackUrl(`AlooChatapp://${path}`);
        // Handle both success and error cases
        SsoUtils.handleSsoCallback(ssoParams, dispatch);
        // Return undefined to prevent navigation change for SSO callback
        return undefined;
      }

      let primaryActorId = null;
      let primaryActorType = null;
      const state = getStateFromPath(path, config);
      const { routes } = state || {};

      const conversationId = extractConversationIdFromUrl({
        url: path,
      });

      if (!conversationId) {
        return;
      }

      if (routes && routes[0]) {
        const { params } = routes[0];
        primaryActorId = (params as { primaryActorId?: number })?.primaryActorId;
        primaryActorType = (params as { primaryActorType?: string })?.primaryActorType;
      }
      return {
        routes: [
          {
            name: 'ChatScreen',
            params: {
              conversationId: conversationId,
              primaryActorId,
              primaryActorType,
            },
          },
        ],
      };
    },
    // getInitialURL: App starting up from deep link - handles SSO callbacks and push notifications
    async getInitialURL() {
      // Check if app was opened from a deep link
      const url = await Linking.getInitialURL();

      if (url != null) {
        // Handle SSO callback - App starting up from deep link
        if (url.includes(SSO_CALLBACK_URL)) {
          const ssoParams = SsoUtils.parseCallbackUrl(url);
          // Handle both success and error cases
          SsoUtils.handleSsoCallback(ssoParams, dispatch);
          return null; // Don't navigate for SSO callback
        }
        return url;
      }

      // getInitialNotification: When the application is opened from a quit state.
      if (messaging) {
        try {
          const message = await messaging().getInitialNotification();
          if (message) {
            const notification = findNotificationFromFCM({ message });
            const camelCaseNotification = transformNotification(notification);
            const conversationLink = findConversationLinkFromPush({
              notification: camelCaseNotification,
              installationUrl,
            });
            if (conversationLink) {
              return conversationLink;
            }
          }
        } catch (e) {
          console.warn('Failed to get initial notification:', e);
        }
      }
      return undefined;
    },
    // subscribe: App backgrounded, receives deep link - handles SSO callbacks and push notifications
    subscribe(listener: (arg0: string) => void) {
      const onReceiveURL = ({ url }: { url: string }) => {
        // Handle SSO callback - App backgrounded, receives deep link
        if (url.includes(SSO_CALLBACK_URL)) {
          const ssoParams = SsoUtils.parseCallbackUrl(url);
          // Handle both success and error cases
          SsoUtils.handleSsoCallback(ssoParams, dispatch);
          return; // Don't pass SSO callback to navigation
        }
        listener(url);
      };

      // Listen to incoming links from deep linking
      const subscription = Linking.addEventListener('url', onReceiveURL);

      //onNotificationOpenedApp: When the application is running, but in the background.
      let unsubscribeNotification = () => {};
      if (messaging) {
        try {
          unsubscribeNotification = messaging().onNotificationOpenedApp((message: any) => {
            if (message) {
              const notification = findNotificationFromFCM({ message });
              const camelCaseNotification = transformNotification(notification);

              const conversationLink = findConversationLinkFromPush({
                notification: camelCaseNotification,
                installationUrl,
              });
              if (conversationLink) {
                listener(conversationLink);
              }
            }
          });
        } catch (e) {
          console.warn('Failed to subscribe to notification opened app:', e);
        }
      }

      return () => {
        subscription.remove();
        unsubscribeNotification();
      };
    },
  };

  i18n.locale = locale;

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const { colors, isDark } = useTheme();

  if (!fontsLoaded) {
    return <CustomSplashScreen />;
  }

  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      fallback={<ActivityIndicator animating />}>
      <BottomSheetModalProvider>
        <View style={[styles.navigationLayout, { backgroundColor: colors.background }]} onLayout={onLayoutRootView}>
          <AppTabs />
        </View>
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
};
export const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={styles.navigationLayout}>
      <KeyboardProvider>
        <ThemeProvider>
          <RefsProvider>
            <SafeAreaProvider>
              <AppNavigationContainer />
            </SafeAreaProvider>
          </RefsProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  navigationLayout: {
    flex: 1,
  },
});
