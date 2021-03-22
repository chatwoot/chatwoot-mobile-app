import React from 'react';
import { TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Toggle, Divider, Icon, withStyles } from '@ui-kitten/components';

import CustomText from 'components/Text';

const styles = (theme) => ({
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
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  text: PropTypes.string,
  checked: PropTypes.bool,
  iconSize: PropTypes.string,
  itemType: PropTypes.string,
  iconName: PropTypes.string,
  itemName: PropTypes.string,
  onPressItem: PropTypes.func,
};

const SettingsItem = ({
  text,
  checked,
  iconSize,
  itemType,
  iconName,
  itemName,
  onPressItem,
  eva: { style, theme },
}) => {
  return (
    <React.Fragment>
      <TouchableOpacity
        style={[style.section, style.enabledSection]}
        onPress={() => onPressItem({ itemName })}>
        <CustomText style={style.sectionText}>{text}</CustomText>
        {itemType === 'toggle' ? (
          <Toggle checked={checked} size={iconSize} />
        ) : (
          <Icon name={iconName} fill={theme['color-primary-default']} width={26} height={26} />
        )}
      </TouchableOpacity>
      <Divider />
    </React.Fragment>
  );
};

SettingsItem.propTypes = propTypes;
export default withStyles(SettingsItem, styles);
