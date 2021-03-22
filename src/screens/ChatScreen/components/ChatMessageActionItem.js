import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import { Divider, Icon, withStyles } from '@ui-kitten/components';

import CustomText from '../../../components/Text';
const styles = (theme) => ({
  section: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
    height: 60,
  },
  sectionTitleView: {
    flex: 8,
  },
  iconView: {
    paddingLeft: 6,
  },
  sectionText: {
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    paddingLeft: 8,
  },
  sectionActionView: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 4,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  name: PropTypes.string,
  text: PropTypes.string,
  itemType: PropTypes.string,
  onPressItem: PropTypes.func,
};

const ChatMessageActionItem = ({ text, itemType, name, onPressItem, eva: { style, theme } }) => {
  return (
    <React.Fragment>
      <TouchableOpacity style={style.section} onPress={() => onPressItem({ itemType })}>
        {itemType === 'copy' && (
          <View style={style.iconView}>
            <Icon
              name="copy-outline"
              fill={theme['color-primary-default']}
              width={26}
              height={26}
            />
          </View>
        )}
        <View style={style.sectionTitleView}>
          <CustomText style={style.sectionText}>{text}</CustomText>
        </View>
      </TouchableOpacity>
      <Divider />
    </React.Fragment>
  );
};

ChatMessageActionItem.propTypes = propTypes;

export default withStyles(ChatMessageActionItem, styles);
