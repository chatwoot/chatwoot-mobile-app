import React, { useRef, Fragment, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { SafeAreaView, KeyboardAvoidingView, Platform, Linking, StyleSheet } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { getStateFromPath } from '@react-navigation/native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import PropTypes from 'prop-types';
import { LightTheme } from './theme-old';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConfigureURLScreen from './screens/ConfigureURLScreen/ConfigureURLScreen';
import LoginScreen from './screens/LoginScreen/LoginScreen';
import ChatScreen from './screens/ChatScreen/ChatScreen';
import ResetPassword from './screens/ForgotPassword/ForgotPassword';
import ImageScreen from './screens/ChatScreen/ImageScreen';
import ConversationDetailsScreen from './screens/ConversationDetails/ConversationDetailsScreen';
import ConversationAction from './screens/ConversationAction/ConversationAction';
import TabStack from './components/TabBar';
import i18n from 'i18n';
import { navigationRef } from 'helpers/NavigationHelper';
import { findConversationLinkFromPush, findNotificationFromFCM } from './helpers/PushHelper';
import { extractConversationIdFromUrl } from './helpers/conversationHelpers';
import { selectLoggedIn } from '@/store/auth/authSelectors';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectInstallationUrl, selectLocale } from '@/store/settings/settingsSelectors';

const Stack = createNativeStackNavigator();

messaging().setBackgroundMessageHandler(async remoteMessage => {
  // console.log('Message handled in the background!', remoteMessage);
});

const propTypes = {
  isLoggedIn: PropTypes.bool,
};

const App = () => {
  // TODO: Lets use light theme for now, add dark theme later
  const theme = LightTheme;

  // const routerReference = useNavigationContainerRef();

  const routeNameRef = useRef();

  const isLoggedIn = useAppSelector(selectLoggedIn);
  const installationUrl = useAppSelector(selectInstallationUrl);
  const locale = useAppSelector(selectLocale);

  const linking = {
    prefixes: [installationUrl],
    config: {
      screens: {
        ChatScreen: {
          path: 'app/accounts/:accountId/conversations/:conversationId/:primaryActorId?/:primaryActorType?',
          parse: {
            conversationId: conversationId => parseInt(conversationId),
            primaryActorId: primaryActorId => parseInt(primaryActorId),
            primaryActorType: primaryActorType => decodeURIComponent(primaryActorType),
          },
        },
      },
    },
    getStateFromPath: (path, config) => {
      let primaryActorId = null;
      let primaryActorType = null;
      const state = getStateFromPath(path, config);
      const { routes } = state;

      const conversationId = extractConversationIdFromUrl({
        url: path,
      });

      if (!conversationId) {
        return;
      }

      if (routes[0]) {
        const { params } = routes[0];
        primaryActorId = params?.primaryActorId;
        primaryActorType = params?.primaryActorType;
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

      // Handle notification caused app to open from quit state:
      const message = await messaging().getInitialNotification();
      if (message) {
        const notification = findNotificationFromFCM({ message });
        const conversationLink = findConversationLinkFromPush({ notification, installationUrl });
        if (conversationLink) {
          return conversationLink;
        }
      }
      return undefined;
    },
    subscribe(listener) {
      const onReceiveURL = ({ url }) => listener(url);

      // Listen to incoming links from deep linking
      const subscription = Linking.addEventListener('url', onReceiveURL);

      // Handle notification caused app to open from background state
      const unsubscribeNotification = messaging().onNotificationOpenedApp(message => {
        if (message) {
          const notification = findNotificationFromFCM({ message });

          const conversationLink = findConversationLinkFromPush({ notification, installationUrl });
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
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled>
      <SafeAreaView style={styles.container}>
        <NavigationContainer
          linking={linking}
          ref={navigationRef}
          onReady={() => {
            routeNameRef.current = navigationRef.current.getCurrentRoute().name;
          }}
          onStateChange={async () => {
            routeNameRef.current = navigationRef.current.getCurrentRoute().name;
          }}
          theme={theme}>
          <BottomSheetModalProvider>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{ headerShown: false, navigationBarColor: '#FFFF' }}>
              {isLoggedIn ? (
                <Fragment>
                  <Stack.Screen name="Tab" component={TabStack} />
                  <Stack.Screen name="ChatScreen" component={ChatScreen} />
                  <Stack.Screen name="ImageScreen" component={ImageScreen} />
                  <Stack.Screen name="ConversationDetails" component={ConversationDetailsScreen} />
                  <Stack.Screen name="ConversationAction" component={ConversationAction} />
                </Fragment>
              ) : (
                <Fragment>
                  <Stack.Screen name="ConfigureURL" component={ConfigureURLScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="ResetPassword" component={ResetPassword} />
                </Fragment>
              )}
            </Stack.Navigator>
          </BottomSheetModalProvider>
        </NavigationContainer>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const createStyles = theme => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
  });
};

App.propTypes = propTypes;

export default App;
