import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import { Radio, withStyles } from '@ui-kitten/components';

import CustomText from './Text';

const styles = (theme) => ({
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 8,
  },
  iconView: {
    flex: 1,
  },
  icon: {
    width: 16,
    height: 16,
  },
  textView: {
    flex: 8,
  },
  text: {
    color: theme['text-hint-color'],
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-small'],
    textAlign: 'left',
    textTransform: 'capitalize',
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

const AvailabilityItemComponent = ({ title, item, onCheckedChange, isChecked, eva: { style } }) => (
  <TouchableOpacity style={style.itemView} onPress={() => onCheckedChange({ item })}>
    <View style={style.textView}>
      <CustomText style={style.text}>{title}</CustomText>
    </View>

    <View style={style.radioView}>
      <Radio checked={isChecked} onChange={() => onCheckedChange({ item })} />
    </View>
  </TouchableOpacity>
);

AvailabilityItemComponent.propTypes = propTypes;

const AvailabilityItem = withStyles(AvailabilityItemComponent, styles);
export default AvailabilityItem;
