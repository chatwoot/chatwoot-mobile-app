import React from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Icon, withStyles } from '@ui-kitten/components';
import CustomText from 'src/components/Text';
import { View } from 'react-native-animatable';

import { getContrastingTextColor } from 'src/helpers/ColorHelper';

const styles = theme => ({
  labelView: {
    flexDirection: 'row',
    marginBottom: 6,
    marginRight: 4,
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: theme['font-size-extra-small'],
  },
  labelCloseIcon: {
    marginRight: 4,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  id: PropTypes.number,
  title: PropTypes.string,
  color: PropTypes.string,
  conversationId: PropTypes.number,
  onClickRemoveLabel: PropTypes.func,
};

const LabelBox = ({ id, title, color, onClickRemoveLabel, eva: { style, theme } }) => {
  const getLabelBackgroundColor = code => {
    return {
      backgroundColor: code,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 4,
      justifyContent: 'flex-start',
    };
  };

  return (
    <React.Fragment>
      <TouchableOpacity>
        <View style={style.labelView} key={id}>
          <View style={[getLabelBackgroundColor(color)]}>
            <CustomText style={[style.label, { color: getContrastingTextColor(color) }]}>
              {title}
            </CustomText>
            <Icon
              name="close-outline"
              height={14}
              width={14}
              fill={`${getContrastingTextColor(color)}`}
              style={style.labelCloseIcon}
              onPress={() => onClickRemoveLabel()}
            />
          </View>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

LabelBox.propTypes = propTypes;

export default withStyles(LabelBox, styles);
