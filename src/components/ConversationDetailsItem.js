import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { Icon, withStyles } from '@ui-kitten/components';

import CustomText from './Text';

const styles = (theme) => ({
  itemTitleView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemTitle: {
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    marginLeft: 4,
  },
  itemValueView: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  itemValue: {
    color: theme['text-light-color'],
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-regular'],
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  title: PropTypes.string,
  value: PropTypes.string,
  iconName: PropTypes.string,
};

const ConversationDetailsItem = ({ iconName, value, title, eva: { style, theme } }) => {
  return (
    <React.Fragment>
      <View>
        <View style={style.itemTitleView}>
          <Icon name={iconName} height={18} width={18} fill={theme['color-primary-default']} />
          <CustomText style={style.itemTitle}>{title}</CustomText>
        </View>
        <View style={style.itemValueView}>
          <CustomText style={style.itemValue}>{value}</CustomText>
        </View>
      </View>
    </React.Fragment>
  );
};
ConversationDetailsItem.propTypes = propTypes;
export default withStyles(ConversationDetailsItem, styles);
