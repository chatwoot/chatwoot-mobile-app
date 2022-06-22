import { withStyles, Icon } from '@ui-kitten/components';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import CustomText from './Text';
import { getTextSubstringWithEllipsis } from 'src/helpers/TextSubstring';

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  key: PropTypes.number,
  title: PropTypes.string,
  color: PropTypes.string,
  selectedLabels: PropTypes.bool,
  onClickAddRemoveLabels: PropTypes.func,
  activeLabel: PropTypes.bool,
};
const LabelItem = ({ eva, key, title, color, onClickAddRemoveLabels, activeLabel }) => {
  const { style, theme } = eva;

  const getLabelColor = clr => {
    return {
      backgroundColor: clr,
      width: 20,
      height: 20,
      borderRadius: 5,
      marginRight: 8,
    };
  };

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={style.container}
      onPress={() => onClickAddRemoveLabels()}>
      <View key={key}>
        <View style={style.labelDetailsView}>
          <View style={[getLabelColor(color)]} />
          <CustomText style={style.name}>{getTextSubstringWithEllipsis(title, 34)}</CustomText>
        </View>
      </View>
      <View style={style.radioView}>
        <Icon
          name={activeLabel ? 'radio-button-on' : 'radio-button-off'}
          height={20}
          width={20}
          fill={theme['color-primary-default']}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: theme['background-basic-color-1'],
    borderColor: theme['item-border-color'],
    borderBottomWidth: 0.5,
  },
  name: {
    textTransform: 'capitalize',
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    padding: 2,
  },
  labelDetailsView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioView: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

LabelItem.propTypes = propTypes;

const LabelItemComponent = withStyles(LabelItem, styles);

export default React.memo(LabelItemComponent);
