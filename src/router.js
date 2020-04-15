import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { navigationRef } from './helpers/NavigationHelper';

import PropTypes from 'prop-types';
import { createStackNavigator } from '@react-navigation/stack';
import ConfigureURLScreen from './screens/ConfigureURLScreen/ConfigureURLScreen';
import LoginScreen from './screens/LoginScreen/LoginScreen';
import TabBar from './components/TabBar';
import ConversationList from './screens/ConversationList/ConversationList';
import SettingsScreen from './screens/Settings/SettingsScreen';
import ChatScreen from './screens/ChatScreen/ChatScreen';
import ConversationFilter from './screens/ConversationFilter/ConversationFilter';
import ResetPassword from './screens/ForgotPassword/ForgotPassword';
import ImageScreen from './screens/ChatScreen/ImageScreen';

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

class RootApp extends Component {
  static propTypes = {
    isLogged: PropTypes.bool,
    isUrlSet: PropTypes.bool,
  };

  static defaultProps = {
    isLogged: false,
    isUrlSet: false,
  };
  render() {
    const { isLogged, isUrlSet } = this.props;

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
            </>
          ) : (
            <>
              <Stack.Screen
                name="ConfigureURL"
                component={ConfigureURLScreen}
              />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPassword} />
              <Stack.Screen
                name="ConversationList"
                component={ConversationList}
              />

              <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

function bindAction() {
  return {};
}

function mapStateToProps(state) {
  return {
    isLogged: state.auth.isLogged,
    isUrlSet: state.settings.isUrlSet,
  };
}

export default connect(mapStateToProps, bindAction)(RootApp);
