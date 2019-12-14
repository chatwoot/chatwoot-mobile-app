import { Button } from 'react-native-ui-kitten';
import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';

import { theme } from '../theme';

export default class LoaderButton extends Component {
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

    const customProps = {};

    if (loading) {
      Object.assign(customProps, {
        icon: () => this.renderLoading(),
        disabled: true,
      });
    }
    return (
      <Button {...this.props} {...customProps}>
        {this.renderChildren()}
      </Button>
    );
  }
}
