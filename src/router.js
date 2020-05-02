import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Linking, View } from 'react-native';
import { Spinner } from '@ui-kitten/components';
import { navigationRef, navigate } from './helpers/NavigationHelper';

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

import { checkUrlIsConversation } from './helpers/UrlHelper';

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

const useMount = (func) => useEffect(() => func(), [func]);

const useInitialURL = () => {
  const [urlDetails, setUrlDetails] = useState(null);
  const [urlProcessing, setProcessing] = useState(true);
  const accountId = useSelector((state) => state.auth.user.account_id);

  useMount(() => {
    const getUrlAsync = async () => {
      // Get the deep link used to open the app
      const initialUrl = await Linking.getInitialURL();

      const isConversationURL = await checkUrlIsConversation({
        url: initialUrl,
      });
      // console.log('isURLConversation', initialUrl, isConversationURL);

      if (isConversationURL) {
        const urlParams = initialUrl.split('/');

        const parsedAccountId = parseInt(urlParams[5]);
        const conversationId = parseInt(urlParams[7]);
        // Check account id and opened conversation account id are same
        // console.log(`Opening ${conversationId}`);

        if (parsedAccountId === accountId) {
          navigate('ChatScreen', {
            conversationId,
          });
        }
      } else {
        setProcessing(false);
        setUrlDetails(null);
      }
    };

    getUrlAsync();
  });

  return { urlDetails, urlProcessing };
};

const App = () => {
  const isLogged = useSelector((state) => state.auth.isLogged);
  const isUrlSet = useSelector((state) => state.settings.isUrlSet);
  const locale = useSelector((state) => state.settings.localeValue);
  const { urlProcessing, urlDetails } = useInitialURL();
  i18n.locale = locale;

  if (!urlDetails || urlProcessing) {
    return (
      <View
        style={{
          alignItems: 'center',
          paddingTop: 16,
          height: '100%',
        }}>
        <Spinner size="large" />
      </View>
    );
  }
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
