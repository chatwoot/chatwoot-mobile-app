import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Linking } from 'react-native';
import { navigationRef } from './helpers/NavigationHelper';

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
import i18n from './i18n';

import { doDeepLinking } from './helpers/DeepLinking';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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

const TabStack = () => (
  <Tab.Navigator tabBar={(props) => <TabBar {...props} />}>
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Settings" component={SettingsStack} />
  </Tab.Navigator>
);

const propTypes = {
  isLogged: PropTypes.bool,
  isUrlSet: PropTypes.bool,
};

const defaultProps = {
  isLogged: false,
  isUrlSet: false,
};

const useInitialURL = async () => {
  const initialUrl = await Linking.getInitialURL();
  if (initialUrl) {
    doDeepLinking({ url: initialUrl });
  }
};

const _handleOpenURL = (event) => {
  doDeepLinking({ url: event.url });
};

const App = () => {
  const isLogged = useSelector((state) => state.auth.isLogged);
  const isUrlSet = useSelector((state) => state.settings.isUrlSet);
  const locale = useSelector((state) => state.settings.localeValue);

  i18n.locale = locale;
  // Get the deep link used to open the app in minimized state
  useEffect(() => {
    Linking.addEventListener('url', _handleOpenURL);
    return () => {
      Linking.removeEventListener('url');
    };
  }, []);
  // Get the deep link used to open the app in closed state
  useInitialURL();

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={isUrlSet ? 'Login' : 'ConfigureURL'}
        headerMode={'none'}>
        {isLogged ? (
          <>
            <Stack.Screen name="Tab" component={TabStack} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen
              name="ConversationFilter"
              component={ConversationFilter}
            />
            <Stack.Screen name="ImageScreen" component={ImageScreen} />
            <Stack.Screen name="Language" component={LanguageScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="ConfigureURL" component={ConfigureURLScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen
              name="ConversationList"
              component={ConversationList}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

App.propTypes = propTypes;
App.defaultProps = defaultProps;
export default App;
