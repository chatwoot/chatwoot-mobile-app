import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { getStateFromPath } from '@react-navigation/native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { AppTabs } from './tabs/AppTabs';
import i18n from 'i18n';
import { navigationRef } from '@/utils/navigationUtils';
import { findConversationLinkFromPush, findNotificationFromFCM } from '@/utils/pushUtils';
import { extractConversationIdFromUrl } from '@/utils/conversationUtils';
import { useAppSelector } from '@/hooks';
import { selectInstallationUrl, selectLocale } from '@/store/settings/settingsSelectors';
import { SSO_CALLBACK_URL } from '@/constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RefsProvider } from '@/context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { transformNotification } from '@/utils/camelCaseKeys';
import { SsoUtils } from '@/utils/ssoUtils';
import { useAppDispatch } from '@/hooks';
import Inter40020 from '@/assets/fonts/Inter-400-20.ttf';
import Inter42020 from '@/assets/fonts/Inter-420-20.ttf';
import Inter50024 from '@/assets/fonts/Inter-500-24.ttf';
import Inter58024 from '@/assets/fonts/Inter-580-24.ttf';
import Inter60020 from '@/assets/fonts/Inter-600-20.ttf';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

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
        const ssoParams = SsoUtils.parseCallbackUrl(`chatwootapp://${path}`);
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
      const unsubscribeNotification = messaging().onNotificationOpenedApp(message => {
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

  if (!fontsLoaded) {
    return null;
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
        <View style={styles.navigationLayout} onLayout={onLayoutRootView}>
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
        <RefsProvider>
          <SafeAreaProvider>
            <AppNavigationContainer />
          </SafeAreaProvider>
        </RefsProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  navigationLayout: {
    flex: 1,
  },
});
