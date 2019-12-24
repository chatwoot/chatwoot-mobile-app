import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

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
  static propTypes = {
    isLogged: PropTypes.bool,
  };

  static defaultProps = {
    isLogged: false,
  };

  render() {
    const { isLogged } = this.props;

    const AuthStack = createNavigationStack({
      initialRouteName: 'Login',
    });
    const LoggedInStack = createNavigationStack({
      initialRouteName: 'Home',
    });
    const stack = isLogged ? LoggedInStack : AuthStack;

    const App = createAppContainer(stack);

    return <App />;
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
