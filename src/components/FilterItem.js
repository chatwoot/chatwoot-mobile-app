import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { Radio } from 'react-native-ui-kitten';

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
  itemText: {
    color: theme['text-primary-color'],
    fontFamily: theme['font-family-regular'],
    fontSize: theme['font-size-medium'],
  },
});

const propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string,
  }),
  onCheckedChange: PropTypes.func,
  isChecked: PropTypes.bool,
};

class FilterItem extends Component {
  render() {
    const { item, onCheckedChange, isChecked } = this.props;
    const { name } = item;

    return (
      <View style={styles.itemView}>
        <CustomText style={styles.itemText}>{name}</CustomText>
        <Radio
          style={styles.radio}
          checked={isChecked}
          onChange={() => onCheckedChange({ item })}
        />
      </View>
    );
  }
}

FilterItem.propTypes = propTypes;

export default FilterItem;
