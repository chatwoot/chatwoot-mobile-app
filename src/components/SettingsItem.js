import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Toggle } from 'react-native-ui-kitten';
import { Icon } from 'react-native-ui-kitten';

import CustomText from './Text';
import { theme } from '../theme';

const propTypes = {
  text: PropTypes.string,
  checked: PropTypes.bool,
  iconSize: PropTypes.string,
  itemType: PropTypes.string,
  iconName: PropTypes.string,
  itemName: PropTypes.string,
  onPressItem: PropTypes.func,
};

class SettingsItem extends Component {
  render() {
    const {
      text,
      checked,
      iconSize,
      itemType,
      iconName,
      itemName,
      onPressItem,
    } = this.props;

    return (
      <TouchableOpacity
        style={[styles.section, styles.enabledSection]}
        onPress={() => onPressItem({ itemName })}>
        <CustomText style={styles.sectionText}>{text}</CustomText>
        {itemType === 'toggle' ? (
          <Toggle checked={checked} size={iconSize} />
        ) : (
          <Icon
            name={iconName}
            fill={theme['color-primary']}
            width={26}
            height={26}
          />
        )}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border-light'],
  },
  enabledSection: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 16,
  },

  sectionText: {
    color: theme['color-body'],
    fontSize: theme['font-size-medium'],
    fontWeight: theme['font-medium'],
  },
});

SettingsItem.propTypes = propTypes;

export default SettingsItem;
