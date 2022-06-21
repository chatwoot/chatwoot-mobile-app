import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import { connect } from 'react-redux';

import CustomText from './Text';

const styles = theme => ({
  container: {
    backgroundColor: theme['color-primary-default'],
  },
  offlineText: {
    // For texts displayed on contrast backgrounds (color-danger-800 in this case)
    // We have predefined text-control-color variable
    color: theme['text-control-color'],
    padding: 8,
    textAlign: 'center',
    fontWeight: theme['font-medium'],
    fontSize: theme['text-primary-size'],
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  isUpdating: PropTypes.bool.isRequired,
};

class LoadingBarComponent extends Component {
  render() {
    const {
      eva: { style, theme },
      isUpdating,
    } = this.props;

    return isUpdating ? (
      <SafeAreaView style={style.container}>
        <StatusBar backgroundColor={theme['color-primary-default']} />
        <CustomText style={[style.offlineText]}>Refreshing</CustomText>
      </SafeAreaView>
    ) : null;
  }
}

LoadingBarComponent.propTypes = propTypes;

function bindAction(dispatch) {
  return {};
}
function mapStateToProps(state) {
  return {
    isUpdating: state.conversation.isUpdating,
  };
}

const LoadingBar = withStyles(LoadingBarComponent, styles);
export default connect(mapStateToProps, bindAction)(LoadingBar);
