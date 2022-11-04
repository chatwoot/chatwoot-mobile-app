import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const isAndroid = Platform.OS === 'android';

const createStyles = theme => {
  const { colors, spacing, borderRadius } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
      backgroundColor: colors.background,
    },
    itemView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarView: {
      alignSelf: 'center',
      marginRight: spacing.half,
    },
    contentView: {
      flex: 1,
      paddingTop: spacing.small,
      paddingBottom: spacing.small,
      borderColor: colors.backgroundDark,
      borderBottomWidth: 1,
    },
    avatarLoader: {
      width: spacing.full,
      height: spacing.full,
      borderRadius: borderRadius.full,
      backgroundColor: colors.backgroundDark,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    idInboxNameView: {
      width: 100,
      borderRadius: borderRadius.micro,
      height: spacing.half,
      backgroundColor: colors.backgroundDark,
    },
    labelView: {
      marginBottom: isAndroid ? spacing.small : spacing.micro,
      flexDirection: 'row',
      alignItems: 'center',
    },
    conversationDetails: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    nameView: {
      marginBottom: isAndroid ? spacing.small : spacing.micro,
      width: 160,
      borderRadius: borderRadius.micro,
      height: spacing.small,
      backgroundColor: colors.backgroundDark,
      flexDirection: 'row',
      alignItems: 'center',
    },
    chatContentView: {
      flexDirection: 'row',
      width: 200,
      borderRadius: borderRadius.micro,
      height: spacing.small,
      backgroundColor: colors.backgroundDark,
    },
    unreadTimestampContainer: {
      paddingTop: spacing.large,
      justifyContent: 'flex-end',
      flexDirection: 'column',
      position: 'absolute',
      right: spacing.zero,
    },
    timestampView: {
      width: 60,
      height: spacing.half,
      borderRadius: borderRadius.micro,
      backgroundColor: colors.backgroundDark,
    },
    badgeView: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      paddingTop: spacing.half,
    },
    badge: {
      width: spacing.small,
      height: spacing.small,
      borderRadius: spacing.small,
      backgroundColor: colors.backgroundDark,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};

const ConversationItemLoader = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Animatable.View
      animation="flash"
      easing="ease-out"
      iterationCount="infinite"
      duration={3000}
      style={styles.container}>
      <View style={styles.itemView}>
        <View style={styles.avatarView}>
          <View style={styles.avatarLoader} />
        </View>
        <View style={styles.contentView}>
          <View style={styles.labelView}>
            <View style={styles.idInboxNameView} />
          </View>
          <View style={styles.conversationDetails}>
            <View style={styles.nameView} />
            <View style={styles.chatContentView} />
          </View>
          <View style={styles.unreadTimestampContainer}>
            <View style={styles.timestampView} />
            <View style={styles.badgeView}>
              <View style={styles.badge} />
            </View>
          </View>
        </View>
      </View>
      <View>
        <View style={styles.timeStampLoader} />
      </View>
    </Animatable.View>
  );
};

export default ConversationItemLoader;
