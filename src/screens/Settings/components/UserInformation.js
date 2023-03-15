import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Pressable, UserAvatar } from 'components';
import { StyleSheet } from 'react-native';

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    profileView: {
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
      paddingVertical: spacing.small,
    },
    avatarView: {
      alignItems: 'flex-start',
      marginRight: spacing.smaller,
    },
    profileDetailsView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    nameView: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingVertical: spacing.smaller,
    },
    nameText: {
      paddingVertical: spacing.micro,
    },
  });
};

const propTypes = {
  status: PropTypes.string,
  thumbnail: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
};

const UserInformation = ({ status, thumbnail, name, email }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.profileView}>
      <View style={styles.avatarView}>
        <UserAvatar
          thumbnail={thumbnail}
          userName={name}
          size={72}
          fontSize={26}
          defaultBGColor={colors.primary}
          availabilityStatus={status}
        />
      </View>
      <Pressable style={styles.profileDetailsView}>
        <View style={styles.nameView}>
          <Text bold xl color={colors.textDark} style={styles.nameText}>
            {name}
          </Text>
          <Text medium sm color={colors.text} style={styles.emailText}>
            {email}
          </Text>
        </View>
        {/* <View>
          <Icon icon="arrow-chevron-right-outline" color={colors.textDark} size={26} />
        </View> */}
      </Pressable>
    </View>
  );
};

UserInformation.propTypes = propTypes;
export default UserInformation;
