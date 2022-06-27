import PropTypes from 'prop-types';
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import { useSelector } from 'react-redux';
import CustomText from './Text';

const styles = theme => ({
  container: {
    backgroundColor: theme['color-primary-default'],
  },
  offlineText: {
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
  isUpdating: PropTypes.bool,
};

const LoadingBarComponent = ({ eva: { style, theme } }) => {
  const isUpdating = useSelector(state => state.conversation.isUpdating);

  return isUpdating ? (
    <SafeAreaView style={style.container}>
      <StatusBar backgroundColor={theme['color-primary-default']} />
      <CustomText style={[style.offlineText]}>Refreshing</CustomText>
    </SafeAreaView>
  ) : null;
};
LoadingBarComponent.propTypes = propTypes;
const LoadingBar = withStyles(LoadingBarComponent, styles);
export default LoadingBar;
