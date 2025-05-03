import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RefsProvider } from '@/context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { transformNotification } from '@/utils/camelCaseKeys';

/* Firebase functionality disabled
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});
*/

export const AppNavigationContainer = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fontsLoaded, error] = useFonts({
    'Inter-400-20': require('../assets/fonts/Inter-400-20.ttf'),
    'Inter-420-20': require('../assets/fonts/Inter-420-20.ttf'),
    'Inter-500-24': require('../assets/fonts/Inter-500-24.ttf'),
    'Inter-580-24': require('../assets/fonts/Inter-580-24.ttf'),
    'Inter-600-20': require('../assets/fonts/Inter-600-20.ttf'),
  });

  const routeNameRef = useRef<string | undefined>(undefined);

  const installationUrl = useAppSelector(selectInstallationUrl);
  const locale = useAppSelector(selectLocale);

  const linking = {
    prefixes: [installationUrl],
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
    getStateFromPath: (path: string, config: any) => {
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
    async getInitialURL() {
      // Check if app was opened from a deep link
      const url = await Linking.getInitialURL();

      if (url != null) {
        return url;
      }

      /* Firebase functionality disabled
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
      */
      return undefined;
    },
    subscribe(listener: (arg0: string) => void) {
      const onReceiveURL = ({ url }: { url: string }) => listener(url);

      // Listen to incoming links from deep linking
      const subscription = Linking.addEventListener('url', onReceiveURL);

      /* Firebase functionality disabled
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
      */

      return () => {
        subscription.remove();
        // Firebase functionality disabled
        // unsubscribeNotification();
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
