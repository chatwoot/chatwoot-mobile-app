import { Button as UIKittenButton, withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';

class ButtonComponent extends Component {
  static propTypes = {
    theme: PropTypes.object,
    loading: PropTypes.bool,
    children: PropTypes.node,
  };

  static defaultProps = {
    loading: false,
  };

  renderChildren() {
    const { loading } = this.props;

    if (loading) {
      return null;
    }

    return this.props.children;
  }

  renderLoading() {
    const { theme } = this.props;
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

export default withStyles(ButtonComponent);
