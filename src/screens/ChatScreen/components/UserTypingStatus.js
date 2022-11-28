import React from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles } from '@ui-kitten/components';

import CustomText from '../../../components/Text';
import { View } from 'react-native-animatable';

const styles = theme => ({
  subHeaderTitle: {
    fontSize: theme['font-size-extra-small'],
    color: theme['color-success-500'],
    paddingLeft: 4,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  typingUser: PropTypes.string,
};

const typingStatusComponent = ({ typingUser, eva: { style, theme } }) => {
  return (
    <React.Fragment>
      <TouchableOpacity>
        <View>
          <CustomText style={style.subHeaderTitle}>{typingUser ? `${typingUser}` : ''}</CustomText>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

typingStatusComponent.propTypes = propTypes;

export default withStyles(typingStatusComponent, styles);
