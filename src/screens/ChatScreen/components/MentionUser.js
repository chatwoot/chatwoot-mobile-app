import React from 'react';
import { Pressable } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import CustomText from 'components/Text';
import UserAvatar from 'components/UserAvatar';

const styles = (theme) => ({
  itemView: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border'],
    alignItems: 'center',
    backgroundColor: 'white',
  },
  lastItemView: {
    borderBottomWidth: 1,
    borderBottomColor: theme['color-border'],
  },
  name: {
    color: theme['color-primary-default'],
    fontWeight: theme['font-bold'],
    fontSize: 16,
    paddingLeft: 8,
  },
  content: {
    color: theme['color-primary-default'],
  },
});

const MentionUserComponent = ({
  name,
  email,
  lastItem,
  thumbnail,
  availabilityStatus,
  onUserSelect,
  eva: { theme, style },
}) => {
  return (
    <Pressable onPress={onUserSelect} style={style.itemView}>
      <UserAvatar
        thumbnail={thumbnail}
        userName={name}
        size={32}
        defaultBGColor={theme['color-primary-default']}
        isActive={availabilityStatus === 'online' ? true : false}
      />
      <CustomText style={style.name}>{`${name} - `}</CustomText>
      <CustomText style={style.email}>{email}</CustomText>
    </Pressable>
  );
};

MentionUserComponent.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired,
  lastItem: PropTypes.bool,
  eva: PropTypes.shape({
    theme: PropTypes.object,
    style: PropTypes.object,
  }).isRequired,
  onUserSelect: PropTypes.func.isRequired,
  availabilityStatus: PropTypes.string,
};

const MentionUser = withStyles(MentionUserComponent, styles);

export default MentionUser;
