import { StyleSheet } from 'react-native';

export default theme => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    avatarContainer: {
      paddingTop: spacing.smaller,
      paddingBottom: spacing.small,
    },
    detailsWrap: {
      paddingBottom: spacing.small,
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
    },
    descriptionContainer: {
      paddingVertical: spacing.micro,
    },
    description: {
      lineHeight: 20,
    },
    socialIconsContainer: {
      flexDirection: 'row',
    },
    separator: {
      backgroundColor: colors.backgroundLight,
      borderWidth: 0.4,
      borderColor: colors.borderLight,
      width: '100%',
      paddingVertical: spacing.smaller,
      paddingLeft: spacing.small,
    },
    separatorView: {
      width: '100%',
    },
    accordionItemWrapper: {
      flexDirection: 'column',
      paddingTop: spacing.small,
      paddingBottom: 10,
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
      width: '100%',
    },
  });
};
