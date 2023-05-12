import { StyleSheet } from 'react-native';

export default theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    itemMainView: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      marginTop: spacing.small,
      paddingBottom: spacing.smaller,
      paddingLeft: spacing.medium,
      paddingRight: spacing.medium,
    },
    itemView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    notificationButtonView: {
      paddingLeft: spacing.medium,
      paddingRight: spacing.medium,
      paddingTop: spacing.large,
    },
    notificationButton: {
      flex: 1,
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
  });
};
