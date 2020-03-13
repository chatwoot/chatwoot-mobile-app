import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Toggle, Divider, Icon, withStyles } from '@ui-kitten/components';

import CustomText from './Text';

class SettingsItem extends Component {
  static propTypes = {
    theme: PropTypes.object,
    themedStyle: PropTypes.object,
    text: PropTypes.string,
    checked: PropTypes.bool,
    iconSize: PropTypes.string,
    itemType: PropTypes.string,
    iconName: PropTypes.string,
    itemName: PropTypes.string,
    onPressItem: PropTypes.func,
  };

  render() {
    const {
      text,
      checked,
      iconSize,
      itemType,
      iconName,
      itemName,
      onPressItem,
      theme,
      themedStyle,
    } = this.props;

    return (
      <React.Fragment>
        <TouchableOpacity
          style={[themedStyle.section, themedStyle.enabledSection]}
          onPress={() => onPressItem({ itemName })}>
          <CustomText style={themedStyle.sectionText}>{text}</CustomText>
          {itemType === 'toggle' ? (
            <Toggle checked={checked} size={iconSize} />
          ) : (
            <Icon
              name={iconName}
              fill={theme['color-primary-default']}
              width={26}
              height={26}
            />
          )}
        </TouchableOpacity>
        <Divider />
      </React.Fragment>
    );
  }
}

const styles = theme => ({
  section: {
    padding: 16,
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

export default withStyles(SettingsItem, styles);
