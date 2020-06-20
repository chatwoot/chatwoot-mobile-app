import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Linking } from 'react-native';

import messaging from '@react-native-firebase/messaging';
import PropTypes from 'prop-types';
import { createStackNavigator } from '@react-navigation/stack';
import ConfigureURLScreen from './screens/ConfigureURLScreen/ConfigureURLScreen';
import LoginScreen from './screens/LoginScreen/LoginScreen';
import TabBar from './components/TabBar';
import ConversationList from './screens/ConversationList/ConversationList';
import SettingsScreen from './screens/Settings/SettingsScreen';
import LanguageScreen from './screens/Language/LanguageScreen';
import ChatScreen from './screens/ChatScreen/ChatScreen';
import ConversationFilter from './screens/ConversationFilter/ConversationFilter';
import ResetPassword from './screens/ForgotPassword/ForgotPassword';
import ImageScreen from './screens/ChatScreen/ImageScreen';
import NotificationScreen from './screens/Notification/NotificationScreen';
import AccountScreen from './screens/Account/AccountScreen';
import i18n from './i18n';
import { navigationRef } from './helpers/NavigationHelper';
import { handlePush } from './helpers/PushHelper';

import { doDeepLinking } from './helpers/DeepLinking';
import { resetConversation } from './actions/conversation';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

messaging().setBackgroundMessageHandler(async (remoteMessage) => {});

const HomeStack = () => (
  <Stack.Navigator initialRouteName="ConversationList" headerMode="none">
    <Stack.Screen name="ConversationList" component={ConversationList} />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator initialRouteName="Settings" headerMode={'none'}>
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

const NotificationStack = () => (
  <Stack.Navigator initialRouteName="Notification" headerMode={'none'}>
    <Tab.Screen name="Notification" component={NotificationScreen} />
  </Stack.Navigator>
);

const TabStack = () => (
  <Tab.Navigator tabBar={(props) => <TabBar {...props} />}>
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Notification" component={NotificationStack} />
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

const _handleOpenURL = (event) => {
  doDeepLinking({ url: event.url });
};

const App = () => {
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const isUrlSet = useSelector((state) => state.settings.isUrlSet);

  const locale = useSelector((state) => state.settings.localeValue);
  const { linkedURL, resetURL } = useDeepLinkURL();

  useEffect(() => {
    resetURL();
  }, [linkedURL, resetURL]);

  useEffect(() => {
    dispatch(resetConversation());
    // Notification caused app to open from foreground state
    messaging().onMessage((remoteMessage) => {
      // handlePush({ remoteMessage, type: 'foreground' });
    });

    // Notification caused app to open from background state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      handlePush({ remoteMessage, type: 'background' });
    });
    // Notification caused app to open from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          handlePush({ remoteMessage, type: 'quite' });
        }
      });
  }, [dispatch]);

  if (linkedURL) {
    _handleOpenURL({ url: linkedURL });
  }

  i18n.locale = locale;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={isUrlSet ? 'Login' : 'ConfigureURL'} headerMode={'none'}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Tab" component={TabStack} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="ConversationFilter" component={ConversationFilter} />
            <Stack.Screen name="ImageScreen" component={ImageScreen} />
            <Stack.Screen name="Language" component={LanguageScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="ConfigureURL" component={ConfigureURLScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen name="ConversationList" component={ConversationList} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

App.propTypes = propTypes;
App.defaultProps = defaultProps;
export default App;
