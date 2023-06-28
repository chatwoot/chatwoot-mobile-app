import React, { useRef, Fragment, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { SafeAreaView, KeyboardAvoidingView, Platform, Linking, StyleSheet } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import RNBootSplash from 'react-native-bootsplash';
import PropTypes from 'prop-types';
import { useFlipper } from '@react-navigation/devtools';
import { LightTheme } from 'src/theme';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
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
import { findConversationLinkFromPush } from './helpers/PushHelper';
import { selectLoggedIn } from 'reducer/authSlice';
import { selectUrlSet, selectInstallationUrl, selectLocale } from 'reducer/settingsSlice';

const Stack = createNativeStackNavigator();

const propTypes = {
  isLoggedIn: PropTypes.bool,
  isUrlSet: PropTypes.bool,
};

const defaultProps = {
  isLoggedIn: false,
  isUrlSet: false,
};
// TODO
messaging().setBackgroundMessageHandler(async remoteMessage => {});

const App = () => {
  // TODO: Lets use light theme for now, add dark theme later
  const theme = LightTheme;

  const routerReference = useNavigationContainerRef();

  useFlipper(routerReference);

  const routeNameRef = useRef();

  const isLoggedIn = useSelector(selectLoggedIn);
  const isUrlSet = useSelector(selectUrlSet);
  const installationUrl = useSelector(selectInstallationUrl);
  const locale = useSelector(selectLocale);

  const linking = {
    prefixes: [installationUrl],
    config: {
      screens: {
        ChatScreen: {
          path: 'app/accounts/:accountId/conversations/:conversationId/:primaryActorId?/:primaryActorType?',
          parse: {
            conversationId: conversationId => parseInt(conversationId),
          },
        },
      },
    },
    getStateFromPath: (path, config) => {
      const conversationIdMatch = path.match(/\/conversations\/(\d+)/);
      const conversationId = conversationIdMatch ? parseInt(conversationIdMatch[1]) : null;
      if (!conversationId) {
        return;
      }
      return {
        routes: [
          {
            name: 'ChatScreen',
            params: {
              conversationId: conversationId,
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
        const { notification } = message.data;

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
          const { notification } = message.data;

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
            RNBootSplash.hide({ fade: true });
          }}
          onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = navigationRef.current.getCurrentRoute().name;
            if (previousRouteName !== currentRouteName) {
              // TODO
              // captureScreen({ screenName: currentRouteName });
            }
            // Save the current route name for later comparison
            routeNameRef.current = currentRouteName;
          }}
          theme={theme}>
          <BottomSheetModalProvider>
            <Stack.Navigator
              initialRouteName={isUrlSet ? 'Login' : 'ConfigureURL'}
              screenOptions={{ headerShown: false }}>
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
App.defaultProps = defaultProps;

export default App;
