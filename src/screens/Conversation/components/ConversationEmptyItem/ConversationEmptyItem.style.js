import { StyleSheet, Platform } from 'react-native';
const isAndroid = Platform.OS === 'android';
export default theme => {
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
      marginRight: spacing.smaller,
    },
    avatarLoader: {
      width: spacing.larger,
      height: spacing.larger,
      borderRadius: borderRadius.full,
      backgroundColor: colors.backgroundDark,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentView: {
      flex: 1,
      paddingTop: spacing.small,
      paddingBottom: spacing.small,
      borderColor: colors.backgroundDark,
      borderBottomWidth: 1,
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
      marginTop: spacing.tiny,
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
