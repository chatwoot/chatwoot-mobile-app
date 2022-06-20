import React from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Icon, withStyles } from '@ui-kitten/components';
import CustomText from 'src/components/Text';

import { openNumber } from 'src/helpers/UrlHelper';
import { View } from 'react-native-animatable';

const styles = theme => ({
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
  },

  label: {
    paddingLeft: 8,
    fontSize: theme['font-size-small'],
    color: theme['text-light-color'],
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  type: PropTypes.string,
  value: PropTypes.string,
  iconName: PropTypes.string,
};

const ContactDetails = ({ type, value, iconName, eva: { style, theme } }) => {
  const onClickOpen = () => {
    if (type === 'phoneNumber') {
      openNumber(value);
    } else {
      return;
    }
  };

  return (
    <React.Fragment>
      <TouchableOpacity>
        <View style={style.detailsContainer}>
          <Icon
            name={iconName}
            height={14}
            width={14}
            fill={theme['color-primary-default']}
            onPress={() => onClickOpen()}
          />
          <CustomText style={style.label} onPress={() => onClickOpen()}>
            {value}
          </CustomText>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

ContactDetails.propTypes = propTypes;

export default withStyles(ContactDetails, styles);
