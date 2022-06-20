import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { SafeAreaView, StatusBar, Text } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import { connect } from 'react-redux';

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
  animationConstants = {
    DURATION: 800,
    TO_VALUE: 4,
    INPUT_RANGE: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4],
    OUTPUT_RANGE: [0, -15, 0, 15, 0, -15, 0, 15, 0],
  };

  render() {
    const {
      eva: { style, theme },
      isUpdating,
    } = this.props;

    return isUpdating ? (
      <SafeAreaView style={style.container}>
        <StatusBar backgroundColor={theme['color-primary-default']} />
        <Text style={[style.offlineText]}>Refreshing</Text>
      </SafeAreaView>
    ) : null;
    // return (
    //   <SafeAreaView style={style.container}>
    //     <StatusBar backgroundColor={theme['color-primary-default']} />
    //     <Text style={[style.offlineText]}>Refreshing</Text>
    //   </SafeAreaView>
    // );
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
