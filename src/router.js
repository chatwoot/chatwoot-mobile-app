import React, { useRef, Fragment, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { SafeAreaView, KeyboardAvoidingView, Platform, Linking, StyleSheet } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import RNBootSplash from 'react-native-bootsplash';
import PropTypes from 'prop-types';
import { useFlipper } from '@react-navigation/devtools';
import { LightTheme } from 'src/theme.v2';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ConfigureURLScreen from './screens/ConfigureURLScreen/ConfigureURLScreen';
import LoginScreen from './screens/LoginScreen/LoginScreen';
import ConversationScreen from './screens/Conversation/ConversationScreen';
import NotificationScreen from './screens/Notification/NotificationScreen';
import SettingsScreen from './screens/Settings/SettingsScreen';
import ChatScreen from './screens/ChatScreen/ChatScreen';
import ResetPassword from './screens/ForgotPassword/ForgotPassword';
import ImageScreen from './screens/ChatScreen/ImageScreen';
import NotificationPreference from './screens/NotificationPreference/NotificationPreference';
import ConversationDetailsScreen from './screens/ConversationDetails/ConversationDetailsScreen';
import ConversationAction from './screens/ConversationAction/ConversationAction';
import { Icon } from 'components';
import i18n from 'i18n';
import { navigationRef } from 'helpers/NavigationHelper';
import { findConversationLinkFromPush } from './helpers/PushHelper';
import { selectLoggedIn } from 'reducer/authSlice';
import { selectUrlSet, selectInstallationUrl, selectLocale } from 'reducer/settingsSlice';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator initialRouteName="ConversationScreen" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ConversationScreen" component={ConversationScreen} />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator initialRouteName="SettingsScreen" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
  </Stack.Navigator>
);

const NotificationStack = () => (
  <Stack.Navigator initialRouteName="NotificationScreen" screenOptions={{ headerShown: false }}>
    <Tab.Screen name="NotificationScreen" component={NotificationScreen} />
  </Stack.Navigator>
);

const renderTabIcon = (route, focused, color, size) => {
  let iconName = 'home';
  switch (route.name) {
    case 'Conversations':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Notifications':
      iconName = focused ? 'notifications' : 'notifications-outline';
      break;
    case 'Settings':
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    default:
      iconName = focused ? 'home' : 'home-outline';
      break;
  }
  return <Icon icon={iconName} color={focused ? '#1F93FF' : '#293F51'} />;
};

const TabStack = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => renderTabIcon(route, focused, color, size),
      tabBarActiveTintColor: '#1F93FF',
      tabBarInactiveTintColor: '#293F51',
      tabBarStyle: {
        paddingTop: 2,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
    })}>
    <Tab.Screen name="Conversations" component={HomeStack} />
    <Tab.Screen name="Notifications" component={NotificationStack} />
    <Tab.Screen name="Settings" component={SettingsStack} />
  </Tab.Navigator>
);

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
                  <Stack.Screen name="NotificationPreference" component={NotificationPreference} />
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
