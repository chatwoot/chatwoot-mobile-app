import Inter40020 from '@/assets/fonts/Inter-400-20.ttf';
import Inter42020 from '@/assets/fonts/Inter-420-20.ttf';
import Inter50024 from '@/assets/fonts/Inter-500-24.ttf';
import Inter58024 from '@/assets/fonts/Inter-580-24.ttf';
import Inter60020 from '@/assets/fonts/Inter-600-20.ttf';
import { SSO_CALLBACK_URL } from '@/constants';
import { RefsProvider } from '@/context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { backendService } from '@/services/BackendService';
import { NotificationService } from '@/services/NotificationService';
import { settingsActions } from '@/store/settings/settingsActions';
import { selectInstallationUrl, selectLocale } from '@/store/settings/settingsSelectors';
import { getStore } from '@/store/storeAccessor';
import { transformNotification } from '@/utils/camelCaseKeys';
import { extractConversationIdFromUrl } from '@/utils/conversationUtils';
import { navigationRef } from '@/utils/navigationUtils';
import {
  extractParamsFromNotification,
  navigateToConversation,
} from '@/utils/notificationNavigationUtils';
import { findConversationLinkFromPush, findNotificationFromFCM } from '@/utils/pushUtils';
import { SsoUtils } from '@/utils/ssoUtils';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import notifee, { EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { getStateFromPath, NavigationContainer } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import i18n from 'i18n';
import React, { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppTabs } from './tabs/AppTabs';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    await NotificationService.displayNotification(remoteMessage);
  } catch (error) {
    console.error('[Navigation] Error handling background notification:', error);
  }
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

  useEffect(() => {
    const unsubscribeNotifee = notifee.onForegroundEvent(async ({ type, detail }) => {
      if (type !== EventType.PRESS || !detail.notification?.data) {
        return;
      }

      try {
        const params = extractParamsFromNotification(
          detail.notification.data as Record<string, string>,
          installationUrl,
        );

        if (params) {
          await navigateToConversation(params);
        }
      } catch (error) {
        console.error('[Navigation] Error processing notification press:', error);
      }
    });

    return unsubscribeNotifee;
  }, [installationUrl]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      try {
        // Quando o Firebase recebe uma mensagem com 'notification' payload,
        // ele exibe automaticamente. Para evitar isso e usar apenas o notifee,
        // precisamos processar a mensagem antes que o Firebase a exiba.
        // O notifee vai substituir qualquer notificação do Firebase.
        await NotificationService.displayNotification(remoteMessage);
      } catch (error) {
        console.error('[Navigation] Error handling foreground message:', error);
      }
    });

    return unsubscribe;
  }, []);

  // Adicionar listener para atualização do token FCM
  useEffect(() => {
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async fcmToken => {
      console.log('FCM Token refreshed:', fcmToken);
      // Verificar se usuário está logado antes de atualizar
      const store = getStore();
      const state = store.getState();
      if (!state.auth.user) {
        console.log('User not logged in, skipping token update');
        return;
      }

      // Atualizar o token no backend NOTCHAT quando ele for renovado
      try {
        const oldToken = (await AsyncStorage.getItem('fcm_token')) || '';
        const currentState = store.getState();
        const { installationUrl } = currentState.settings;
        const { user } = currentState.auth;

        if (oldToken && user && installationUrl) {
          // Atualizar token existente no backend NOTCHAT
          try {
            await backendService.updateFcmToken({
              old_token: oldToken,
              new_token: fcmToken,
              chatwoot_url: installationUrl,
              agent_id: user.id,
            });
            await AsyncStorage.setItem('fcm_token', fcmToken);
            console.log('[NOTCHAT] FCM token updated successfully');
          } catch (updateError: unknown) {
            const errorMessage =
              updateError instanceof Error ? updateError.message : String(updateError);
            if (errorMessage.includes('Muitas tentativas')) {
              console.warn(
                '[NOTCHAT] Rate limit atingido ao atualizar token. Tentará novamente na próxima atualização.',
              );
              // Não atualizar o token no AsyncStorage se rate limit foi atingido
              return;
            }
            throw updateError;
          }
        } else if (user && installationUrl) {
          // Se não tem token antigo, registrar como novo dispositivo
          try {
            await dispatch(settingsActions.registerWithBackend()).unwrap();
            await AsyncStorage.setItem('fcm_token', fcmToken);
          } catch (registerError: unknown) {
            const errorMessage =
              registerError instanceof Error ? registerError.message : String(registerError);
            if (errorMessage.includes('Muitas tentativas')) {
              console.warn(
                '[NOTCHAT] Rate limit atingido ao registrar dispositivo. Tentará novamente mais tarde.',
              );
              // Não salvar o token se rate limit foi atingido
              return;
            }
            throw registerError;
          }
        } else {
          console.log(
            '[NOTCHAT] User not authenticated or installation URL not set, skipping token update',
          );
        }
      } catch (error) {
        console.error('[NOTCHAT] Error updating FCM token:', error);
        Sentry.captureException(error);
      }
    });

    return unsubscribeTokenRefresh;
  }, [dispatch]);

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
        if (notification) {
          try {
            const camelCaseNotification = transformNotification(notification);
            const conversationLink = findConversationLinkFromPush({
              notification: camelCaseNotification,
              installationUrl,
            });
            if (conversationLink) {
              return conversationLink;
            }
          } catch (error) {
            console.error('[Navigation] Error processing initial notification:', error);
          }
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
          if (notification) {
            try {
              const camelCaseNotification = transformNotification(notification);

              const conversationLink = findConversationLinkFromPush({
                notification: camelCaseNotification,
                installationUrl,
              });
              if (conversationLink) {
                listener(conversationLink);
              }
            } catch (error) {
              console.error('[Navigation] Error processing notification opened:', error);
            }
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
      fallback={<ActivityIndicator animating />}
    >
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
