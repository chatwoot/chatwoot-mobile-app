import { StyleSheet } from 'react-native';

export default theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    headerView: {
      flexDirection: 'row',
      alignItems: 'center',
      maxWidth: 200,
      overflow: 'hidden',
    },
    titleView: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      marginHorizontal: spacing.smaller,
      height: spacing.large,
    },
    customerName: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoIcon: {
      marginLeft: spacing.micro,
    },
    chatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      paddingHorizontal: spacing.half,
      paddingVertical: spacing.half,
    },
    chatHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionIcon: {
      flexDirection: 'row',
    },
    loadingSpinner: {
      marginTop: spacing.tiny,
      paddingVertical: spacing.smaller,
      paddingHorizontal: spacing.smaller,
      marginLeft: spacing.micro,
    },
    inboxNameTypingWrap: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    inboxNameWrap: {
      marginTop: spacing.tiny,
    },
    statusView: {
      paddingVertical: spacing.smaller,
      paddingHorizontal: spacing.smaller,
      marginLeft: spacing.micro,
    },
    backButtonView: {
      paddingVertical: spacing.smaller,
      paddingLeft: spacing.micro,
      paddingRight: spacing.smaller,
    },
  });
};
