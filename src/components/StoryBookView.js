import React from 'react';
import PropTypes from 'prop-types';
import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native';
import { LightTheme } from 'src/theme.v2';

const styles = {
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
};

export default function StoryBookView({ children }) {
  return (
    <NavigationContainer theme={LightTheme}>
      <View style={styles.main}>{children}</View>
    </NavigationContainer>
  );
}

StoryBookView.defaultProps = {
  children: null,
};

StoryBookView.propTypes = {
  children: PropTypes.node,
};
