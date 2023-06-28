import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { Text, UserAvatar, Pressable } from 'components';
import PropTypes from 'prop-types';

const createStyles = theme => {
  const { spacing, colors, borderRadius } = theme;
  return StyleSheet.create({
    itemView: {
      flexDirection: 'row',
      padding: spacing.smaller,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      borderRadius: borderRadius.micro,
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    name: {
      paddingLeft: spacing.smaller,
    },
  });
};

const MentionUserComponent = ({
  name,
  email,
  lastItem,
  thumbnail,
  availabilityStatus,
  onUserSelect,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable onPress={onUserSelect} style={styles.itemView}>
      <UserAvatar
        thumbnail={thumbnail}
        userName={name}
        size={24}
        fontSize={12}
        availabilityStatus={availabilityStatus}
      />
      <Text sm semiBold color={colors.primaryColorDark} style={styles.name}>
        {`${name} - `}
      </Text>
      <Text sm color={colors.textDark} style={styles.subHeaderTitle}>
        {email}
      </Text>
    </Pressable>
  );
};

MentionUserComponent.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired,
  lastItem: PropTypes.bool,
  onUserSelect: PropTypes.func.isRequired,
  availabilityStatus: PropTypes.string,
};

export default MentionUserComponent;
