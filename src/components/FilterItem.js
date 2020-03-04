import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import { Radio, Icon } from 'react-native-ui-kitten';

import CustomText from './Text';

import { theme } from '../theme';
const styles = StyleSheet.create({
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
    color: theme['text-primary-color'],
    fontFamily: theme['font-family-regular'],
    fontSize: theme['font-size-medium'],
    textAlign: 'left',
  },
  radioView: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

const propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string,
  }),
  onCheckedChange: PropTypes.func,
  isChecked: PropTypes.bool,
  iconName: PropTypes.string,
};

class FilterItem extends Component {
  render() {
    const { item, onCheckedChange, isChecked, iconName } = this.props;
    const { name } = item;

    return (
      <TouchableOpacity
        style={styles.itemView}
        onPress={() => onCheckedChange({ item })}>
        {iconName ? (
          <View style={styles.iconView}>
            <Icon style={styles.icon} name={iconName} />
          </View>
        ) : null}

        <View style={styles.textView}>
          <CustomText style={styles.text}>{name}</CustomText>
        </View>

        <View style={styles.radioView}>
          <Radio
            checked={isChecked}
            onChange={() => onCheckedChange({ item })}
          />
        </View>
      </TouchableOpacity>
    );
  }
}

FilterItem.propTypes = propTypes;

export default FilterItem;
