import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import { CheckBox, withStyles } from '@ui-kitten/components';

import CustomText from './Text';

const styles = (theme) => ({
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 8,
  },
  textView: {
    flex: 9,
  },
  text: {
    color: theme['text-hint-color'],
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-small'],
    textAlign: 'left',
    // textTransform: 'capitalize',
  },
  radioView: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
  }).isRequired,
  title: PropTypes.string,
  item: PropTypes.string,
  onCheckedChange: PropTypes.func,
  isChecked: PropTypes.bool,
};

const NotificationPreferenceItemComponent = ({
  title,
  item,
  onCheckedChange,
  isChecked,
  eva: { style },
}) => (
  <TouchableOpacity style={style.itemView} onPress={() => onCheckedChange({ item })}>
    <View style={style.textView}>
      <CustomText style={style.text}>{title}</CustomText>
    </View>

    <View style={style.radioView}>
      <CheckBox checked={isChecked} onChange={() => onCheckedChange({ item })} />
    </View>
  </TouchableOpacity>
);

NotificationPreferenceItemComponent.propTypes = propTypes;

const NotificationPreferenceItem = withStyles(NotificationPreferenceItemComponent, styles);
export default NotificationPreferenceItem;
