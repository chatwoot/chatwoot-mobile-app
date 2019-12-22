import { Button as UIKittenButton } from 'react-native-ui-kitten';

import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';

import { theme } from '../theme';

export default class Button extends Component {
  renderChildren() {
    const { loading, children } = this.props;

    if (loading) {
      return null;
    }

    return children;
  }

  renderLoading() {
    return <ActivityIndicator color={theme['loader-color']} />;
  }

  render() {
    const { loading } = this.props;
    let customProps;
    if (loading) {
      customProps = {
        icon: () => this.renderLoading(),
        disabled: true,
      };
    }

    return (
      <UIKittenButton {...this.props} {...customProps}>
        {this.renderChildren()}
      </UIKittenButton>
    );
  }
}
