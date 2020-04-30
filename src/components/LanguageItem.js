import React, { Component } from 'react';
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
    fontSize: theme['font-size-medium'],
    textAlign: 'left',
  },
  radioView: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

const propTypes = {
  themedStyle: PropTypes.object,
  theme: PropTypes.object,
  title: PropTypes.string,
  item: PropTypes.string,
  onCheckedChange: PropTypes.func,
  isChecked: PropTypes.bool,
};

class LanguageItemComponent extends Component {
  render() {
    const { title, item, onCheckedChange, isChecked, themedStyle } = this.props;
    return (
      <TouchableOpacity
        style={themedStyle.itemView}
        onPress={() => onCheckedChange({ item })}>
        <View style={themedStyle.textView}>
          <CustomText style={themedStyle.text}>{title}</CustomText>
        </View>

        <View style={themedStyle.radioView}>
          <Radio
            checked={isChecked}
            onChange={() => onCheckedChange({ item })}
          />
        </View>
      </TouchableOpacity>
    );
  }
}

LanguageItemComponent.propTypes = propTypes;

const LanguageItem = withStyles(LanguageItemComponent, styles);
export default LanguageItem;
