import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from './screens/HomeScreen/HomeScreen';

import LoginScreen from './screens/LoginScreen/LoginScreen';

const createNavigationStack = ({ initialRouteName }) =>
  createStackNavigator(
    {
      Login: { screen: LoginScreen },
      Home: { screen: HomeScreen },
    },
    {
      initialRouteName,
      headerMode: 'none',
    },
  );

class RootApp extends React.Component {
  render() {
    const App = createAppContainer(
      createNavigationStack({ initialRouteName: 'Login' }),
    );
    return <App />;
  }
}

export default RootApp;
