import React from 'react';
import PropTypes from 'prop-types';
import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native';
import { IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { LightTheme } from 'src/theme.v2';
// import Icon from 'src/components/Icon/Icon';

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
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <NavigationContainer theme={LightTheme}>
        <View style={styles.main}>{children}</View>
      </NavigationContainer>
    </React.Fragment>
  );
}

StoryBookView.defaultProps = {
  children: null,
};

StoryBookView.propTypes = {
  children: PropTypes.node,
};
