import React, { useEffect, useRef, useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Linking, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import PropTypes from 'prop-types';
import { LightTheme } from 'src/theme.v2';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ConfigureURLScreen from './screens/ConfigureURLScreen/ConfigureURLScreen';
import LoginScreen from './screens/LoginScreen/LoginScreen';
import TabBar from './components/TabBar';
import ConversationScreen from './screens/Conversation/ConversationScreen';
import NotificationScreen from './screens/Notification/NotificationScreen';
import SettingsScreen from './screens/Settings/SettingsScreen';
import LanguageScreen from './screens/Language/LanguageScreen';
import ChatScreen from './screens/ChatScreen/ChatScreen';
import ConversationFilter from './screens/ConversationFilter/ConversationFilter';
import ResetPassword from './screens/ForgotPassword/ForgotPassword';
import ImageScreen from './screens/ChatScreen/ImageScreen';
import AccountScreen from './screens/Account/AccountScreen';
import AvailabilityScreen from './screens/Availability/Availability';
import NotificationPreference from './screens/NotificationPreference/NotificationPreference';
import ConversationDetailsScreen from './screens/ConversationDetails/ConversationDetailsScreen';
import ConversationAction from './screens/ConversationAction/ConversationAction';
import AgentScreen from './screens/AgentScreen/AgentScreen';
import LabelScreen from './screens/LabelScreen/LabelScreen';

import i18n from './i18n';
import { navigationRef } from './helpers/NavigationHelper';
import { handlePush } from './helpers/PushHelper';

import { doDeepLinking } from './helpers/DeepLinking';
import { resetConversation, getConversations } from './actions/conversation';
import { withStyles } from '@ui-kitten/components';
import { captureScreen } from './helpers/Analytics';
import TeamScreen from './screens/TeamScreen/TeamScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator initialRouteName="ConversationScreen" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ConversationScreen" component={ConversationScreen} />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator initialRouteName="Settings" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

const NotificationStack = () => (
  <Stack.Navigator initialRouteName="Notification" screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Notification" component={NotificationScreen} />
  </Stack.Navigator>
);

const TabStack = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={props => <TabBar {...props} />}>
    <Tab.Screen name="HomeTab" component={HomeStack} />
    <Tab.Screen name="NotificationTab" component={NotificationStack} />
    <Tab.Screen name="SettingsTab" component={SettingsStack} />
  </Tab.Navigator>
);

messaging().setBackgroundMessageHandler(async remoteMessage => {});

const propTypes = {
  isLoggedIn: PropTypes.bool,
  isUrlSet: PropTypes.bool,
  eva: PropTypes.shape({
    style: PropTypes.object,
  }).isRequired,
};

const defaultProps = {
  isLoggedIn: false,
  isUrlSet: false,
};

const useDeepLinkURL = () => {
  const [linkedURL, setLinkedURL] = useState(null);

  // 1. If the app is not already open, it is opened and the url is passed in as the initialURL
  // You can handle these events with Linking.getInitialURL(url) -- it returns a Promise that
  // resolves to the url, if there is one.
  // Get the deep link used to open the app in minimized state
  useEffect(() => {
    const getUrlAsync = async () => {
      // Get the deep link used to open the app
      const initialUrl = await Linking.getInitialURL();
      setLinkedURL(decodeURI(initialUrl));
    };

    getUrlAsync();
  }, []);

  // 2. If the app is already open, the app is foregrounded and a Linking event is fired
  // You can handle these events with Linking.addEventListener(url, callback)
  // Get the deep link used to open the app in closed state
  useEffect(() => {
    const callback = ({ url }) => setLinkedURL(decodeURI(url));
    Linking.addEventListener('url', callback);
    return () => {
      Linking.removeEventListener('url', callback);
    };
  }, []);

  const resetURL = () => setLinkedURL(null);

  return { linkedURL, resetURL };
};

const _handleOpenURL = event => {
  const { url } = event;
  if (url) {
    doDeepLinking({ url });
  }
};

const App = ({ eva: { style } }) => {
  // TODO: Lets use light theme for now, add dark theme later
  const theme = LightTheme;

  const dispatch = useDispatch();
  const routeNameRef = useRef();

  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const isUrlSet = useSelector(state => state.settings.isUrlSet);

  const locale = useSelector(state => state.settings.localeValue);
  const { linkedURL, resetURL } = useDeepLinkURL();

  useEffect(() => {
    resetURL();
  }, [linkedURL, resetURL]);

  useEffect(() => {
    dispatch(resetConversation());
    // Notification caused app to open from foreground state
    messaging().onMessage(remoteMessage => {
      // handlePush({ remoteMessage, type: 'foreground' });
    });

    // Notification caused app to open from background state
    messaging().onNotificationOpenedApp(remoteMessage => {
      handlePush({ remoteMessage, type: 'background' });
    });
    // Notification caused app to open from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          handlePush({ remoteMessage, type: 'quite' });
          setTimeout(() => {
            // TODO: Load all the conversations
            dispatch(getConversations({ assigneeType: 0 }));
          }, 500);
        }
      });
  }, [dispatch]);

  if (linkedURL) {
    _handleOpenURL({ url: linkedURL });
  }
  i18n.locale = locale;

  return (
    <KeyboardAvoidingView
      style={style.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled>
      <SafeAreaView style={style.container}>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => (routeNameRef.current = navigationRef.current.getCurrentRoute().name)}
          onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = navigationRef.current.getCurrentRoute().name;
            if (previousRouteName !== currentRouteName) {
              captureScreen({ screenName: currentRouteName });
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
                  <Stack.Screen name="ConversationFilter" component={ConversationFilter} />
                  <Stack.Screen name="ImageScreen" component={ImageScreen} />
                  <Stack.Screen name="Language" component={LanguageScreen} />
                  <Stack.Screen name="Account" component={AccountScreen} />
                  <Stack.Screen name="ConversationDetails" component={ConversationDetailsScreen} />
                  <Stack.Screen name="ConversationAction" component={ConversationAction} />
                  <Stack.Screen name="AgentScreen" component={AgentScreen} />
                  <Stack.Screen name="LabelScreen" component={LabelScreen} />
                  <Stack.Screen name="TeamScreen" component={TeamScreen} />
                  <Stack.Screen name="Availability" component={AvailabilityScreen} />
                  <Stack.Screen name="NotificationPreference" component={NotificationPreference} />
                </Fragment>
              ) : (
                <Fragment>
                  <Stack.Screen name="ConfigureURL" component={ConfigureURLScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="ResetPassword" component={ResetPassword} />
                  <Stack.Screen name="ConversationScreen" component={ConversationScreen} />
                  <Stack.Screen name="Language" component={LanguageScreen} />
                </Fragment>
              )}
            </Stack.Navigator>
          </BottomSheetModalProvider>
        </NavigationContainer>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = theme => ({
  container: {
    flex: 1,
  },
});

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default withStyles(App, styles);
