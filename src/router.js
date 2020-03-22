import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import PropTypes from 'prop-types';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen/LoginScreen';
import TabBar from './components/TabBar';
import ConversationList from './screens/ConversationList/ConversationList';
import SettingsScreen from './screens/Settings/SettingsScreen';
import ChatScreen from './screens/ChatScreen/ChatScreen';
import ConversationFilter from './screens/ConversationFilter/ConversationFilter';
import ResetPassword from './screens/ForgotPassword/ForgotPassword';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function homeStack() {
  return (
    <Stack.Navigator initialRouteName="ConversationList" headerMode={'none'}>
      <Stack.Screen name="ConversationList" component={ConversationList} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ConversationFilter" component={ConversationFilter} />
    </Stack.Navigator>
  );
}
function settingsStack() {
  return (
    <Stack.Navigator initialRouteName="Settings" headerMode={'none'}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
function appTabs() {
  return (
    <Tab.Navigator tabBar={props => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={homeStack} />
      <Tab.Screen name="Settings" component={settingsStack} />
    </Tab.Navigator>
  );
}
class RootApp extends Component {
  static propTypes = {
    isLogged: PropTypes.bool,
  };

  static defaultProps = {
    isLogged: false,
  };
  render() {
    const { isLogged } = this.props;

    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" headerMode={'none'}>
          {isLogged ? (
            <Stack.Screen name="Tab" component={appTabs} />
          ) : (
            <React.Fragment>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPassword} />
              <Stack.Screen
                name="ConversationList"
                component={ConversationList}
              />
              <Stack.Screen
                name="ConversationFilter"
                component={ConversationFilter}
              />
              <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
              <Stack.Screen name="ChatScreen" component={ChatScreen} />
            </React.Fragment>
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
  };
}

export default connect(mapStateToProps, bindAction)(RootApp);
