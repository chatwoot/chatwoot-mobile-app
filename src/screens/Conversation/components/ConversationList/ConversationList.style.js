import { StyleSheet } from 'react-native';

export default theme => {
  const { colors, spacing } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    loadMoreView: {
      alignItems: 'center',
      paddingTop: spacing.small,
      paddingBottom: spacing.small,
      height: '100%',
    },
    conversationCountView: {
      paddingVertical: spacing.micro,
      paddingHorizontal: spacing.smaller,
      backgroundColor: colors.backgroundLight,
    },
  });
};
