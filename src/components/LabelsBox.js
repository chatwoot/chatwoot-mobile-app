import React from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Icon, withStyles } from '@ui-kitten/components';
import CustomText from 'src/components/Text';
import { View } from 'react-native-animatable';

const styles = theme => ({
  labelView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 6,
    paddingHorizontal: 6,
    height: 24,
    marginRight: 4,
    backgroundColor: theme['color-secondary-50'],
    borderColor: theme['color-secondary-75'],
    borderRadius: 4,
    borderWidth: 0.5,
  },
  label: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    color: theme['color-secondary-700'],
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-medium'],
  },
  labelCloseIcon: {
    marginLeft: 2,
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
  const getLabelColor = clr => {
    return {
      backgroundColor: clr,
      width: 14,
      height: 14,
      borderRadius: 5,
      marginRight: 2,
    };
  };

  return (
    <React.Fragment>
      <TouchableOpacity>
        <View style={style.labelView} key={id}>
          <View style={[getLabelColor(color)]} />
          <CustomText style={style.label}>{title}</CustomText>
          <Icon
            name="close-outline"
            height={16}
            width={16}
            fill={theme['color-secondary-700']}
            style={style.labelCloseIcon}
            onPress={() => onClickRemoveLabel()}
          />
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

LabelBox.propTypes = propTypes;

export default withStyles(LabelBox, styles);
