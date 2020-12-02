import React, { Component } from 'react';
import { TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import { Radio, Icon, withStyles } from '@ui-kitten/components';

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
    fontSize: theme['font-size-medium'],
    textAlign: 'left',
  },
  radioView: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  item: PropTypes.shape({
    name: PropTypes.string,
  }),
  onCheckedChange: PropTypes.func,
  isChecked: PropTypes.bool,
  iconName: PropTypes.string,
};

class FilterItemComponent extends Component {
  render() {
    const {
      item,
      onCheckedChange,
      isChecked,
      iconName,
      eva: { style: themedStyle, theme },
    } = this.props;
    const { name } = item;

    return (
      <TouchableOpacity
        style={themedStyle.itemView}
        onPress={() => onCheckedChange({ item })}
        activeOpacity={0.5}>
        {iconName ? (
          <View style={themedStyle.iconView}>
            <Icon style={themedStyle.icon} fill={theme['text-hint-color']} name={iconName} />
          </View>
        ) : null}

        <View style={themedStyle.textView}>
          <CustomText style={themedStyle.text}>{name}</CustomText>
        </View>

        <View style={themedStyle.radioView}>
          <Radio checked={isChecked} onChange={() => onCheckedChange({ item })} />
        </View>
      </TouchableOpacity>
    );
  }
}

FilterItemComponent.propTypes = propTypes;

const FilterItem = withStyles(FilterItemComponent, styles);

export default React.memo(FilterItem);
