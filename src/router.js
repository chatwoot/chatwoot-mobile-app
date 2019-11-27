import React from 'react';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import Home from './screens/Home/Home';

const createNavigationStack = ({initialRouteName}) =>
  createStackNavigator({
    Home: {screen: Home},
  });

class RootApp extends React.Component {
  render() {
    const App = createAppContainer(
      createNavigationStack({initialRouteName: 'Home'}),
    );
    return <App />;
  }
}

export default RootApp;
