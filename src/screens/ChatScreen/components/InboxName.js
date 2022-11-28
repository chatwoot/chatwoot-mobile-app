import React from 'react';
import PropTypes from 'prop-types';
import { Icon, withStyles } from '@ui-kitten/components';

import CustomText from '../../../components/Text';
import { View } from 'react-native-animatable';

const styles = theme => ({
  inboxDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelText: {
    color: theme['color-secondary-500'],
    fontWeight: theme['font-medium'],
    marginLeft: 2,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  iconName: PropTypes.string,
  inboxName: PropTypes.string,
  size: PropTypes.string,
};

const InboxNameComponent = ({ iconName, inboxName, size, eva: { style, theme } }) => {
  const textSize = () => {
    if (size === 'small') {
      return { fontSize: theme['font-size-extra-extra-small'] };
    }
    if (size === 'large') {
      return { fontSize: theme['font-size-large'] };
    } else {
      return { fontSize: theme['font-size-extra-small'] };
    }
  };
  return (
    <React.Fragment>
      <View style={style.inboxDetails}>
        {iconName ? (
          <Icon fill={theme['color-secondary-500']} name={iconName} height={12} width={12} />
        ) : null}
        {inboxName ? (
          <CustomText style={[style.channelText, textSize()]}>{inboxName}</CustomText>
        ) : null}
      </View>
    </React.Fragment>
  );
};

InboxNameComponent.propTypes = propTypes;

export default withStyles(InboxNameComponent, styles);
