import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import { Divider, Icon, withStyles } from '@ui-kitten/components';

import CustomText from './Text';
import UserAvatar from './UserAvatar';

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
  thumbnail: PropTypes.string,
  text: PropTypes.string,
  checked: PropTypes.bool,
  iconSize: PropTypes.string,
  itemType: PropTypes.string,
  onPressItem: PropTypes.func,
  availabilityStatus: PropTypes.string,
};

const ConversationActionItem = ({
  text,
  checked,
  iconSize,
  itemType,
  name,
  thumbnail,
  onPressItem,
  availabilityStatus,
  eva: { style, theme },
}) => {
  const isActive = availabilityStatus === 'online' ? true : false;
  return (
    <React.Fragment>
      <TouchableOpacity style={style.section} onPress={() => onPressItem({ itemType })}>
        <View style={style.sectionTitleView}>
          <CustomText style={style.sectionText}>{text}</CustomText>
        </View>
        <View style={style.sectionActionView}>
          {itemType === 'assignee' && thumbnail !== '' && (
            <UserAvatar
              thumbnail={thumbnail}
              userName={name}
              defaultBGColor={theme['color-primary-default']}
              isActive={isActive}
              size={36}
              availabilityStatus={availabilityStatus}
            />
          )}
          <CustomText style={style.sectionText}>{name}</CustomText>
          {itemType === 'assignee' && (
            <Icon
              name="arrow-ios-forward-outline"
              fill={theme['color-primary-default']}
              width={26}
              height={26}
            />
          )}
        </View>
      </TouchableOpacity>
      <Divider />
    </React.Fragment>
  );
};

ConversationActionItem.propTypes = propTypes;

export default withStyles(ConversationActionItem, styles);
