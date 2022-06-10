import { Radio, withStyles } from '@ui-kitten/components';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import CustomText from './Text';
import UserAvatar from './UserAvatar';

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  name: PropTypes.string,
  thumbnail: PropTypes.string,
  availabilityStatus: PropTypes.string,
  assigned: PropTypes.bool,
  onCheckedChange: PropTypes.func,
};
const AgentItemComponent = ({
  eva,
  name,
  thumbnail,
  availabilityStatus,
  assigned,
  onCheckedChange,
}) => {
  const { style, theme } = eva;

  const isActive = availabilityStatus === 'online' ? true : false;

  return (
    <TouchableOpacity activeOpacity={0.5} style={style.container}>
      <View style={style.itemView}>
        <View style={style.avatarView}>
          <UserAvatar
            thumbnail={thumbnail}
            size={30}
            fontSize={12}
            userName={name}
            defaultBGColor={theme['color-primary-default']}
            isActive={isActive}
            availabilityStatus={availabilityStatus}
          />
        </View>
        <View>
          <View style={style.nameView}>
            <CustomText style={style.name}>
              {name.length < 36 ? `${name}` : `${name.substring(0, 20)}...`}
            </CustomText>
          </View>
        </View>
      </View>
      <View style={style.radioView}>
        <Radio checked={assigned} onChange={onCheckedChange} />
      </View>
    </TouchableOpacity>
  );
};

const styles = theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme['background-basic-color-1'],
    borderColor: theme['item-border-color'],
    borderBottomWidth: 0.5,
  },
  itemView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    textTransform: 'capitalize',
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    padding: 2,
  },
  avatarView: {
    justifyContent: 'flex-end',
    marginRight: 16,
  },
  nameView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioView: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

AgentItemComponent.propTypes = propTypes;

const ChatMessageItem = withStyles(AgentItemComponent, styles);

export default React.memo(ChatMessageItem);
