import React, { Component } from 'react';

import { Spinner, Text, Button } from 'react-native-ui-kitten';

import styles from './LoaderButton.style';

export default class LoadingButton extends Component {
  renderText() {
    const { loading, placeholder } = this.props;
    if (!loading) {
      return <Text style={styles.loginButtonText}>{placeholder}</Text>;
    }
    return <Spinner />;
  }

  render() {
    const { loading, onPress, style } = this.props;

    return (
      <Button
        style={[styles.loginButton, style]}
        disabled={loading}
        onPress={() => onPress()}>
        {' '}
        {this.renderText()}
      </Button>
    );
  }
}
