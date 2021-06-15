import React, { useEffect, useRef, useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Linking, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
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
import AvailabilityScreen from './screens/Availability/Availability';
import NotificationPreference from './screens/NotificationPreference/NotificationPreference';
import ConversationDetailsScreen from './screens/ConversationDetails/ConversationDetailsScreen';
import ConversationAction from './screens/ConversationAction/ConversationAction';
import AgentScreen from './screens/AgentScreen/AgentScreen';

import i18n from './i18n';
import { navigationRef } from './helpers/NavigationHelper';
import { handlePush } from './helpers/PushHelper';

import { doDeepLinking } from './helpers/DeepLinking';
import { resetConversation, getConversations } from './actions/conversation';
import { withStyles } from '@ui-kitten/components';
import { captureScreen } from './helpers/Analytics';

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

const _handleOpenURL = (event) => {
  const { url } = event;
  if (url) {
    doDeepLinking({ url });
  }
};

const App = ({ eva: { style } }) => {
  const dispatch = useDispatch();
  const routeNameRef = useRef();

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
          setTimeout(() => {
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
          }}>
          <Stack.Navigator
            initialRouteName={isUrlSet ? 'Login' : 'ConfigureURL'}
            headerMode={'none'}>
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
                <Stack.Screen name="Availability" component={AvailabilityScreen} />
                <Stack.Screen name="NotificationPreference" component={NotificationPreference} />
              </Fragment>
            ) : (
              <Fragment>
                <Stack.Screen name="ConfigureURL" component={ConfigureURLScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPassword} />
                <Stack.Screen name="ConversationList" component={ConversationList} />
                <Stack.Screen name="Language" component={LanguageScreen} />
              </Fragment>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = (theme) => ({
  container: {
    flex: 1,
  },
});

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default withStyles(App, styles);
