import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles } from '@ui-kitten/components';
import { openURL } from 'src/helpers/UrlHelper';

import CustomText from './Text';

const styles = theme => ({
  itemTitleView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    paddingTop: 16,
  },
  itemTitle: {
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
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
  type: PropTypes.string,
};

const ConversationDetailsItem = ({ value, title, type, eva: { style, theme } }) => {
  const link = type === 'referer';
  return (
    <React.Fragment>
      <View key={type}>
        <View style={style.itemTitleView}>
          <CustomText style={style.itemTitle}>{title}</CustomText>
        </View>
        <View>
          {link ? (
            <CustomText
              style={[style.itemValue, { color: theme['color-primary-500'] }]}
              onPress={() => openURL({ URL: value })}>
              {value}
            </CustomText>
          ) : (
            <CustomText style={style.itemValue}>{value}</CustomText>
          )}
        </View>
      </View>
    </React.Fragment>
  );
};
ConversationDetailsItem.propTypes = propTypes;
export default withStyles(ConversationDetailsItem, styles);
