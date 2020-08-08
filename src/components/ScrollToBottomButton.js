import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useStyleSheet, StyleService, Icon } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import { theme } from '../theme';

const styles = StyleService.create({
  button: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    position: 'absolute',
    bottom: 10,
    right: 10,
    height: 40,
    backgroundColor: theme['color-basic-100'],
    borderRadius: 100,
  },
});

const propTypes = {
  scrollToBottom: PropTypes.func.isRequired,
};

const ScrollToButton = ({ scrollToBottom }) => {
  const style = useStyleSheet(styles);

  return (
    <TouchableOpacity onPress={scrollToBottom} style={style.button} activeOpacity={0.95}>
      <Icon
        name="arrowhead-down-outline"
        width={16}
        height={16}
        fill={theme['color-primary-default']}
      />
    </TouchableOpacity>
  );
};

ScrollToButton.propTypes = propTypes;

export default ScrollToButton;
