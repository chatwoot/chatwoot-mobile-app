import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from './screens/HomeScreen/HomeScreen';

const createNavigationStack = ({ initialRouteName }) =>
  createStackNavigator({
    Home: { screen: HomeScreen },
  });

class RootApp extends React.Component {
  render() {
    const App = createAppContainer(
      createNavigationStack({ initialRouteName: 'Home' }),
    );
    return <App />;
  }
}

export default RootApp;
